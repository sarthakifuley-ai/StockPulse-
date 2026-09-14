import pandas as pd
import numpy as np
from typing import Tuple, List, Dict
from sklearn.preprocessing import StandardScaler
from ml.preprocessing.indicators import compute_technical_indicators

FEATURE_COLUMNS = [
    'open', 'high', 'low', 'close', 'volume',
    'daily_return', 'volatility',
    'sma_20', 'sma_50', 'ema_12', 'ema_26',
    'rsi_14', 'macd', 'macd_signal',
    'bollinger_upper', 'bollinger_lower',
    'lag_1', 'lag_2', 'lag_3', 'lag_4', 'lag_5',
    'return_lag_1', 'return_lag_2'
]

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute technical indicators, lag features, and targets (next_close, direction).
    Drops NaNs resulting from rolling calculations.
    """
    df = compute_technical_indicators(df)
    
    # Lag features
    for lag in range(1, 6):
        df[f'lag_{lag}'] = df['close'].shift(lag)
        
    df['return_lag_1'] = df['daily_return'].shift(1)
    df['return_lag_2'] = df['daily_return'].shift(2)

    # Targets for Next Trading Day
    df['next_close'] = df['close'].shift(-1)
    df['direction'] = (df['next_close'] > df['close']).astype(int)

    # Drop NaNs introduced by rolling windows and target shifting
    df = df.dropna().reset_index(drop=True)
    return df

def chronological_split(
    df: pd.DataFrame, 
    train_ratio: float = 0.70, 
    val_ratio: float = 0.15
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Split time-series data chronologically into Train (70%), Validation (15%), Test (15%).
    Strictly preserves temporal order to prevent data leakage.
    """
    n = len(df)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))
    
    train_df = df.iloc[:train_end].copy()
    val_df = df.iloc[train_end:val_end].copy()
    test_df = df.iloc[val_end:].copy()
    
    return train_df, val_df, test_df

def create_scaled_dataset(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    test_df: pd.DataFrame,
    feature_cols: List[str] = FEATURE_COLUMNS
) -> Dict:
    """
    Fits StandardScaler STRICTLY on train_df feature columns,
    then transforms train, val, and test features.
    Prevents data leakage.
    """
    scaler = StandardScaler()
    
    X_train = train_df[feature_cols].values
    X_val = val_df[feature_cols].values
    X_test = test_df[feature_cols].values
    
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    y_reg_train = train_df['next_close'].values
    y_reg_val = val_df['next_close'].values
    y_reg_test = test_df['next_close'].values

    y_cls_train = train_df['direction'].values
    y_cls_val = val_df['direction'].values
    y_cls_test = test_df['direction'].values

    return {
        'scaler': scaler,
        'feature_cols': feature_cols,
        'X_train': X_train,
        'X_train_scaled': X_train_scaled,
        'X_val': X_val,
        'X_val_scaled': X_val_scaled,
        'X_test': X_test,
        'X_test_scaled': X_test_scaled,
        'y_reg_train': y_reg_train,
        'y_reg_val': y_reg_val,
        'y_reg_test': y_reg_test,
        'y_cls_train': y_cls_train,
        'y_cls_val': y_cls_val,
        'y_cls_test': y_cls_test,
        'dates_train': train_df['date'].values,
        'dates_val': val_df['date'].values,
        'dates_test': test_df['date'].values,
    }
