import os
import json
import joblib
import pandas as pd
from typing import Dict, Any
from ml.preprocessing.loader import load_stock_data
from ml.preprocessing.features import prepare_features, FEATURE_COLUMNS
from ml.training.train_price_models import SAVED_MODELS_DIR, train_all_price_models
from backend.app.services.stock_service import get_ticker_display_name

def load_metrics_summary() -> Dict[str, Any]:
    metrics_path = os.path.join(SAVED_MODELS_DIR, "model_metrics.json")
    if not os.path.exists(metrics_path):
        train_all_price_models()
    with open(metrics_path, "r") as f:
        return json.load(f)

def generate_prediction(ticker: str) -> Dict[str, Any]:
    ticker_clean = ticker.upper()
    display_name = get_ticker_display_name(ticker_clean)

    regressor_path = os.path.join(SAVED_MODELS_DIR, f"{ticker_clean}_regressor.pkl")
    classifier_path = os.path.join(SAVED_MODELS_DIR, f"{ticker_clean}_classifier.pkl")
    scaler_path = os.path.join(SAVED_MODELS_DIR, f"{ticker_clean}_scaler.pkl")

    if not (os.path.exists(regressor_path) and os.path.exists(classifier_path) and os.path.exists(scaler_path)):
        print(f"Models for {ticker_clean} not found. Training all ticker models...")
        train_all_price_models()

    regressor = joblib.load(regressor_path)
    classifier = joblib.load(classifier_path)
    scaler = joblib.load(scaler_path)
    
    metrics_summary = load_metrics_summary()
    ticker_metrics = metrics_summary.get(ticker_clean, {})

    # Load latest feature row from historical stock data
    df_raw = load_stock_data(ticker_clean)
    df_feat = prepare_features(df_raw)

    latest_row = df_feat.iloc[-1]
    current_close = float(latest_row['close'])
    latest_date_str = latest_row['date'].strftime('%Y-%m-%d')

    X_latest = latest_row[FEATURE_COLUMNS].values.reshape(1, -1)
    X_scaled = scaler.transform(X_latest)

    predicted_next_close = float(regressor.predict(X_scaled)[0])
    predicted_dir_code = int(classifier.predict(X_scaled)[0])
    predicted_dir_str = "UP" if predicted_dir_code == 1 else "DOWN"

    price_change = predicted_next_close - current_close
    price_change_percent = (price_change / current_close) * 100

    best_reg_info = ticker_metrics.get("best_regressor", {})
    best_cls_info = ticker_metrics.get("best_classifier", {})

    return {
        "ticker": ticker_clean,
        "display_name": display_name,
        "latest_date": latest_date_str,
        "current_close": round(current_close, 2),
        "predicted_next_close": round(predicted_next_close, 2),
        "price_change": round(price_change, 2),
        "price_change_percent": round(price_change_percent, 2),
        "predicted_direction": predicted_dir_str,
        "regressor_model_used": best_reg_info.get("name", "Random Forest Regressor"),
        "classifier_model_used": best_cls_info.get("name", "Random Forest Classifier"),
        "regressor_test_r2": round(best_reg_info.get("test_metrics", {}).get("r2", 0.0), 4),
        "classifier_test_accuracy": round(best_cls_info.get("test_metrics", {}).get("accuracy", 0.0), 4),
    }
