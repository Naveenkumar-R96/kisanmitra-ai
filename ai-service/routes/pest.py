# ai-service/routes/pest.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pest_detection import analyze_image

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}

@router.post("/analyze")
async def analyze_pest(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Invalid file type: {file.content_type}")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(400, "File too large. Max 10MB.")

    result = analyze_image(contents, file.content_type)
    return {
        "success": True,
        "data": result,
        "filename": file.filename
    }