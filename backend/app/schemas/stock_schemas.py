from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class StockSummary(BaseModel):
    ticker: str
    display_name: str
    latest_date: str
    latest_close: float
    previous_close: float
    change: float
    change_percent: float
    volume: int
    data_range: str
    total_records: int

class OHLCVItem(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    adj_close: float
    volume: int

class TechnicalIndicatorsItem(BaseModel):
    date: str
    close: float
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    rsi_14: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    bollinger_upper: Optional[float] = None
    bollinger_lower: Optional[float] = None
    daily_return: Optional[float] = None
    volatility: Optional[float] = None

class StockDetailResponse(BaseModel):
    summary: StockSummary
    historical_data: List[OHLCVItem]
    technical_indicators: List[TechnicalIndicatorsItem]
