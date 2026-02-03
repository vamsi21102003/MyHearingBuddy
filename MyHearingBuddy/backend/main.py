from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set to your app's domain!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/sign-to-text')
async def sign_to_text(file: UploadFile):
    # Mock: always returns "HELLO"
    return {"code": 200, "asl_text": "HELLO"}

@app.post('/emotion-detect')
async def emotion_detect(file: UploadFile):
    # Mock: always returns "happy"
    return {"code": 200, "emotion": "happy"}

@app.get("/")
def root():
    return {"message": "My Hearing Buddy FastAPI up!"}
