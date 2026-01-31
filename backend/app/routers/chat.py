"""
Chat Router - Farm Assistant Chatbot
=====================================
AI-powered chatbot using Google Gemini for farmer assistance.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
import google.generativeai as genai

from app.core.config import settings
from app.services.simulation_engine import get_simulator

router = APIRouter()
logger = logging.getLogger("agri-nexus.chat")

# Configure Gemini
def get_gemini_model():
    """Initialize Gemini model with API key."""
    if not settings.GEMINI_API_KEY:
        return None
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(settings.GEMINI_MODEL)


# Request/Response models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str
    sensor_context: dict


# System prompt for farm assistant
FARM_ASSISTANT_PROMPT = """You are "Krishi Mitra" (कृषि मित्र), a friendly and knowledgeable AI farming assistant for Indian farmers.

**Your Personality:**
- Speak in simple, clear language that farmers can understand
- Mix Hindi terms when helpful (with English translation)
- Be warm, encouraging, and practical
- Give actionable advice, not just theory

**Your Knowledge Areas:**
- Crop selection and rotation
- Soil health and fertilizers
- Pest and disease management
- Irrigation and water management
- Weather impact on farming
- Market prices and selling strategies
- Government schemes for farmers (PM-KISAN, crop insurance, etc.)
- Organic farming practices

**Current Farm Conditions (LIVE DATA):**
{sensor_data}

**Guidelines:**
1. Always consider the current sensor data when giving advice
2. If moisture is low, remind about irrigation
3. If temperature is extreme, warn about crop stress
4. Be specific to Indian agriculture context
5. Suggest practical local solutions
6. Keep responses concise but helpful (2-3 paragraphs max)
7. Use emojis occasionally to be friendly 🌾

Remember: You're talking to a real farmer who needs practical help, not academic lectures."""


def get_sensor_context() -> dict:
    """Get current sensor readings for context."""
    simulator = get_simulator()
    state = simulator.state
    
    return {
        "temperature": f"{state.temperature:.1f}°C",
        "humidity": f"{state.humidity:.1f}%",
        "soil_moisture": f"{state.soil_moisture:.1f}%",
        "pressure": f"{state.pressure:.1f} hPa",
        "is_raining": state.is_raining,
        "condition": "Raining" if state.is_raining else ("Hot" if state.temperature > 35 else "Normal"),
        "alerts": [alert.message for alert in simulator.get_alerts()]
    }


def format_sensor_for_prompt(sensor_data: dict) -> str:
    """Format sensor data for the system prompt."""
    alert_text = ""
    if sensor_data["alerts"]:
        alert_text = f"\n⚠️ Active Alerts: {', '.join(sensor_data['alerts'])}"
    
    return f"""
- Temperature: {sensor_data['temperature']} {'🔥 (Hot!)' if float(sensor_data['temperature'].replace('°C','')) > 35 else ''}
- Humidity: {sensor_data['humidity']}
- Soil Moisture: {sensor_data['soil_moisture']} {'💧 (Dry - needs water!)' if float(sensor_data['soil_moisture'].replace('%','')) < 40 else ''}
- Weather: {sensor_data['condition']}{alert_text}
"""


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Chat with the AI farming assistant.
    
    The assistant has access to current sensor data and provides
    farmer-friendly advice in simple language.
    """
    model = get_gemini_model()
    
    if not model:
        # Fallback response when API key is not configured
        return ChatResponse(
            response="🌾 Namaste! I'm Krishi Mitra, your farming assistant. "
                    "Currently, the AI service is not configured. "
                    "Please add your GEMINI_API_KEY to enable smart responses. "
                    "In the meantime, check your sensor readings on the dashboard!",
            sensor_context=get_sensor_context()
        )
    
    try:
        # Get current sensor data
        sensor_data = get_sensor_context()
        sensor_text = format_sensor_for_prompt(sensor_data)
        
        # Build the system prompt with live data
        system_prompt = FARM_ASSISTANT_PROMPT.format(sensor_data=sensor_text)
        
        # Build conversation context
        conversation = system_prompt + "\n\n"
        
        # Add recent history
        for msg in request.history[-6:]:  # Keep last 6 messages
            role = "Farmer" if msg.role == "user" else "Krishi Mitra"
            conversation += f"{role}: {msg.content}\n\n"
        
        # Add current question
        conversation += f"Farmer: {request.message}\n\nKrishi Mitra:"
        
        # Generate response using simple content generation
        response = model.generate_content(conversation)
        
        logger.info(f"Chat response generated for: {request.message[:50]}...")
        
        return ChatResponse(
            response=response.text,
            sensor_context=sensor_data
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat service error: {str(e)}"
        )


@router.get("/chat/health")
async def chat_health():
    """Check if chat service is configured and working."""
    model = get_gemini_model()
    return {
        "status": "configured" if model else "not_configured",
        "model": settings.GEMINI_MODEL if model else None,
        "message": "Krishi Mitra is ready!" if model else "Please add GEMINI_API_KEY"
    }
