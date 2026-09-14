from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.session import get_db
from backend.app.db.models import User
from backend.app.schemas.alert_schemas import PriceAlertCreate, PriceAlertResponse
from backend.app.services.alert_service import create_price_alert, delete_price_alert, check_user_alerts
from backend.app.routes.dependencies import get_current_user

router = APIRouter(prefix="/alerts", tags=["Price Alerts"])

@router.get("", response_model=List[PriceAlertResponse])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve and evaluate active and triggered price alerts for logged in user."""
    return check_user_alerts(db, current_user.id)

@router.post("", response_model=PriceAlertResponse)
def add_alert(
    alert_in: PriceAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new price alert."""
    if alert_in.condition not in ["GREATER_EQUAL", "LESS_EQUAL"]:
        raise HTTPException(status_code=400, detail="Invalid condition. Must be 'GREATER_EQUAL' or 'LESS_EQUAL'.")
    
    alert = create_price_alert(db, current_user.id, alert_in)
    alerts = check_user_alerts(db, current_user.id)
    matched = [a for a in alerts if a['id'] == alert.id]
    if matched:
        return matched[0]
    raise HTTPException(status_code=500, detail="Failed to retrieve newly created price alert.")

@router.delete("/{alert_id}")
def remove_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a price alert."""
    success = delete_price_alert(db, current_user.id, alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Price alert not found")
    return {"message": "Price alert successfully removed"}
