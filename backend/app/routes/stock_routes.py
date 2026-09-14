from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.services.stock_service import get_all_stock_summaries, get_stock_detail
from backend.app.schemas.stock_schemas import StockSummary, StockDetailResponse

router = APIRouter(prefix="/stocks", tags=["Stock Analysis"])

@router.get("", response_model=List[StockSummary])
def list_stocks():
    """List all 8 available stock tickers with summary statistics."""
    return get_all_stock_summaries()

@router.get("/{ticker}", response_model=StockDetailResponse)
def get_stock(ticker: str):
    """Get full historical OHLCV data and technical indicators for a specific ticker."""
    try:
        return get_stock_detail(ticker)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Stock ticker {ticker.upper()} not found in historical dataset.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
