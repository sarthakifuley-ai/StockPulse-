import pandas as pd
import numpy as np

def compute_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate technical indicators from OHLCV data.
    Requires columns: ['open', 'high', 'low', 'close', 'volume']
    Returns a DataFrame enriched with technical indicator columns.
    """
    df = df.copy()
    
    # 1. Simple Moving Averages (SMA)
    df['sma_20'] = df['close'].rolling(window=20).mean()
    df['sma_50'] = df['close'].rolling(window=50).mean()

    # 2. Exponential Moving Averages (EMA)
    df['ema_12'] = df['close'].ewm(span=12, adjust=False).mean()
    df['ema_26'] = df['close'].ewm(span=26, adjust=False).mean()

    # 3. Moving Average Convergence Divergence (MACD)
    df['macd'] = df['ema_12'] - df['ema_26']
    df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()

    # 4. Relative Strength Index (RSI 14)
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    # Avoid division by zero
    rs = gain / (loss.replace(0, np.nan))
    rsi = 100 - (100 / (1 + rs))
    df['rsi_14'] = rsi.fillna(50)

    # 5. Bollinger Bands (20-day, 2 std dev)
    std_20 = df['close'].rolling(window=20).std()
    df['bollinger_upper'] = df['sma_20'] + (std_20 * 2)
    df['bollinger_lower'] = df['sma_20'] - (std_20 * 2)

    # 6. Daily Return & Volatility
    df['daily_return'] = df['close'].pct_change()
    df['volatility'] = df['daily_return'].rolling(window=20).std()

    return df
