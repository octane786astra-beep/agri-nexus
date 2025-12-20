"""
Sensors WebSocket Router
========================
Real-time sensor data streaming via WebSocket.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import logging
from datetime import datetime

from app.core.socket_manager import get_connection_manager
from app.services.simulation_engine import get_simulator
from app.models.schemas import WebSocketPayload

router = APIRouter()
logger = logging.getLogger("agri-nexus.sensors")


@router.websocket("/ws/sensors/{farm_id}")
async def websocket_sensor_stream(websocket: WebSocket, farm_id: str):
    """
    WebSocket endpoint for real-time sensor data streaming.
    
    Connects to the simulation engine and broadcasts sensor readings
    every 2 seconds.
    
    Args:
        farm_id: The farm to stream sensor data for
    """
    manager = get_connection_manager()
    simulator = get_simulator()
    
    await manager.connect(websocket, farm_id)
    
    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "farm_id": farm_id,
            "message": "Connected to Agri-Nexus sensor stream",
            "timestamp": datetime.now().isoformat()
        })
        
        # Main streaming loop
        tick_count = 0
        while True:
            # Update simulation state
            sensor_reading = simulator.update_state()
            alerts = simulator.get_alerts()
            
            # Build payload
            payload = WebSocketPayload(
                farm_id=farm_id,
                sensors=sensor_reading,
                alerts=alerts,
                simulation_status="running",
                timestamp=datetime.now()
            )
            
            # Send to client
            await websocket.send_json(payload.model_dump(mode="json"))
            
            tick_count += 1
            
            # Log every 30 ticks (1 minute at 2s interval)
            if tick_count % 30 == 0:
                state = simulator.get_state_summary()
                logger.info(f"Simulation tick {tick_count}: {state['virtual_time']} - "
                           f"Temp: {state['temperature']}, Moisture: {state['soil_moisture']}")
            
            # Wait 2 seconds before next update
            await asyncio.sleep(2.0)
            
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from farm {farm_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await manager.disconnect(websocket, farm_id)


@router.get("/sensors/status")
async def get_sensor_status():
    """Get the current status of the sensor simulation."""
    simulator = get_simulator()
    manager = get_connection_manager()
    
    return {
        "simulation": simulator.get_state_summary(),
        "connections": {
            "total": manager.get_connection_count(),
            "active_farms": manager.get_active_farms()
        }
    }
