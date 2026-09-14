import os
import joblib
import yfinance as yf
from typing import Dict, List, Any
from ml.training.train_sentiment import MODEL_SAVE_PATH, train_sentiment_model
from backend.app.services.stock_service import get_ticker_display_name

def get_sentiment_pipeline():
    """Load or train the reusable sentiment pipeline artifact."""
    if not os.path.exists(MODEL_SAVE_PATH):
        print("Sentiment pipeline artifact not found. Training on Financial PhraseBank...")
        train_sentiment_model(agree_level="AllAgree")
    return joblib.load(MODEL_SAVE_PATH)

def fetch_company_news(ticker: str) -> Dict[str, Any]:
    """
    Fetch live market news for a given ticker, run sentiment inference using PhraseBank model,
    and compute aggregated sentiment metrics.
    """
    ticker_clean = ticker.upper()
    display_name = get_ticker_display_name(ticker_clean)

    # 1. Fetch live news via yfinance
    raw_news = []
    try:
        yf_ticker = "META" if ticker_clean == "FB" else ticker_clean
        t = yf.Ticker(yf_ticker)
        raw_news = t.news or []
    except Exception as e:
        print(f"Warning: yfinance news fetch failed for {ticker_clean}: {e}")

    pipeline = get_sentiment_pipeline()
    
    processed_news = []
    sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
    total_conf = 0.0

    if raw_news:
        for item in raw_news:
            # Handle yfinance news schema structure (can be item['title'] or nested in 'content')
            title = ""
            publisher = "Financial News"
            link = "#"
            pub_date = ""

            if isinstance(item, dict):
                if 'title' in item:
                    title = item['title']
                    publisher = item.get('publisher', 'Market News')
                    link = item.get('link', '#')
                    pub_date = str(item.get('providerPublishTime', ''))
                elif 'content' in item and isinstance(item['content'], dict):
                    content = item['content']
                    title = content.get('title', '')
                    publisher = content.get('provider', {}).get('displayName', 'Market News') if isinstance(content.get('provider'), dict) else 'Market News'
                    pub_date = content.get('pubDate', '')
                    click_through = content.get('clickThroughUrl')
                    if click_through and isinstance(click_through, dict):
                        link = click_through.get('url', '#')

            if not title:
                continue

            # Run PhraseBank Sentiment Classifier
            probs = pipeline.predict_proba([title])[0]
            classes = pipeline.classes_
            best_idx = probs.argmax()
            label = classes[best_idx]
            confidence = float(probs[best_idx])

            sentiment_counts[label] += 1
            total_conf += confidence

            processed_news.append({
                "title": title,
                "published_date": pub_date,
                "ticker": ticker_clean,
                "publisher": publisher,
                "link": link,
                "sentiment_label": label,
                "sentiment_confidence": round(confidence, 4),
                "sentiment_probabilities": {cls: round(float(p), 4) for cls, p in zip(classes, probs)},
                "source_type": "live_rss"
            })

    total_news = len(processed_news)
    avg_conf = round(total_conf / total_news, 4) if total_news > 0 else 0.0

    return {
        "ticker": ticker_clean,
        "total_news": total_news,
        "sentiment_distribution": sentiment_counts,
        "average_confidence": avg_conf,
        "news": processed_news
    }
