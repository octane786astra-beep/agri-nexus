"""
WebSocket Connection Manager
============================
Handles multiple WebSocket connections for real-time sensor streaming.
"""

from fastapi import WebSocket
from typing import Dict, List, Set
import asyncio
import json
import logging

logger = logging.getLogger("agri-nexus.websocket")


class ConnectionManager:
    """
    Manages WebSocket connections for real-time data streaming.
    
    Features:
    - Multiple clients can connect simultaneously
    - Connections are organized by farm_id
    - Automatic cleanup on disconnect
    - Broadcast to all clients or specific farms
    """
    
    def __init__(self):
        # Map of farm_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # All connections regardless of farm
        self.all_connections: Set[WebSocket] = set()
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, farm_id: str):
        """
        Accept a new WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            farm_id: The farm this connection is subscribing to
        """
        await websocket.accept()
        
        async with self._lock:
            # Add to farm-specific list
            if farm_id not in self.active_connections:
                self.active_connections[farm_id] = set()
            self.active_connections[farm_id].add(websocket)
            
            # Add to global list
            self.all_connections.add(websocket)
        
        logger.info(f"Client connected to farm {farm_id}. Total connections: {len(self.all_connections)}")
    
    async def disconnect(self, websocket: WebSocket, farm_id: str):
        """
        Remove a WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            farm_id: The farm this connection was subscribed to
        """
        async with self._lock:
            # Remove from farm-specific list
            if farm_id in self.active_connections:
                self.active_connections[farm_id].discard(websocket)
                # Clean up empty sets
                if not self.active_connections[farm_id]:
                    del self.active_connections[farm_id]
            
            # Remove from global list
            self.all_connections.discard(websocket)
        
        logger.info(f"Client disconnected from farm {farm_id}. Total connections: {len(self.all_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
    
    async def broadcast_to_farm(self, message: dict, farm_id: str):
        """
        Broadcast a message to all clients subscribed to a specific farm.
        
        Args:
            message: JSON-serializable message to send
            farm_id: The farm to broadcast to
        """
        if farm_id not in self.active_connections:
            return
        
        disconnected = set()
        
        for connection in self.active_connections[farm_id]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            await self.disconnect(connection, farm_id)
    
    async def broadcast_to_all(self, message: dict):
        """Broadcast a message to all connected clients."""
        disconnected = []
        
        for connection in self.all_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        
        # We can't easily clean up here without farm_id
        # Those connections will be cleaned up on their next message attempt
    
    def get_connection_count(self, farm_id: str = None) -> int:
        """Get the number of active connections."""
        if farm_id:
            return len(self.active_connections.get(farm_id, set()))
        return len(self.all_connections)
    
    def get_active_farms(self) -> List[str]:
        """Get list of farm IDs with active connections."""
        return list(self.active_connections.keys())


# Singleton instance
manager = ConnectionManager()


def get_connection_manager() -> ConnectionManager:
    """Get the singleton connection manager."""
    return manager
