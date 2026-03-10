# ai-service/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

from routes.pest import router as pest_router
from routes.price import router as price_router

app = FastAPI(
    title="KisanMitra AI Service",
    description="AI-powered pest detection & price prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pest_router,  prefix="/pest",  tags=["Pest Detection"])
app.include_router(price_router, prefix="/price", tags=["Price Prediction"])

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "KisanMitra AI",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0",
                port=int(os.getenv("PORT", 8000)), reload=True)