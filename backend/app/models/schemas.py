"""
Agri-Nexus Pydantic Models
==========================
Data validation schemas for the API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============================================
# Enums
# ============================================
class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertType(str, Enum):
    CRITICAL_DRY = "CRITICAL_DRY"
    STORM_WARNING = "STORM_WARNING"
    HEAT_WARNING = "HEAT_WARNING"
    FROST_WARNING = "FROST_WARNING"
    DISEASE_RISK = "DISEASE_RISK"
    WATERLOGGING = "WATERLOGGING"


class SoilType(str, Enum):
    ALLUVIAL = "Alluvial"
    BLACK = "Black (Regur)"
    RED = "Red"
    LATERITE = "Laterite"
    DESERT = "Desert"
    MOUNTAIN = "Mountain"
    CLAY = "Clay"
    SANDY = "Sandy"
    LOAMY = "Loamy"


# ============================================
# Farm Models
# ============================================
class FarmBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    location_lat: float = Field(..., ge=-90, le=90)
    location_lon: float = Field(..., ge=-180, le=180)
    soil_type: Optional[SoilType] = None
    size_acres: Optional[float] = Field(None, ge=0)


class FarmCreate(FarmBase):
    pass


class FarmResponse(FarmBase):
    id: str
    user_id: str
    elevation_meters: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Sensor Data Models
# ============================================
class SensorReading(BaseModel):
    """Real-time sensor reading from simulation or hardware."""
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity %")
    pressure: float = Field(..., description="Atmospheric pressure in hPa")
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture %")
    rainfall: float = Field(default=0, ge=0, description="Rainfall in mm")
    wind_speed: Optional[float] = Field(None, ge=0, description="Wind speed km/h")
    uv_index: Optional[float] = Field(None, ge=0, le=11)
    timestamp: datetime = Field(default_factory=datetime.now)
    is_raining: bool = False
    simulation_tick: Optional[int] = None


class SensorLogCreate(BaseModel):
    farm_id: str
    temperature: float
    humidity: float
    pressure: float
    soil_moisture: float
    rainfall: float = 0
    is_simulated: bool = True
    simulation_tick: Optional[int] = None


class SensorLogResponse(BaseModel):
    id: str
    farm_id: str
    timestamp: datetime
    temperature: float
    humidity: float
    pressure: float
    soil_moisture: float
    rainfall: float

    class Config:
        from_attributes = True


# ============================================
# Alert Models
# ============================================
class AlertBase(BaseModel):
    type: AlertType
    severity: AlertSeverity
    title: str
    message: Optional[str] = None
    threshold_value: Optional[float] = None
    actual_value: Optional[float] = None


class AlertCreate(AlertBase):
    farm_id: str


class AlertResponse(AlertBase):
    id: str
    farm_id: str
    is_acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# WebSocket Payload Models
# ============================================
class WebSocketPayload(BaseModel):
    """Complete payload sent via WebSocket to frontend."""
    farm_id: str
    sensors: SensorReading
    alerts: List[AlertBase] = []
    weather_forecast: Optional[dict] = None
    simulation_status: str = "running"
    timestamp: datetime = Field(default_factory=datetime.now)


# ============================================
# Research & AI Models
# ============================================
class GeoLookupResponse(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    elevation_meters: Optional[float] = None
    terrain_type: Optional[str] = None


class CropFeasibility(BaseModel):
    crop_name: str
    feasibility_score: float = Field(..., ge=0, le=100)
    roi_estimate: Optional[float] = None
    growing_season: Optional[str] = None
    requirements: dict = {}
    risks: List[str] = []


class RiskAssessment(BaseModel):
    risk_type: str
    probability: float = Field(..., ge=0, le=100)
    description: str
    mitigation: Optional[str] = None


class FullScanRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    farm_size: Optional[float] = Field(None, ge=0)
    budget: Optional[float] = Field(None, ge=0)
    soil_type: Optional[SoilType] = None


class FullScanResponse(BaseModel):
    location: GeoLookupResponse
    soil_analysis: dict
    weather_analysis: dict
    crop_recommendations: List[CropFeasibility]
    risks: List[RiskAssessment]
    economic_analysis: Optional[dict] = None
    market_analysis: Optional[dict] = None
    generated_at: datetime = Field(default_factory=datetime.now)


# ============================================
# Simulation Control Models
# ============================================
class SimulationState(BaseModel):
    """Current state of the simulation engine."""
    is_running: bool = False
    tick_count: int = 0
    current_hour: int = 0
    is_raining: bool = False
    rain_intensity: float = 0
    temperature: float = 25.0
    humidity: float = 60.0
    pressure: float = 1013.25
    soil_moisture: float = 50.0


class SimulationControl(BaseModel):
    """Control commands for the simulation."""
    command: str = Field(..., pattern="^(start|stop|reset|rain|drought)$")
    value: Optional[float] = None
