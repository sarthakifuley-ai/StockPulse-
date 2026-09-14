from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.db.models import PortfolioItem
from backend.app.schemas.portfolio_schemas import PortfolioItemCreate
from backend.app.services.stock_service import load_stock_data, get_ticker_display_name

def add_portfolio_holding(db: Session, user_id: int, holding_in: PortfolioItemCreate) -> PortfolioItem:
    ticker_clean = holding_in.ticker.upper()
    item = PortfolioItem(
        user_id=user_id,
        ticker=ticker_clean,
        quantity=holding_in.quantity,
        purchase_price=holding_in.purchase_price,
        purchase_date=holding_in.purchase_date
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def delete_portfolio_holding(db: Session, user_id: int, holding_id: int) -> bool:
    item = db.query(PortfolioItem).filter(PortfolioItem.id == holding_id, PortfolioItem.user_id == user_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True

def get_user_portfolio_summary(db: Session, user_id: int) -> Dict[str, Any]:
    holdings_query = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()
    
    total_invested = 0.0
    total_current_value = 0.0
    processed_holdings = []

    for item in holdings_query:
        ticker = item.ticker.upper()
        curr_price = item.purchase_price
        
        try:
            df = load_stock_data(ticker)
            curr_price = float(df['close'].iloc[-1])
        except Exception as e:
            print(f"Could not fetch current price for {ticker}: {e}")

        invested = item.quantity * item.purchase_price
        current_val = item.quantity * curr_price
        pl = current_val - invested
        pl_pct = (pl / invested * 100) if invested > 0 else 0.0

        total_invested += invested
        total_current_value += current_val

        processed_holdings.append({
            "id": item.id,
            "user_id": item.user_id,
            "ticker": ticker,
            "display_name": get_ticker_display_name(ticker),
            "quantity": item.quantity,
            "purchase_price": round(item.purchase_price, 2),
            "purchase_date": item.purchase_date,
            "current_price": round(curr_price, 2),
            "total_invested": round(invested, 2),
            "current_value": round(current_val, 2),
            "profit_loss": round(pl, 2),
            "profit_loss_percent": round(pl_pct, 2),
            "created_at": item.created_at
        })

    total_pl = total_current_value - total_invested
    total_pl_pct = (total_pl / total_invested * 100) if total_invested > 0 else 0.0

    return {
        "total_invested": round(total_invested, 2),
        "total_current_value": round(total_current_value, 2),
        "total_profit_loss": round(total_pl, 2),
        "total_profit_loss_percent": round(total_pl_pct, 2),
        "total_items": len(processed_holdings),
        "holdings": processed_holdings
    }
