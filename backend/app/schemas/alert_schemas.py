from pydantic import BaseModel
from typing import Optional, List
import datetime

class PriceAlertCreate(BaseModel):
    ticker: str
    condition: str  # 'GREATER_EQUAL' or 'LESS_EQUAL'
    target_price: float

class PriceAlertResponse(BaseModel):
    id: int
    user_id: int
    ticker: str
    condition: str
    target_price: float
    is_active: bool
    is_triggered: bool
    current_price: float
    triggered_at: Optional[datetime.datetime] = None
    triggered_price: Optional[float] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
