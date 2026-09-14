import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
try:
    from xgboost import XGBRegressor, XGBClassifier
    HAS_XGB = True
except ImportError:
    from sklearn.ensemble import GradientBoostingRegressor as XGBRegressor
    from sklearn.ensemble import GradientBoostingClassifier as XGBClassifier
    HAS_XGB = False

from sklearn.metrics import (
    mean_absolute_error, 
    root_mean_squared_error, 
    mean_absolute_percentage_error, 
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

from ml.preprocessing.loader import TICKERS, load_stock_data
from ml.preprocessing.features import prepare_features, chronological_split, create_scaled_dataset, FEATURE_COLUMNS

SAVED_MODELS_DIR = os.path.join("ml", "saved_models")

def evaluate_regressor(model, X, y_true):
    y_pred = model.predict(X)
    mae = mean_absolute_error(y_true, y_pred)
    rmse = root_mean_squared_error(y_true, y_pred)
    mape = mean_absolute_percentage_error(y_true, y_pred) * 100
    r2 = r2_score(y_true, y_pred)
    return {"mae": float(mae), "rmse": float(rmse), "mape": float(mape), "r2": float(r2)}, y_pred

def evaluate_classifier(model, X, y_true):
    y_pred = model.predict(X)
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    return {"accuracy": float(acc), "precision": float(prec), "recall": float(rec), "f1": float(f1)}, y_pred

def train_price_models_for_ticker(ticker: str) -> Dict[str, Any]:
    print(f"\n==========================================")
    print(f"  Training ML Models for Ticker: {ticker}")
    print(f"==========================================")
    
    df_raw = load_stock_data(ticker)
    df_feat = prepare_features(df_raw)
    
    train_df, val_df, test_df = chronological_split(df_feat, train_ratio=0.70, val_ratio=0.15)
    print(f"Dataset Split: Train={len(train_df)} | Val={len(val_df)} | Test={len(test_df)}")

    ds = create_scaled_dataset(train_df, val_df, test_df, FEATURE_COLUMNS)
    
    # ----------------------------------------------------
    # 1. EVALUATE REGRESSION MODELS (Target: Next Close)
    # ----------------------------------------------------
    reg_candidates = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
        "XGBoost": XGBRegressor(n_estimators=100, learning_rate=0.05, random_state=42, n_jobs=-1) if HAS_XGB 
                    else XGBRegressor(n_estimators=100, learning_rate=0.05, random_state=42)
    }

    best_reg_name = None
    best_reg_model = None
    best_reg_val_r2 = -float("inf")
    reg_val_results = {}

    for name, model in reg_candidates.items():
        # Fit on scaled train data
        model.fit(ds['X_train_scaled'], ds['y_reg_train'])
        val_metrics, _ = evaluate_regressor(model, ds['X_val_scaled'], ds['y_reg_val'])
        reg_val_results[name] = val_metrics
        print(f"  [Val Regressor] {name:18s} -> R²: {val_metrics['r2']:.4f} | MAE: {val_metrics['mae']:.2f} | MAPE: {val_metrics['mape']:.2f}%")
        
        if val_metrics['r2'] > best_reg_val_r2:
            best_reg_val_r2 = val_metrics['r2']
            best_reg_name = name
            best_reg_model = model

    # Evaluate best regressor ONCE on untouched TEST set
    test_reg_metrics, _ = evaluate_regressor(best_reg_model, ds['X_test_scaled'], ds['y_reg_test'])
    print(f"  >>> BEST REGRESSOR: {best_reg_name}")
    print(f"      TEST METRICS -> R²: {test_reg_metrics['r2']:.4f} | MAE: {test_reg_metrics['mae']:.2f} | RMSE: {test_reg_metrics['rmse']:.2f} | MAPE: {test_reg_metrics['mape']:.2f}%")

    # ----------------------------------------------------
    # 2. EVALUATE DIRECTION CLASSIFIERS (Target: UP / DOWN)
    # ----------------------------------------------------
    cls_candidates = {
        "Random Forest Classifier": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        "XGBoost Classifier": XGBClassifier(n_estimators=100, learning_rate=0.05, random_state=42, n_jobs=-1) if HAS_XGB 
                            else XGBClassifier(n_estimators=100, learning_rate=0.05, random_state=42)
    }

    best_cls_name = None
    best_cls_model = None
    best_cls_val_acc = -1.0
    cls_val_results = {}

    for name, model in cls_candidates.items():
        model.fit(ds['X_train_scaled'], ds['y_cls_train'])
        val_metrics, _ = evaluate_classifier(model, ds['X_val_scaled'], ds['y_cls_val'])
        cls_val_results[name] = val_metrics
        print(f"  [Val Classifier] {name:25s} -> Acc: {val_metrics['accuracy']:.4f} | F1: {val_metrics['f1']:.4f}")

        if val_metrics['accuracy'] > best_cls_val_acc:
            best_cls_val_acc = val_metrics['accuracy']
            best_cls_name = name
            best_cls_model = model

    test_cls_metrics, _ = evaluate_classifier(best_cls_model, ds['X_test_scaled'], ds['y_cls_test'])
    print(f"  >>> BEST CLASSIFIER: {best_cls_name}")
    print(f"      TEST METRICS -> Accuracy: {test_cls_metrics['accuracy']:.4f} | Precision: {test_cls_metrics['precision']:.4f} | Recall: {test_cls_metrics['recall']:.4f} | F1: {test_cls_metrics['f1']:.4f}")

    # Save best models & scaler
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)
    joblib.dump(best_reg_model, os.path.join(SAVED_MODELS_DIR, f"{ticker}_regressor.pkl"))
    joblib.dump(best_cls_model, os.path.join(SAVED_MODELS_DIR, f"{ticker}_classifier.pkl"))
    joblib.dump(ds['scaler'], os.path.join(SAVED_MODELS_DIR, f"{ticker}_scaler.pkl"))

    summary = {
        "ticker": ticker,
        "sample_counts": {"train": len(train_df), "val": len(val_df), "test": len(test_df)},
        "best_regressor": {
            "name": best_reg_name,
            "val_metrics": reg_val_results[best_reg_name],
            "test_metrics": test_reg_metrics
        },
        "best_classifier": {
            "name": best_cls_name,
            "val_metrics": cls_val_results[best_cls_name],
            "test_metrics": test_cls_metrics
        },
        "all_reg_val_metrics": reg_val_results,
        "all_cls_val_metrics": cls_val_results,
        "latest_close": float(df_feat['close'].iloc[-1]),
        "latest_date": str(df_feat['date'].iloc[-1].strftime("%Y-%m-%d")),
    }
    return summary

def train_all_price_models() -> Dict[str, Any]:
    all_summaries = {}
    for ticker in TICKERS:
        summary = train_price_models_for_ticker(ticker)
        all_summaries[ticker] = summary

    metrics_file = os.path.join(SAVED_MODELS_DIR, "model_metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(all_summaries, f, indent=2)
        
    print(f"\nAll price prediction models trained and saved. Metrics written to {metrics_file}")
    return all_summaries

if __name__ == "__main__":
    train_all_price_models()
