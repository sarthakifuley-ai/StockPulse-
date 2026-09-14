from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.db.session import get_db
from backend.app.db.models import User, PredictionRecord
from backend.app.schemas.predict_schemas import PredictionRequest, PredictionResponse, PredictionHistoryItem
from backend.app.services.predict_service import generate_prediction, load_metrics_summary
from backend.app.services.stock_service import load_stock_data
from backend.app.routes.dependencies import get_current_user

router = APIRouter(prefix="/predict", tags=["Stock Price & Direction Prediction"])

@router.post("/generate", response_model=PredictionResponse)
def predict_stock(
    req: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate next-day price and direction prediction using trained ML models and store in prediction history."""
    try:
        pred_res = generate_prediction(req.ticker)
        
        # Save record in database for logged in user
        record = PredictionRecord(
            user_id=current_user.id,
            ticker=pred_res['ticker'],
            prediction_date=pred_res['latest_date'],
            horizon="1_DAY",
            predicted_price=pred_res['predicted_next_close'],
            predicted_direction=pred_res['predicted_direction'],
            model_used=pred_res['regressor_model_used'],
            confidence_score=pred_res['classifier_test_accuracy']
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        pred_res['saved_record_id'] = record.id
        return pred_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
def get_all_model_metrics():
    """Get training and evaluation metrics (MAE, RMSE, MAPE, R², Accuracy, F1) for all trained models."""
    try:
        return load_metrics_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[PredictionHistoryItem])
def get_user_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve logged prediction history for current user and compute prediction error against actual data if available."""
    records = db.query(PredictionRecord).filter(PredictionRecord.user_id == current_user.id).order_by(PredictionRecord.created_at.desc()).all()
    
    # Update actual prices if missing
    for rec in records:
        if rec.actual_price is None:
            try:
                df = load_stock_data(rec.ticker)
                # Find if there is a record after prediction date
                matching = df[df['date'].dt.strftime('%Y-%m-%d') > rec.prediction_date]
                if not matching.empty:
                    actual = float(matching.iloc[0]['close'])
                    err = abs(rec.predicted_price - actual)
                    rec.actual_price = round(actual, 2)
                    rec.prediction_error = round(err, 2)
                    db.commit()
                    db.refresh(rec)
            except Exception as e:
                pass
                
    return records
