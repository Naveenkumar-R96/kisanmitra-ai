# ai-service/routes/advisory.py
from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai
import os
import json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()

class AdvisoryRequest(BaseModel):
    farmer_name: str
    village:     str = ""
    state:       str = ""
    land_size:   float = 1.0
    soil_type:   str = "loamy"
    irrigation:  str = "rainfed"
    weather:     str = ""
    language:    str = "English"

@router.post("/generate")
async def generate_advisory(req: AdvisoryRequest):
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""You are KisanMitra AI, an agricultural advisor for Indian farmers.

Farmer: {req.farmer_name}, {req.village}, {req.state}
Land: {req.land_size} acres, Soil: {req.soil_type}, Irrigation: {req.irrigation}
Weather: {req.weather}

Generate 4 farm advisories in {req.language} language.
Respond ONLY with a valid JSON array, no other text:

[
  {{
    "type": "weather_alert|pest_warning|fertilizer|irrigation|general",
    "priority": "urgent|high|medium|low",
    "title": "short title in {req.language}",
    "message": "2-3 sentence advisory in {req.language}",
    "actions": [
      {{"step": 1, "action": "action in {req.language}", "timing": "morning|evening|immediately|weekly"}},
      {{"step": 2, "action": "action in {req.language}", "timing": "morning|evening|immediately|weekly"}}
    ]
  }}
]

Make it relevant to current weather and Indian farming. Simple language for farmers."""

        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        data = json.loads(raw)

        return {"success": True, "data": data}

    except Exception as e:
        print(f"Advisory generation error: {e}")
        return {
            "success": False,
            "data": [],
            "error": str(e)
        }