# ai-service/routes/price.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.price_prediction import predict_price

router = APIRouter()

class PriceRequest(BaseModel):
    crop: str
    mandi: str
    historicalPrices: List[float]

@router.post("/predict")
async def predict(req: PriceRequest):
    result = predict_price(req.crop, req.mandi, req.historicalPrices)
    return {
        "success": True,
        "data": result,
        "crop": req.crop,
        "mandi": req.mandi
    }