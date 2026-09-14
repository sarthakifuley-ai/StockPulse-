import pandas as pd
import numpy as np
from ml.preprocessing.features import chronological_split

def test_chronological_split():
    # Create 100 sample rows
    df = pd.DataFrame({
        'date': pd.date_range("2023-01-01", periods=100),
        'close': np.arange(100)
    })

    train_df, val_df, test_df = chronological_split(df, train_ratio=0.70, val_ratio=0.15)

    assert len(train_df) == 70
    assert len(val_df) == 15
    assert len(test_df) == 15

    # Check temporal order continuity (zero overlap)
    assert train_df['date'].max() < val_df['date'].min()
    assert val_df['date'].max() < test_df['date'].min()
