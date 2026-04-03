import requests

API_URL = "https://router.huggingface.co/hf-inference/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

headers = {
    "Authorization": "Bearer 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",
    "Content-Type": "image/jpeg"
}

with open("leaf.jpg", "rb") as f:
    response = requests.post(API_URL, headers=headers, data=f)

print(response.status_code)
print(response.text)

