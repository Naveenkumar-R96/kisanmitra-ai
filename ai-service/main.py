# ai-service/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routes.pest import router as pest_router
from routes.advisory import router as advisory_router

app = FastAPI(title="KisanMitra AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pest_router,     prefix="/pest")
app.include_router(advisory_router, prefix="/advisory")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "KisanMitra AI", "version": "1.0.0"}