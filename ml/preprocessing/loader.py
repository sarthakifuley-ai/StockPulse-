import os
import glob
import pandas as pd
from typing import Dict, List, Tuple

TICKERS = ['AAPL', 'AMZN', 'FB', 'GOOGL', 'JPM', 'MSFT', 'NVDA', 'TSLA']

def get_data_dir() -> str:
    """Find and return the base raw data directory containing extracted datasets."""
    possible_paths = [
        os.path.join("data", "raw", "IDEA LAB DATA"),
        os.path.join("data", "raw"),
        os.path.join("Dataset"),
    ]
    for path in possible_paths:
        if os.path.exists(path):
            stock_dir = os.path.join(path, "Stock_Price_Data")
            if os.path.exists(stock_dir):
                return path
    raise FileNotFoundError("Stock_Price_Data directory not found. Please verify ZIP extraction in data/raw.")

def load_stock_data(ticker: str) -> pd.DataFrame:
    """
    Load raw historical OHLCV CSV for a specific ticker.
    Ensures standard column names: date, open, high, low, close, adj_close, volume.
    Sorts by date ascending.
    """
    data_dir = get_data_dir()
    ticker = ticker.upper()
    stock_file = os.path.join(data_dir, "Stock_Price_Data", f"{ticker.lower() if ticker == 'NVDA' else ticker}.csv")
    
    if not os.path.exists(stock_file):
        # Case insensitive fallback search
        files = glob.glob(os.path.join(data_dir, "Stock_Price_Data", "*.csv"))
        matched = [f for f in files if os.path.basename(f).upper() == f"{ticker}.CSV"]
        if matched:
            stock_file = matched[0]
        else:
            raise FileNotFoundError(f"Historical price file for ticker {ticker} not found at {stock_file}")

    df = pd.read_csv(stock_file)
    
    # Normalize column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    
    if 'date' not in df.columns:
        raise ValueError(f"Missing 'date' column in {stock_file}")

    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date']).sort_values('date').reset_index(drop=True)
    
    # Standard numerical columns
    num_cols = ['open', 'high', 'low', 'close', 'adj_close', 'volume']
    for col in num_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
    df = df.dropna(subset=['close']).reset_index(drop=True)
    return df

def load_all_stocks() -> Dict[str, pd.DataFrame]:
    """Load stock dataframes for all 8 supported tickers."""
    stocks = {}
    for ticker in TICKERS:
        try:
            stocks[ticker] = load_stock_data(ticker)
        except Exception as e:
            print(f"Warning: Could not load data for {ticker}: {e}")
    return stocks

def load_phrasebank(agree_level: str = "AllAgree") -> Tuple[List[str], List[str]]:
    """
    Load Financial PhraseBank sentence dataset for sentiment model training.
    agree_level options: 'AllAgree', '75Agree', '66Agree', '50Agree'.
    Returns (sentences, labels).
    """
    data_dir = get_data_dir()
    phrase_pattern = os.path.join(data_dir, "FinancialPhraseBank-v1.0", "**", f"Sentences_{agree_level}.txt")
    phrase_files = glob.glob(phrase_pattern, recursive=True)
    
    if not phrase_files:
        # Fallback recursive search across data/raw
        phrase_files = glob.glob(os.path.join("data", "raw", "**", f"Sentences_{agree_level}.txt"), recursive=True)

    if not phrase_files:
        raise FileNotFoundError(f"Financial PhraseBank file Sentences_{agree_level}.txt not found.")

    target_file = phrase_files[0]
    sentences = []
    labels = []
    
    with open(target_file, "r", encoding="latin-1") as f:
        for line in f:
            line = line.strip()
            if not line or "@" not in line:
                continue
            parts = line.rsplit("@", 1)
            text = parts[0].strip()
            label = parts[1].strip().lower()
            if text and label in ['positive', 'neutral', 'negative']:
                sentences.append(text)
                labels.append(label)

    return sentences, labels
