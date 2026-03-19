# ai-service/routes/pest.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pest_detection import analyze_image

router = APIRouter()

@router.post("/analyze")
async def analyze_pest(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only images allowed")

        image_bytes = await file.read()
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large. Max 10MB")

        result = analyze_image(image_bytes, file.content_type)

        return {
            "success": True,
            "data":    result,
            "message": "Analysis complete"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))