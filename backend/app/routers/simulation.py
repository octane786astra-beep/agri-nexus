"""
Simulation Control Router
=========================
REST endpoints to control the simulation for demos and testing.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from app.services.simulation_engine import get_simulator

router = APIRouter()
logger = logging.getLogger("agri-nexus.simulation")


class SimulationControlRequest(BaseModel):
    """Request body for simulation control commands."""
    intensity: Optional[float] = 0.8
    duration: Optional[int] = 30


@router.post("/rain")
async def trigger_rain(request: SimulationControlRequest = SimulationControlRequest()):
    """
    Force start a rain event in the simulation.
    
    Use this endpoint to demonstrate the system's reactivity to weather changes.
    
    Args:
        intensity: Rain intensity 0-1 (default 0.8)
        duration: Rain duration in ticks (default 30)
    """
    simulator = get_simulator()
    simulator.trigger_rain(
        intensity=request.intensity or 0.8,
        duration=request.duration or 30
    )
    
    logger.info(f"Rain triggered: intensity={request.intensity}, duration={request.duration}")
    
    return {
        "success": True,
        "message": "☔ Rain event triggered!",
        "details": {
            "intensity": request.intensity,
            "duration_ticks": request.duration,
            "current_state": simulator.get_state_summary()
        }
    }


@router.post("/drought")
async def trigger_drought():
    """
    Force drought conditions in the simulation.
    
    Sets soil moisture to critical levels (10%) for demonstrating alerts.
    """
    simulator = get_simulator()
    simulator.trigger_drought()
    
    logger.info("Drought conditions triggered")
    
    return {
        "success": True,
        "message": "🏜️ Drought conditions activated!",
        "details": simulator.get_state_summary()
    }


@router.post("/reset")
async def reset_simulation():
    """
    Reset the simulation to default values.
    
    Useful for starting fresh demos or recovering from extreme conditions.
    """
    simulator = get_simulator()
    simulator.reset()
    
    logger.info("Simulation reset to defaults")
    
    return {
        "success": True,
        "message": "🔄 Simulation reset to default state",
        "details": simulator.get_state_summary()
    }


@router.get("/state")
async def get_simulation_state():
    """Get the current detailed state of the simulation."""
    simulator = get_simulator()
    state = simulator.state
    
    return {
        "tick_count": state.tick_count,
        "virtual_hour": state.virtual_hour,
        "virtual_time": f"{int(state.virtual_hour):02d}:{int((state.virtual_hour % 1) * 60):02d}",
        "environment": {
            "temperature": state.temperature,
            "humidity": state.humidity,
            "pressure": state.pressure,
            "soil_moisture": state.soil_moisture,
            "rainfall": state.rainfall
        },
        "weather": {
            "is_raining": state.is_raining,
            "rain_intensity": state.rain_intensity,
            "rain_ticks_remaining": state.rain_ticks_remaining,
            "wind_speed": state.wind_speed
        },
        "alerts": [alert.model_dump() for alert in simulator.get_alerts()]
    }


@router.post("/time-jump")
async def time_jump(hours: int = 6):
    """
    Jump forward in virtual time (for testing day/night cycles).
    
    Args:
        hours: Number of hours to jump forward
    """
    if hours < 1 or hours > 24:
        raise HTTPException(status_code=400, detail="Hours must be between 1 and 24")
    
    simulator = get_simulator()
    
    # Advance time
    simulator.state.virtual_hour = (simulator.state.virtual_hour + hours) % 24
    
    # Update temperature for new time
    sensor_reading = simulator.update_state()
    
    return {
        "success": True,
        "message": f"⏰ Jumped forward {hours} hours",
        "new_time": f"{int(simulator.state.virtual_hour):02d}:00",
        "current_state": simulator.get_state_summary()
    }
