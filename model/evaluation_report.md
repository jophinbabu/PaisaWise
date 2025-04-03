# Budget Forecasting Model Evaluation Report

## Executive Summary

The budget forecasting model has been evaluated on a synthetic dataset of 50 companies across multiple quarters. The model predicts company revenue and expenditure for the next quarter based on financial data from the previous 4 quarters.

**Overall Performance:**
- Revenue Prediction Accuracy: 91.66%
- Expenditure Prediction Accuracy: 86.51%
- Combined Accuracy: 89.08%

**Target Achievement:**
- Target Accuracy: 70%
- Companies Meeting Target: 50 out of 50 (100.00%)

## Model Details

The forecasting solution uses two separate models:
1. **Revenue Model**: Lasso Regression
2. **Expenditure Model**: Ridge Regression

These models were selected after evaluating multiple approaches including Linear Regression, Ridge, Lasso, ElasticNet, Random Forest, and Gradient Boosting. The selected models provide the best balance of accuracy and generalization.

## Performance Across Companies

The model performance varies across different companies:

- **Best Performing Company**: Company 10 with 93.28% accuracy
- **Worst Performing Company**: Company 29 with 79.93% accuracy

The distribution of model accuracy across companies shows that the majority of companies have prediction accuracy well above the 70% target threshold.

## Performance Over Time

The model performance across different quarters shows:

- **Best Quarter**: Q3 2022 with 91.73% accuracy
- **Worst Quarter**: Q1 2022 with 78.81% accuracy

The model maintains consistent performance across different time periods, indicating good stability and generalization.

## Conclusion

The budget forecasting model exceeds the target accuracy of 70% by a significant margin, with an overall accuracy of 89.08%. The model performs well across different companies and time periods, demonstrating its robustness and reliability for budget forecasting applications.

The model is ready for integration into the backend API to provide forecasting capabilities for the frontend application.

## Visualizations

Visualizations of the evaluation results can be found in the `model/evaluation_plots` directory:
- Company accuracy distribution
- Top and bottom performing companies
- Accuracy over time
