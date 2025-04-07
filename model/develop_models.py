import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os

# Create model directory if it doesn't exist
os.makedirs('../model', exist_ok=True)
os.makedirs('../model/plots', exist_ok=True)

def load_preprocessed_data():
    """Load the preprocessed data"""
    df = pd.read_csv('../data/preprocessed_data.csv')
    return df

def split_data(df, features, targets, test_size=0.2, random_state=42):
    """Split data into training and testing sets"""
    # Get unique company IDs
    companies = df['Company_ID'].unique()
    
    # Split companies into train and test sets to avoid data leakage
    train_companies, test_companies = train_test_split(
        companies, test_size=test_size, random_state=random_state
    )
    
    # Create train and test dataframes
    train_df = df[df['Company_ID'].isin(train_companies)]
    test_df = df[df['Company_ID'].isin(test_companies)]
    
    # Extract features and targets
    X_train = train_df[features]
    y_train_revenue = train_df['Revenue']
    y_train_expenditure = train_df['Expenditure']
    
    X_test = test_df[features]
    y_test_revenue = test_df['Revenue']
    y_test_expenditure = test_df['Expenditure']
    
    print(f"Training set size: {len(X_train)} samples")
    print(f"Testing set size: {len(X_test)} samples")
    
    return (X_train, y_train_revenue, y_train_expenditure, 
            X_test, y_test_revenue, y_test_expenditure,
            train_df, test_df)

def train_linear_models(X_train, y_train_revenue, y_train_expenditure):
    """Train linear regression models for revenue and expenditure prediction"""
    models = {
        'Linear Regression': LinearRegression(),
        'Ridge Regression': Ridge(),
        'Lasso Regression': Lasso(),
        'ElasticNet': ElasticNet()
    }
    
    trained_models = {}
    
    for target_name, y_train in [('Revenue', y_train_revenue), ('Expenditure', y_train_expenditure)]:
        target_models = {}
        
        for model_name, model in models.items():
            print(f"Training {model_name} for {target_name}...")
            
            # For regularized models, perform grid search to find best parameters
            if model_name != 'Linear Regression':
                param_grid = {'alpha': [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]}
                if model_name == 'ElasticNet':
                    param_grid['l1_ratio'] = [0.1, 0.3, 0.5, 0.7, 0.9]
                
                grid_search = GridSearchCV(model, param_grid, cv=5, scoring='neg_mean_squared_error')
                grid_search.fit(X_train, y_train)
                
                best_model = grid_search.best_estimator_
                print(f"Best parameters for {model_name}: {grid_search.best_params_}")
                target_models[model_name] = best_model
            else:
                model.fit(X_train, y_train)
                target_models[model_name] = model
        
        trained_models[target_name] = target_models
    
    return trained_models

def train_tree_models(X_train, y_train_revenue, y_train_expenditure):
    """Train tree-based models for revenue and expenditure prediction"""
    models = {
        'Random Forest': RandomForestRegressor(random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(random_state=42)
    }
    
    trained_models = {}
    # Store individual RF models for separate saving
    rf_models = {}
    
    for target_name, y_train in [('Revenue', y_train_revenue), ('Expenditure', y_train_expenditure)]:
        target_models = {}
        
        for model_name, model in models.items():
            print(f"Training {model_name} for {target_name}...")
            
            # Define parameter grid for grid search
            if model_name == 'Random Forest':
                param_grid = {
                    'n_estimators': [50, 100],
                    'max_depth': [None, 10, 20],
                    'min_samples_split': [2, 5]
                }
            else:  # Gradient Boosting
                param_grid = {
                    'n_estimators': [50, 100],
                    'learning_rate': [0.01, 0.1],
                    'max_depth': [3, 5]
                }
            
            # Perform grid search
            grid_search = GridSearchCV(model, param_grid, cv=5, scoring='neg_mean_squared_error')
            grid_search.fit(X_train, y_train)
            
            best_model = grid_search.best_estimator_
            print(f"Best parameters for {model_name}: {grid_search.best_params_}")
            target_models[model_name] = best_model
            
            # Store RF models separately
            if model_name == 'Random Forest':
                rf_models[target_name] = best_model
        
        trained_models[target_name] = target_models
    
    return trained_models, rf_models

def evaluate_models(models, X_test, y_test_revenue, y_test_expenditure):
    """Evaluate trained models on test data"""
    results = {}
    
    for target_name, target_models in models.items():
        y_test = y_test_revenue if target_name == 'Revenue' else y_test_expenditure
        target_results = {}
        
        for model_name, model in target_models.items():
            # Make predictions
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Calculate MAPE (Mean Absolute Percentage Error)
            mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
            
            # Calculate accuracy as 100 - MAPE (capped at 0 if MAPE > 100)
            accuracy = max(0, 100 - mape)
            
            # Store results
            model_results = {
                'MSE': mse,
                'RMSE': rmse,
                'MAE': mae,
                'R2': r2,
                'MAPE': mape,
                'Accuracy': accuracy
            }
            
            target_results[model_name] = model_results
            
            print(f"{target_name} - {model_name}:")
            print(f"  RMSE: {rmse:.2f}")
            print(f"  MAE: {mae:.2f}")
            print(f"  R2: {r2:.4f}")
            print(f"  Accuracy: {accuracy:.2f}%")
        
        results[target_name] = target_results
    
    return results

def visualize_results(results, train_df, test_df, models, X_test, y_test_revenue, y_test_expenditure):
    """Visualize model evaluation results"""
    
    # Create bar chart of model accuracies
    plt.figure(figsize=(12, 6))
    
    # Plot Revenue model accuracies
    revenue_accuracies = [results['Revenue'][model]['Accuracy'] for model in results['Revenue']]
    expenditure_accuracies = [results['Expenditure'][model]['Accuracy'] for model in results['Expenditure']]
    
    x = np.arange(len(results['Revenue']))
    width = 0.35
    
    plt.bar(x - width/2, revenue_accuracies, width, label='Revenue')
    plt.bar(x + width/2, expenditure_accuracies, width, label='Expenditure')
    
    plt.xlabel('Model')
    plt.ylabel('Accuracy (%)')
    plt.title('Model Accuracy Comparison')
    plt.xticks(x, list(results['Revenue'].keys()), rotation=45)
    plt.axhline(y=70, color='r', linestyle='--', label='Target Accuracy (70%)')
    plt.legend()
    plt.tight_layout()
    plt.savefig('../model/plots/model_accuracy_comparison.png')
    
    # Create scatter plots of actual vs predicted values for the best models
    # Find best model for each target
    best_revenue_model = max(results['Revenue'].items(), key=lambda x: x[1]['Accuracy'])
    best_expenditure_model = max(results['Expenditure'].items(), key=lambda x: x[1]['Accuracy'])
    
    print(f"Best model for Revenue: {best_revenue_model[0]} with accuracy {best_revenue_model[1]['Accuracy']:.2f}%")
    print(f"Best model for Expenditure: {best_expenditure_model[0]} with accuracy {best_expenditure_model[1]['Accuracy']:.2f}%")
    
    # Plot actual vs predicted for best Revenue model
    plt.figure(figsize=(10, 6))
    y_pred_revenue = models['Revenue'][best_revenue_model[0]].predict(X_test)
    plt.scatter(y_test_revenue, y_pred_revenue, alpha=0.5)
    plt.plot([y_test_revenue.min(), y_test_revenue.max()], [y_test_revenue.min(), y_test_revenue.max()], 'r--')
    plt.xlabel('Actual Revenue')
    plt.ylabel('Predicted Revenue')
    plt.title(f'Actual vs Predicted Revenue ({best_revenue_model[0]})')
    plt.grid(True)
    plt.savefig('../model/plots/revenue_actual_vs_predicted.png')
    
    # Plot actual vs predicted for best Expenditure model
    plt.figure(figsize=(10, 6))
    y_pred_expenditure = models['Expenditure'][best_expenditure_model[0]].predict(X_test)
    plt.scatter(y_test_expenditure, y_pred_expenditure, alpha=0.5)
    plt.plot([y_test_expenditure.min(), y_test_expenditure.max()], [y_test_expenditure.min(), y_test_expenditure.max()], 'r--')
    plt.xlabel('Actual Expenditure')
    plt.ylabel('Predicted Expenditure')
    plt.title(f'Actual vs Predicted Expenditure ({best_expenditure_model[0]})')
    plt.grid(True)
    plt.savefig('../model/plots/expenditure_actual_vs_predicted.png')
    
    # Plot feature importance for tree-based models
    if best_revenue_model[0] in ['Random Forest', 'Gradient Boosting']:
        plt.figure(figsize=(12, 6))
        feature_importances = models['Revenue'][best_revenue_model[0]].feature_importances_
        features = X_test.columns
        indices = np.argsort(feature_importances)[::-1]
        
        plt.bar(range(len(feature_importances)), feature_importances[indices])
        plt.xticks(range(len(feature_importances)), [features[i] for i in indices], rotation=90)
        plt.xlabel('Features')
        plt.ylabel('Importance')
        plt.title(f'Feature Importance for Revenue Prediction ({best_revenue_model[0]})')
        plt.tight_layout()
        plt.savefig('../model/plots/revenue_feature_importance.png')
    
    if best_expenditure_model[0] in ['Random Forest', 'Gradient Boosting']:
        plt.figure(figsize=(12, 6))
        feature_importances = models['Expenditure'][best_expenditure_model[0]].feature_importances_
        features = X_test.columns
        indices = np.argsort(feature_importances)[::-1]
        
        plt.bar(range(len(feature_importances)), feature_importances[indices])
        plt.xticks(range(len(feature_importances)), [features[i] for i in indices], rotation=90)
        plt.xlabel('Features')
        plt.ylabel('Importance')
        plt.title(f'Feature Importance for Expenditure Prediction ({best_expenditure_model[0]})')
        plt.tight_layout()
        plt.savefig('../model/plots/expenditure_feature_importance.png')
    
    # Close all plots
    plt.close('all')
    
    return best_revenue_model[0], best_expenditure_model[0]

def save_best_models(models, best_revenue_model_name, best_expenditure_model_name):
    """Save the best models for deployment"""
    best_revenue_model = models['Revenue'][best_revenue_model_name]
    best_expenditure_model = models['Expenditure'][best_expenditure_model_name]
    
    # Save models
    joblib.dump(best_revenue_model, '../model/revenue_model.joblib')
    joblib.dump(best_expenditure_model, '../model/expenditure_model.joblib')
    
    print(f"Best models saved to model directory:")
    print(f"  Revenue: {best_revenue_model_name}")
    print(f"  Expenditure: {best_expenditure_model_name}")

def main():
    print("Developing forecasting models for budget prediction...")
    
    # Load preprocessed data
    df = load_preprocessed_data()
    
    # Define features and targets
    features = [col for col in df.columns if 'Lag' in col]
    targets = ['Revenue', 'Expenditure']
    
    # Split data into training and testing sets
    (X_train, y_train_revenue, y_train_expenditure, 
     X_test, y_test_revenue, y_test_expenditure,
     train_df, test_df) = split_data(df, features, targets)
    
    # Train linear models
    print("\nTraining linear models...")
    linear_models = train_linear_models(X_train, y_train_revenue, y_train_expenditure)
    
    # Train tree-based models
    print("\nTraining tree-based models...")
    tree_models, rf_models = train_tree_models(X_train, y_train_revenue, y_train_expenditure)
    
    # Combine all models
    all_models = {
        'Revenue': {**linear_models['Revenue'], **tree_models['Revenue']},
        'Expenditure': {**linear_models['Expenditure'], **tree_models['Expenditure']}
    }
    
    # Evaluate models
    print("\nEvaluating models...")
    results = evaluate_models(all_models, X_test, y_test_revenue, y_test_expenditure)
    
    # Visualize results
    print("\nVisualizing results...")
    best_revenue_model, best_expenditure_model = visualize_results(
        results, train_df, test_df, all_models, X_test, y_test_revenue, y_test_expenditure
    )
    
    # Save best models
    print("\nSaving best models...")
    save_best_models(all_models, best_revenue_model, best_expenditure_model)
    
    # Save Random Forest models
    print("\nSaving Random Forest models...")
    os.makedirs('../model/random_forest', exist_ok=True)
    
    # Extract RF models from the rf_models dictionary
    rf_revenue = rf_models['Revenue']
    rf_expenditure = rf_models['Expenditure']
    
    joblib.dump(rf_revenue, '../model/random_forest/revenue_model_rf.joblib')
    joblib.dump(rf_expenditure, '../model/random_forest/expenditure_model_rf.joblib')
    
    print("\nModel development completed.")

if __name__ == "__main__":
    main()
