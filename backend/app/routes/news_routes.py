from fastapi import APIRouter, HTTPException
from backend.app.services.news_service import fetch_company_news
from backend.app.schemas.news_schemas import NewsResponse

router = APIRouter(prefix="/news", tags=["Financial News & Sentiment"])

@router.get("/{ticker}", response_model=NewsResponse)
def get_news(ticker: str):
    """Fetch live financial news and analyze sentiment using the PhraseBank-trained model."""
    try:
        return fetch_company_news(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news and sentiment for {ticker}: {str(e)}")
