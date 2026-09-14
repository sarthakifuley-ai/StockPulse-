from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.session import get_db
from backend.app.db.models import User
from backend.app.schemas.portfolio_schemas import PortfolioItemCreate, PortfolioItemResponse, PortfolioSummaryResponse
from backend.app.services.portfolio_service import add_portfolio_holding, delete_portfolio_holding, get_user_portfolio_summary
from backend.app.routes.dependencies import get_current_user

router = APIRouter(prefix="/portfolio", tags=["Portfolio Management"])

@router.get("", response_model=PortfolioSummaryResponse)
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve portfolio holdings, total invested, current valuation, and P/L summary for logged in user."""
    return get_user_portfolio_summary(db, current_user.id)

@router.post("", response_model=PortfolioItemResponse)
def add_holding(
    holding_in: PortfolioItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a stock holding to user portfolio."""
    item = add_portfolio_holding(db, current_user.id, holding_in)
    summary = get_user_portfolio_summary(db, current_user.id)
    matched = [h for h in summary['holdings'] if h['id'] == item.id]
    if matched:
        return matched[0]
    raise HTTPException(status_code=500, detail="Failed to retrieve newly added holding.")

@router.delete("/{holding_id}")
def remove_holding(
    holding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a holding from user portfolio."""
    success = delete_portfolio_holding(db, current_user.id, holding_id)
    if not success:
        raise HTTPException(status_code=404, detail="Portfolio holding not found")
    return {"message": "Holding successfully removed"}
