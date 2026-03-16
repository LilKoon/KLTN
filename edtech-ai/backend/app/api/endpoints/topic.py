from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio
import json

router = APIRouter()

class TopicRequest(BaseModel):
    topic: str
    level: str = "Beginner"

class TopicResponse(BaseModel):
    topic: str
    vocabulary: list
    conversation: str
    quiz: list

@router.post("/generate", response_model=TopicResponse)
async def generate_micro_lesson(request: TopicRequest):
    # This is a mock implementation of an AI call. 
    # In production, replace asyncio.sleep with an actual OpenAI / Langchain call.
    await asyncio.sleep(2)  # Simulate AI generation delay
    
    mock_response = {
        "topic": request.topic,
        "vocabulary": [
            {"word": "Flight", "pronunciation": "/flaɪt/", "meaning": "Chuyến bay", "example": "My flight is delayed."},
            {"word": "Passport", "pronunciation": "/ˈpɑːspɔːt/", "meaning": "Hộ chiếu", "example": "Can I see your passport?"},
            {"word": "Luggage", "pronunciation": "/ˈlʌɡɪdʒ/", "meaning": "Hành lý", "example": "I have two pieces of luggage."}
        ],
        "conversation": "Custom Officer: Good morning! Can I see your passport and ticket, please?\nPassenger: Sure, here they are.\nCustom Officer: Do you have any luggage to check-in?\nPassenger: Yes, just this one suitcase.",
        "quiz": [
            {
                "question": "Where do you show your passport?",
                "options": ["At the gate", "At the check-in desk", "In the restroom", "On the plane"],
                "answer": "At the check-in desk"
            },
            {
                "question": "What is the meaning of 'Luggage'?",
                "options": ["Hành lý", "Chuyến bay", "Trễ giờ", "Hộ chiếu"],
                "answer": "Hành lý"
            }
        ]
    }
    
    return TopicResponse(**mock_response)
