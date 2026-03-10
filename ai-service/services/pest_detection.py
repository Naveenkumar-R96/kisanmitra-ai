# ai-service/services/pest_detection.py
import anthropic
import base64
import os
from PIL import Image
import io

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are an expert agricultural scientist and plant pathologist 
with 20+ years of experience in Indian crop diseases and pest management.

When given a crop image, analyze it and respond ONLY with valid JSON 
(no markdown, no backticks, no preamble) in this exact format:

{
  "isHealthy": false,
  "disease": "Disease name in English (Hindi name)",
  "confidence": 87,
  "severity": "mild|moderate|severe",
  "affectedPart": "leaf|stem|root|fruit|flower",
  "cropType": "detected crop name",
  "symptoms": ["symptom 1", "symptom 2"],
  "causes": "Brief cause explanation",
  "treatment": {
    "chemical": ["Chemical treatment 1 with dosage", "Chemical treatment 2"],
    "organic": ["Organic remedy 1", "Organic remedy 2"],
    "dosage": "Specific dosage instructions",
    "timing": "Best time to apply treatment",
    "frequency": "How often to apply"
  },
  "preventiveMeasures": ["Prevention tip 1", "Prevention tip 2"],
  "urgency": "immediate|within_3_days|within_week",
  "spreadRisk": "high|medium|low",
  "estimatedYieldLoss": "Estimated yield loss percentage if untreated"
}

If the image is healthy, set isHealthy to true and disease to "Healthy Plant".
Always respond in JSON only. No exceptions."""

def analyze_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    try:
        # Resize image if too large (optimize for API)
        img = Image.open(io.BytesIO(image_bytes))
        if max(img.size) > 1024:
            img.thumbnail((1024, 1024), Image.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85)
            image_bytes = buf.getvalue()
            mime_type = "image/jpeg"

        # Encode to base64
        b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

        # Call Claude Vision
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": mime_type,
                            "data": b64
                        }
                    },
                    {
                        "type": "text",
                        "text": "Analyze this crop image for diseases and pests. Respond in JSON only."
                    }
                ]
            }]
        )

        import json
        raw = response.content[0].text.strip()
        # Strip any accidental markdown fences
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)

    except Exception as e:
        print(f"AI Analysis error: {e}")
        # Fallback response so app never crashes
        return {
            "isHealthy": False,
            "disease": "Analysis Error — Please retry",
            "confidence": 0,
            "severity": "unknown",
            "affectedPart": "unknown",
            "cropType": "unknown",
            "symptoms": [],
            "causes": "Could not analyze image",
            "treatment": {
                "chemical": ["Please consult local agricultural officer"],
                "organic": ["Please consult local Krishi Vigyan Kendra"],
                "dosage": "N/A",
                "timing": "N/A",
                "frequency": "N/A"
            },
            "preventiveMeasures": [],
            "urgency": "within_week",
            "spreadRisk": "low",
            "estimatedYieldLoss": "Unknown",
            "error": str(e)
        }