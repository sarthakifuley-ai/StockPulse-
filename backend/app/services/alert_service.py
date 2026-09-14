import datetime
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.db.models import PriceAlert
from backend.app.schemas.alert_schemas import PriceAlertCreate
from backend.app.services.stock_service import load_stock_data, get_ticker_display_name

def create_price_alert(db: Session, user_id: int, alert_in: PriceAlertCreate) -> PriceAlert:
    ticker_clean = alert_in.ticker.upper()
    alert = PriceAlert(
        user_id=user_id,
        ticker=ticker_clean,
        condition=alert_in.condition,
        target_price=alert_in.target_price,
        is_active=True,
        is_triggered=False
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # Immediately check against current price
    check_user_alerts(db, user_id)
    db.refresh(alert)
    return alert

def delete_price_alert(db: Session, user_id: int, alert_id: int) -> bool:
    alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id, PriceAlert.user_id == user_id).first()
    if not alert:
        return False
    db.delete(alert)
    db.commit()
    return True

def check_user_alerts(db: Session, user_id: int) -> List[Dict[str, Any]]:
    alerts = db.query(PriceAlert).filter(PriceAlert.user_id == user_id, PriceAlert.is_active == True).all()
    results = []

    for alert in alerts:
        ticker = alert.ticker.upper()
        curr_price = alert.target_price
        
        try:
            df = load_stock_data(ticker)
            curr_price = float(df['close'].iloc[-1])
        except Exception as e:
            print(f"Alert price check error for {ticker}: {e}")

        # Check threshold condition
        triggered = False
        if alert.condition == "GREATER_EQUAL" and curr_price >= alert.target_price:
            triggered = True
        elif alert.condition == "LESS_EQUAL" and curr_price <= alert.target_price:
            triggered = True

        if triggered and not alert.is_triggered:
            alert.is_triggered = True
            alert.triggered_at = datetime.datetime.utcnow()
            alert.triggered_price = curr_price
            db.commit()
            db.refresh(alert)

        results.append({
            "id": alert.id,
            "user_id": alert.user_id,
            "ticker": ticker,
            "display_name": get_ticker_display_name(ticker),
            "condition": alert.condition,
            "target_price": round(alert.target_price, 2),
            "is_active": alert.is_active,
            "is_triggered": alert.is_triggered,
            "current_price": round(curr_price, 2),
            "triggered_at": alert.triggered_at,
            "triggered_price": round(alert.triggered_price, 2) if alert.triggered_price else None,
            "created_at": alert.created_at
        })

    return results
