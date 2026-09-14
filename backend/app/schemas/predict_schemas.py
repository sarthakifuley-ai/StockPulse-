from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime

class PredictionRequest(BaseModel):
    ticker: str

class PredictionResponse(BaseModel):
    ticker: str
    display_name: str
    latest_date: str
    current_close: float
    predicted_next_close: float
    price_change: float
    price_change_percent: float
    predicted_direction: str  # 'UP' or 'DOWN'
    regressor_model_used: str
    classifier_model_used: str
    regressor_test_r2: float
    classifier_test_accuracy: float
    saved_record_id: Optional[int] = None

class PredictionHistoryItem(BaseModel):
    id: int
    user_id: int
    ticker: str
    prediction_date: str
    horizon: str
    predicted_price: float
    predicted_direction: str
    model_used: str
    confidence_score: Optional[float] = None
    actual_price: Optional[float] = None
    prediction_error: Optional[float] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
