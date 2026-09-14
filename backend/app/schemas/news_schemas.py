from pydantic import BaseModel
from typing import List, Optional, Dict

class NewsItem(BaseModel):
    title: str
    published_date: str
    ticker: str
    publisher: Optional[str] = "Market News"
    link: Optional[str] = "#"
    sentiment_label: str  # 'positive', 'neutral', 'negative'
    sentiment_confidence: float
    sentiment_probabilities: Dict[str, float]
    source_type: str  # 'live_rss' or 'historical_dataset'

class NewsResponse(BaseModel):
    ticker: str
    total_news: int
    sentiment_distribution: Dict[str, int]  # {'positive': x, 'neutral': y, 'negative': z}
    average_confidence: float
    news: List[NewsItem]
