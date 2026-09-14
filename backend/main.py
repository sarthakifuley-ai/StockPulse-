import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.db.session import engine, Base
from backend.app.routes import (
    auth_routes,
    stock_routes,
    news_routes,
    predict_routes,
    portfolio_routes,
    alert_routes,
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_routes.router, prefix=settings.API_V1_STR)
app.include_router(stock_routes.router, prefix=settings.API_V1_STR)
app.include_router(news_routes.router, prefix=settings.API_V1_STR)
app.include_router(predict_routes.router, prefix=settings.API_V1_STR)
app.include_router(portfolio_routes.router, prefix=settings.API_V1_STR)
app.include_router(alert_routes.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to Stock Market Analysis & Prediction API",
        "docs": "/docs",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
