import os
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Budget Forecast API",
    description="API for forecasting company budget (revenue and expenditure) for the next quarter",
    version="1.0.0"
)

# Add CORS middleware to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained models
MODEL_DIR = "//home/jophin/Desktop/project/Paisawise/model"
revenue_model = joblib.load(os.path.join(MODEL_DIR, "revenue_model.joblib"))
expenditure_model = joblib.load(os.path.join(MODEL_DIR, "expenditure_model.joblib"))

# Load Random Forest models if available
RF_MODEL_DIR = os.path.join(MODEL_DIR, "random_forest")
rf_revenue_model = None
rf_expenditure_model = None

if os.path.exists(os.path.join(RF_MODEL_DIR, "revenue_model_rf.joblib")):
    rf_revenue_model = joblib.load(os.path.join(RF_MODEL_DIR, "revenue_model_rf.joblib"))
    rf_expenditure_model = joblib.load(os.path.join(RF_MODEL_DIR, "expenditure_model_rf.joblib"))

# Load the feature scaler
scaler = joblib.load(os.path.join(MODEL_DIR, "feature_scaler.joblib"))

# Define input data model
class QuarterData(BaseModel):
    revenue: float = Field(..., gt=0, description="Quarterly revenue")
    expenditure: float = Field(..., gt=0, description="Quarterly expenditure")
    gross_profit: float = Field(..., description="Quarterly gross profit (revenue - expenditure)")
    
    @validator('gross_profit')
    def validate_gross_profit(cls, v, values):
        if 'revenue' in values and 'expenditure' in values:
            expected_gross_profit = values['revenue'] - values['expenditure']
            if abs(v - expected_gross_profit) > 0.01:
                raise ValueError(f"Gross profit should equal revenue - expenditure. Expected: {expected_gross_profit}")
        return v

class ForecastRequest(BaseModel):
    company_name: Optional[str] = Field(None, description="Company name (optional)")
    past_quarters: List[QuarterData] = Field(..., min_items=4, max_items=4, description="Financial data for the past 4 quarters (oldest to newest)")

class ForecastResponse(BaseModel):
    company_name: Optional[str] = None
    next_quarter_revenue: float
    next_quarter_expenditure: float
    next_quarter_gross_profit: float
    confidence_score: float

@app.get("/")
async def root():
    return {"message": "Budget Forecast API is running. Access /docs for API documentation."}

@app.post("/forecast", response_model=ForecastResponse)
async def forecast(
    request: ForecastRequest = Body(...),
    model_type: str = Query("default", description="Model type to use for prediction: 'default' or 'random_forest'")
):
    try:
        # Check if Random Forest models are available when requested
        if model_type == "random_forest" and (rf_revenue_model is None or rf_expenditure_model is None):
            return {"error": "Random Forest models are not available. Please use 'default' model type."}
        
        # Extract features from the request
        quarters = request.past_quarters
        
        # Determine scale factor based on input data
        # If the average revenue is less than 1 million, we'll scale up for prediction
        avg_revenue = sum(q.revenue for q in quarters) / len(quarters)
        avg_expenditure = sum(q.expenditure for q in quarters) / len(quarters)
        scale_factor = 1.0
        
        # If average revenue is less than 1 million, apply scaling
        if avg_revenue < 1000000:
            # Calculate appropriate scale factor (roughly to millions)
            magnitude = np.log10(avg_revenue)
            if magnitude < 6:  # Less than 1 million
                scale_factor = 10 ** (6 - int(magnitude))
        
        # Create feature array
        features = []
        
        # Add features in reverse order (most recent first)
        for i, quarter in enumerate(reversed(quarters)):
            lag = i + 1
            # Apply scaling to input features if needed
            scaled_revenue = quarter.revenue * scale_factor
            scaled_expenditure = quarter.expenditure * scale_factor
            scaled_gross_profit = quarter.gross_profit * scale_factor
            
            features.extend([
                scaled_revenue,
                scaled_expenditure,
                scaled_gross_profit,
                scaled_revenue + scaled_gross_profit  # Total income approximation
            ])
        
        # Reshape features to match model input
        feature_names = []
        for lag in range(1, 5):
            for metric in ['Revenue', 'Expenditure', 'Gross_Profit', 'Total_Income']:
                feature_names.append(f"{metric}_Lag{lag}")
        
        # Create DataFrame with correct feature names
        features_df = pd.DataFrame([features], columns=feature_names)
        
        # Scale features
        scaled_features = scaler.transform(features_df)
        
        # Make predictions based on selected model type
        if model_type == "random_forest" and rf_revenue_model is not None:
            revenue_prediction = rf_revenue_model.predict(scaled_features)[0]
            expenditure_prediction = rf_expenditure_model.predict(scaled_features)[0]
            confidence_score = 0.88  # Based on RF model evaluation
        else:
            revenue_prediction = revenue_model.predict(scaled_features)[0]
            expenditure_prediction = expenditure_model.predict(scaled_features)[0]
            confidence_score = 0.89  # Based on default model evaluation
        
        # Scale predictions back down if we scaled up
        if scale_factor > 1.0:
            revenue_prediction = revenue_prediction / scale_factor
            expenditure_prediction = expenditure_prediction / scale_factor
        
        # Additional adjustment for expenditure to maintain similar ratio as input
        # This helps ensure the expenditure prediction is more aligned with the input pattern
        input_rev_exp_ratio = avg_revenue / avg_expenditure if avg_expenditure > 0 else 1
        predicted_rev_exp_ratio = revenue_prediction / expenditure_prediction if expenditure_prediction > 0 else 1
        
        # If the predicted ratio is significantly different from the input ratio, adjust expenditure
        if abs(input_rev_exp_ratio - predicted_rev_exp_ratio) / input_rev_exp_ratio > 0.3:  # 30% threshold
            expenditure_prediction = revenue_prediction / input_rev_exp_ratio
        
        # Calculate gross profit
        gross_profit_prediction = revenue_prediction - expenditure_prediction
        
        # Create response
        response = ForecastResponse(
            company_name=request.company_name,
            next_quarter_revenue=float(revenue_prediction),
            next_quarter_expenditure=float(expenditure_prediction),
            next_quarter_gross_profit=float(gross_profit_prediction),
            confidence_score=confidence_score
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/models")
async def get_available_models():
    """Get information about available prediction models"""
    models = {
        "default": {
            "revenue": "Lasso Regression (92.00% accuracy)",
            "expenditure": "Ridge Regression (86.69% accuracy)",
            "overall_accuracy": "89.08%"
        }
    }
    
    if rf_revenue_model is not None and rf_expenditure_model is not None:
        models["random_forest"] = {
            "revenue": "Random Forest (91.61% accuracy)",
            "expenditure": "Random Forest (84.97% accuracy)",
            "overall_accuracy": "88.29%"
        }
    
    return {
        "available_models": list(models.keys()),
        "model_details": models
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
