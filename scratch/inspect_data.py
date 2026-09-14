import os
import glob
import pandas as pd
from collections import Counter

raw_dir = r"data/raw"
print("=== DIRECTORY STRUCTURE ===")
for root, dirs, files in os.walk(raw_dir):
    level = root.replace(raw_dir, "").count(os.sep)
    indent = " " * 4 * level
    print(f"{indent}{os.path.basename(root)}/")
    subindent = " " * 4 * (level + 1)
    for f in files:
        print(f"{subindent}{f}")

print("\n=== STOCK PRICE FILES ANALYSIS ===")
stock_files = glob.glob(os.path.join(raw_dir, "**", "Stock_Price_Data", "*.csv"), recursive=True)
for sf in sorted(stock_files):
    df = pd.read_csv(sf)
    ticker = os.path.splitext(os.path.basename(sf))[0].upper()
    print(f"\nTicker: {ticker} (file: {os.path.basename(sf)})")
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {list(df.columns)}")
    print(f"  Missing values: {df.isnull().sum().to_dict()}")
    print(f"  Duplicates: {df.duplicated().sum()}")
    date_cols = [c for c in df.columns if "date" in c.lower() or "time" in c.lower()]
    if date_cols:
        dcol = date_cols[0]
        dates = pd.to_datetime(df[dcol], errors="coerce")
        print(f"  Date Range: {dates.min()} to {dates.max()}")
    print(f"  Sample row 1: {df.iloc[0].to_dict()}")

print("\n=== FINANCIAL PHRASEBANK ANALYSIS ===")
phrase_files = glob.glob(os.path.join(raw_dir, "**", "FinancialPhraseBank-v1.0", "**", "*.txt"), recursive=True)
for pf in sorted(phrase_files):
    fname = os.path.basename(pf)
    if fname.startswith("Sentences_"):
        print(f"\nFile: {fname}")
        with open(pf, "r", encoding="latin-1") as f:
            lines = f.readlines()
        print(f"  Total lines: {len(lines)}")
        labels = [line.strip().rsplit("@", 1)[1].strip() for line in lines if "@" in line]
        print(f"  Label counts: {dict(Counter(labels))}")
        if lines:
            print(f"  Sample line: {lines[0].strip()}")
