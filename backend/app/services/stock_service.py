import pandas as pd
from typing import Dict, List, Any
from ml.preprocessing.loader import TICKERS, load_stock_data
from ml.preprocessing.indicators import compute_technical_indicators

TICKER_NAMES = {
    'AAPL': 'Apple Inc.',
    'AMZN': 'Amazon.com Inc.',
    'FB': 'Meta Platforms (FB)',
    'GOOGL': 'Alphabet Inc. (Google)',
    'JPM': 'JPMorgan Chase & Co.',
    'MSFT': 'Microsoft Corporation',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.'
}

def get_ticker_display_name(ticker: str) -> str:
    ticker_clean = ticker.upper()
    return TICKER_NAMES.get(ticker_clean, ticker_clean)

def get_all_stock_summaries() -> List[Dict[str, Any]]:
    """Return summary statistics and latest prices for all 8 supported tickers."""
    summaries = []
    for ticker in TICKERS:
        try:
            df = load_stock_data(ticker)
            if len(df) < 2:
                continue
            
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            close = float(latest['close'])
            prev_close = float(prev['close'])
            change = close - prev_close
            change_percent = (change / prev_close) * 100
            
            start_date = df['date'].iloc[0].strftime('%Y-%m-%d')
            end_date = df['date'].iloc[-1].strftime('%Y-%m-%d')
            
            summaries.append({
                "ticker": ticker,
                "display_name": get_ticker_display_name(ticker),
                "latest_date": end_date,
                "latest_close": round(close, 2),
                "previous_close": round(prev_close, 2),
                "change": round(change, 2),
                "change_percent": round(change_percent, 2),
                "volume": int(latest['volume']),
                "data_range": f"{start_date} to {end_date}",
                "total_records": len(df)
            })
        except Exception as e:
            print(f"Error loading summary for {ticker}: {e}")
            
    return summaries

def get_stock_detail(ticker: str) -> Dict[str, Any]:
    """Return full historical OHLCV data and calculated technical indicators for a ticker."""
    df = load_stock_data(ticker)
    df_ind = compute_technical_indicators(df)

    latest = df_ind.iloc[-1]
    prev = df_ind.iloc[-2]
    
    close = float(latest['close'])
    prev_close = float(prev['close'])
    change = close - prev_close
    change_percent = (change / prev_close) * 100
    
    start_date = df_ind['date'].iloc[0].strftime('%Y-%m-%d')
    end_date = df_ind['date'].iloc[-1].strftime('%Y-%m-%d')

    summary = {
        "ticker": ticker.upper(),
        "display_name": get_ticker_display_name(ticker),
        "latest_date": end_date,
        "latest_close": round(close, 2),
        "previous_close": round(prev_close, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "volume": int(latest['volume']),
        "data_range": f"{start_date} to {end_date}",
        "total_records": len(df_ind)
    }

    # Format historical records
    historical_data = []
    for _, row in df_ind.iterrows():
        historical_data.append({
            "date": row['date'].strftime('%Y-%m-%d'),
            "open": round(float(row['open']), 2),
            "high": round(float(row['high']), 2),
            "low": round(float(row['low']), 2),
            "close": round(float(row['close']), 2),
            "adj_close": round(float(row.get('adj_close', row['close'])), 2),
            "volume": int(row['volume'])
        })

    # Format technical indicators records
    technical_indicators = []
    for _, row in df_ind.iterrows():
        technical_indicators.append({
            "date": row['date'].strftime('%Y-%m-%d'),
            "close": round(float(row['close']), 2),
            "sma_20": round(float(row['sma_20']), 2) if pd.notnull(row.get('sma_20')) else None,
            "sma_50": round(float(row['sma_50']), 2) if pd.notnull(row.get('sma_50')) else None,
            "ema_12": round(float(row['ema_12']), 2) if pd.notnull(row.get('ema_12')) else None,
            "ema_26": round(float(row['ema_26']), 2) if pd.notnull(row.get('ema_26')) else None,
            "rsi_14": round(float(row['rsi_14']), 2) if pd.notnull(row.get('rsi_14')) else None,
            "macd": round(float(row['macd']), 4) if pd.notnull(row.get('macd')) else None,
            "macd_signal": round(float(row['macd_signal']), 4) if pd.notnull(row.get('macd_signal')) else None,
            "bollinger_upper": round(float(row['bollinger_upper']), 2) if pd.notnull(row.get('bollinger_upper')) else None,
            "bollinger_lower": round(float(row['bollinger_lower']), 2) if pd.notnull(row.get('bollinger_lower')) else None,
            "daily_return": round(float(row['daily_return']), 4) if pd.notnull(row.get('daily_return')) else None,
            "volatility": round(float(row['volatility']), 4) if pd.notnull(row.get('volatility')) else None,
        })

    return {
        "summary": summary,
        "historical_data": historical_data,
        "technical_indicators": technical_indicators
    }
