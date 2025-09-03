from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from electron_logic import get_response

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

@app.post("/api/chat")
async def chat(query: Query):
    answer = get_response(query.question)
    if not answer or not answer.strip():
            return {"answer": "Chat server busy"}
    return {"answer": answer}
