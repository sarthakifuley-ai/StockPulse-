# Stock Market Analysis & Prediction Web Application

A complete working end-to-end Stock Market Analysis, Financial News Sentiment Analysis, and Machine Learning Price & Direction Prediction web application.

Built using **FastAPI** (Backend), **React + Vite** (Frontend), **SQLAlchemy & SQLite** (Database), **scikit-learn & XGBoost** (Machine Learning), and **Plotly** (Interactive Financial Charts).

---

## Features

1. **Stock Price Visualization**: Interactive Plotly Candlestick & Volume charts for 8 tickers (`AAPL`, `AMZN`, `FB`, `GOOGL`, `JPM`, `MSFT`, `NVDA`, `TSLA`) with timeframe filtering (`1M`, `6M`, `1Y`, `5Y`, `ALL`).
2. **Technical Indicators Engine**: Real-time mathematical calculation of SMA (20, 50), EMA (12, 26), RSI (14), MACD & Signal line, Bollinger Bands, and Volatility.
3. **Financial PhraseBank NLP Sentiment**: Real NLP sentiment classifier trained on Financial PhraseBank (`Sentences_AllAgree.txt`, **83.44% Accuracy**, **0.8242 F1**), classifying live market news into `positive`, `neutral`, `negative` with confidence scores.
4. **Time-Series Machine Learning Price Prediction**:
   - Strict 70% Train / 15% Validation / 15% Test chronological split (zero future data leakage).
   - Evaluates Linear Regression, Random Forest, and XGBoost regressors/classifiers.
   - Outputs next-day Close Price prediction, UP/DOWN direction prediction, and model evaluation metrics (MAE, RMSE, MAPE, R², Accuracy, F1).
5. **User Authentication**: Secure signup, login, JWT token auth, and bcrypt password hashing.
6. **Portfolio Management**: Real-time stock portfolio holdings tracker per user with total invested amount, valuation, profit/loss $, and return %.
7. **Price Alerts Center**: Target price threshold monitoring (`Price >= Target` or `Price <= Target`) with real-time active/triggered evaluation against market data.
8. **Prediction History**: Persistent database storage of generated predictions per user with error calculation (`|Predicted - Actual|`) when actual market data becomes available.

---

## Dataset Structure Discovered

- **ZIP File**: `Stock/Dataset/IDEA LAB DATA.zip` (extracted to `data/raw/`)
- **Historical Stock CSVs** (`Stock_Price_Data/`):
  - `AAPL.csv` (10,852 rows, 1980 to 2023)
  - `AMZN.csv` (6,700 rows, 1997 to 2023)
  - `FB.csv` (2,044 rows, 2012 to 2020) — displayed as Meta (FB)
  - `GOOGL.csv` (3,932 rows, 2004 to 2020)
  - `JPM.csv` (11,040 rows, 1980 to 2023)
  - `MSFT.csv` (9,526 rows, 1986 to 2023)
  - `NVDA.csv` (6,275 rows, 1999 to 2023)
  - `TSLA.csv` (3,399 rows, 2010 to 2023)
- **Financial PhraseBank** (`FinancialPhraseBank-v1.0/`):
  - `Sentences_AllAgree.txt` (2,264 sentences)
  - `Sentences_50Agree.txt` (4,846 sentences)

---

## Model Evaluation Results

| Ticker | Best Price Regressor | Test R² | Test MAE | Test MAPE | Best Direction Classifier | Test Accuracy | Test F1 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AAPL** | Linear Regression | **0.9745** | $2.82 | 1.75% | XGBoost Classifier | **49.48%** | 0.3705 |
| **AMZN** | Linear Regression | **0.9826** | $12.09 | 5.08% | XGBoost Classifier | **49.50%** | 0.1486 |
| **FB** (Meta) | Linear Regression | **0.9419** | $3.23 | 1.71% | XGBoost Classifier | **50.67%** | 0.4032 |
| **GOOGL** | Linear Regression | **0.9603** | $14.89 | 1.28% | XGBoost Classifier | **50.26%** | 0.5068 |
| **JPM** | Linear Regression | **0.9907** | $1.50 | 1.25% | XGBoost Classifier | **48.82%** | 0.1457 |
| **MSFT** | Linear Regression | **0.9972** | $2.96 | 1.35% | Random Forest Classifier | **47.82%** | 0.1530 |
| **NVDA** | Linear Regression | **0.9956** | $5.20 | 2.41% | XGBoost Classifier | **51.07%** | 0.5916 |
| **TSLA** | Linear Regression | **0.8782** | $17.06 | 7.97% | Random Forest Classifier | **46.52%** | 0.5386 |

---

## Installation & Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Clone & Setup Python Virtual Environment
```powershell
# Navigate to project directory
cd Stock

# Create Python Virtual Environment
python -m venv .venv

# Install Python Requirements
.\.venv\Scripts\pip.exe install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

## Execution Commands

### 1. Train Machine Learning Models
```powershell
$env:PYTHONPATH="."
.\.venv\Scripts\python.exe ml/training/train_sentiment.py
.\.venv\Scripts\python.exe ml/training/train_price_models.py
```

### 2. Run Automated Unit Tests
```powershell
$env:PYTHONPATH="."
.\.venv\Scripts\pytest.exe tests/
```

### 3. Start FastAPI Backend Server
```powershell
$env:PYTHONPATH="."
.\.venv\Scripts\uvicorn.exe backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

### 4. Start React Frontend Dashboard
```powershell
cd frontend
npm run dev
```
Access Dashboard at: `http://localhost:5173/`

---

## External API Requirements

- **No external API key is required** for standard operation.
- Live market news uses free RSS / `yfinance` feeds.
- An optional `NEWS_API_KEY` can be specified in `.env` if integrating third-party news APIs.
