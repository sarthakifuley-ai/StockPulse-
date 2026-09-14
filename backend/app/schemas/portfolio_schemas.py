from pydantic import BaseModel
from typing import List, Optional
import datetime

class PortfolioItemCreate(BaseModel):
    ticker: str
    quantity: float
    purchase_price: float
    purchase_date: Optional[str] = None

class PortfolioItemResponse(BaseModel):
    id: int
    user_id: int
    ticker: str
    quantity: float
    purchase_price: float
    purchase_date: Optional[str] = None
    current_price: float
    total_invested: float
    current_value: float
    profit_loss: float
    profit_loss_percent: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PortfolioSummaryResponse(BaseModel):
    total_invested: float
    total_current_value: float
    total_profit_loss: float
    total_profit_loss_percent: float
    total_items: int
    holdings: List[PortfolioItemResponse]
