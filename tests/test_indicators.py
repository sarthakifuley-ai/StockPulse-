import pandas as pd
import numpy as np
from ml.preprocessing.indicators import compute_technical_indicators

def test_compute_technical_indicators():
    # Create sample dummy dataframe with 100 days of price data
    np.random.seed(42)
    dates = pd.date_range("2023-01-01", periods=100)
    prices = 100 + np.cumsum(np.random.normal(0, 1, 100))
    
    df = pd.DataFrame({
        'date': dates,
        'open': prices + np.random.normal(0, 0.5, 100),
        'high': prices + 2.0,
        'low': prices - 2.0,
        'close': prices,
        'volume': np.random.randint(1000, 5000, 100)
    })

    df_ind = compute_technical_indicators(df)

    assert 'sma_20' in df_ind.columns
    assert 'sma_50' in df_ind.columns
    assert 'ema_12' in df_ind.columns
    assert 'rsi_14' in df_ind.columns
    assert 'macd' in df_ind.columns
    assert 'bollinger_upper' in df_ind.columns
    assert 'volatility' in df_ind.columns

    # Verify RSI values are within [0, 100]
    rsi_valid = df_ind['rsi_14'].dropna()
    assert (rsi_valid >= 0).all() and (rsi_valid <= 100).all()
