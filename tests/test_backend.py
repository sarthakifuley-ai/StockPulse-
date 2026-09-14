from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "Stock Market Analysis" in response.json()["message"]

def test_list_stocks_endpoint():
    response = client.get("/api/v1/stocks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 8
    tickers = [s["ticker"] for s in data]
    assert "AAPL" in tickers
    assert "FB" in tickers
