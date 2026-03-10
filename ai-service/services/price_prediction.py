# ai-service/services/price_prediction.py
import anthropic
import os
import json

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

PRICE_SYSTEM = """You are an expert agricultural economist specializing in 
Indian commodity markets and mandi price analysis.

Given historical price data and market context, predict future prices.
Respond ONLY with valid JSON (no markdown, no backticks):

{
  "price7Days": 2150,
  "price14Days": 2200,
  "trend": "rising|falling|stable",
  "confidence": 75,
  "recommendation": "sell_now|wait|hold",
  "reasoning": "Brief explanation in simple Hindi-friendly English",
  "factors": ["Factor 1 affecting price", "Factor 2"],
  "bestSellWindow": "Optimal selling time description"
}"""

def predict_price(crop: str, mandi: str, historical_prices: list) -> dict:
    try:
        prompt = f"""
Crop: {crop}
Mandi: {mandi}
Historical prices (last 30 days, ₹/quintal): {historical_prices}
Current month: March 2026
Season: Rabi harvest approaching

Predict next 7 and 14 day prices and give sell recommendation.
"""
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=500,
            system=PRICE_SYSTEM,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = response.content[0].text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)

    except Exception as e:
        print(f"Price prediction error: {e}")
        return {
            "price7Days": None,
            "price14Days": None,
            "trend": "stable",
            "confidence": 0,
            "recommendation": "hold",
            "reasoning": "Prediction unavailable",
            "factors": [],
            "bestSellWindow": "Consult local mandi",
            "error": str(e)
        }