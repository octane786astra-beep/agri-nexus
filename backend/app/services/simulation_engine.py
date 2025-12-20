"""
Agri-Nexus Weather Simulation Engine
=====================================
The core Digital Twin physics simulation.

This module implements realistic weather and soil physics including:
- Diurnal temperature cycles (sine wave based on time of day)
- Soil moisture hydrology (exponential decay + rain events)
- Rainfall probability based on humidity/pressure
- Alert generation for threshold breaches

The simulation runs in real-time via WebSocket, updating every 2 seconds.
"""

import math
import random
from datetime import datetime
from typing import Optional, List, Tuple
from dataclasses import dataclass, field
from app.models.schemas import SensorReading, AlertBase, AlertType, AlertSeverity


@dataclass
class SimulationConfig:
    """Configuration for the simulation parameters."""
    # Temperature settings
    base_temp: float = 28.0              # Average baseline temperature (°C)
    temp_amplitude: float = 8.0          # Daily temperature swing (±°C)
    peak_hour: int = 14                  # Hour of peak temperature (24h format)
    temp_noise: float = 0.3              # Random noise standard deviation
    
    # Humidity settings
    base_humidity: float = 65.0          # Average baseline humidity (%)
    humidity_amplitude: float = 15.0     # Daily humidity swing (%)
    humidity_peak_hour: int = 5          # Hour of peak humidity (early morning)
    
    # Pressure settings
    base_pressure: float = 1013.25       # Standard atmospheric pressure (hPa)
    pressure_drift_range: float = 20.0   # Maximum pressure drift
    
    # Soil moisture settings
    decay_rate: float = 0.995            # Exponential decay rate per tick
    rain_moisture_spike: float = 95.0    # Moisture level after rain
    evaporation_factor: float = 0.02     # Extra evaporation based on temp
    
    # Rain settings
    rain_humidity_threshold: float = 85.0    # Humidity % to trigger rain chance
    rain_pressure_threshold: float = 1005.0  # Pressure below this increases rain chance
    rain_base_probability: float = 0.01      # Base probability per tick
    rain_duration_min: int = 10              # Minimum rain ticks
    rain_duration_max: int = 50              # Maximum rain ticks
    
    # Time scaling
    ticks_per_virtual_hour: int = 30     # How many ticks = 1 virtual hour


@dataclass
class WeatherState:
    """Current state of the weather simulation."""
    # Core readings
    temperature: float = 28.0
    humidity: float = 65.0
    pressure: float = 1013.25
    soil_moisture: float = 50.0
    rainfall: float = 0.0
    
    # Rain state
    is_raining: bool = False
    rain_intensity: float = 0.0          # 0-1 scale
    rain_ticks_remaining: int = 0
    
    # Time tracking
    tick_count: int = 0
    virtual_hour: float = 6.0            # Start at 6 AM
    
    # Wind (for advanced simulation)
    wind_speed: float = 5.0
    wind_direction: float = 180.0        # Degrees


class WeatherSimulator:
    """
    Physics-based weather simulation for the Digital Twin.
    
    Uses realistic mathematical models for:
    - Diurnal (daily) temperature cycles using sine waves
    - Soil moisture exponential decay modeling evaporation
    - Rainfall probability based on atmospheric conditions
    """
    
    def __init__(self, config: Optional[SimulationConfig] = None):
        """Initialize the simulator with optional custom config."""
        self.config = config or SimulationConfig()
        self.state = WeatherState()
        self._alerts: List[AlertBase] = []
        
        # Pressure trend direction (slowly drifts)
        self._pressure_trend: float = 0.0
    
    def reset(self):
        """Reset simulation to default state."""
        self.state = WeatherState()
        self._alerts = []
        self._pressure_trend = 0.0
    
    def _calculate_diurnal_temperature(self) -> float:
        """
        Calculate realistic temperature based on time of day.
        
        Uses a sine wave function where:
        - Peak temperature occurs at peak_hour (default 14:00 / 2 PM)
        - Minimum temperature occurs 12 hours later (4 AM)
        
        Formula: T = base_temp + amplitude * sin(2π * (hour - 6) / 24 - π/2)
        
        The -6 shift and -π/2 phase shift ensures:
        - Minimum at hour 4 (4 AM)
        - Maximum at hour 14 (2 PM)
        """
        hour = self.state.virtual_hour
        cfg = self.config
        
        # Convert hour to radians for sine calculation
        # Shift by peak_hour to align maximum
        phase_shift = (hour - cfg.peak_hour + 6) * (2 * math.pi / 24)
        
        # Sine wave gives value between -1 and 1
        sine_value = math.sin(phase_shift)
        
        # Calculate base temperature from sine wave
        base_temp = cfg.base_temp + cfg.temp_amplitude * sine_value
        
        # Add Gaussian noise for realism
        noise = random.gauss(0, cfg.temp_noise)
        
        # Rain cools the temperature
        if self.state.is_raining:
            rain_cooling = self.state.rain_intensity * 5.0  # Up to 5°C cooling
            base_temp -= rain_cooling
        
        return round(base_temp + noise, 2)
    
    def _calculate_humidity(self) -> float:
        """
        Calculate humidity inversely related to temperature.
        
        Humidity is typically:
        - Highest in early morning (condensation, dew)
        - Lowest in afternoon (evaporation)
        - Spikes during rain
        """
        hour = self.state.virtual_hour
        cfg = self.config
        
        # Inverse sine wave (opposite of temperature)
        phase_shift = (hour - cfg.humidity_peak_hour + 6) * (2 * math.pi / 24)
        sine_value = -math.sin(phase_shift)  # Negative for inverse
        
        base_humidity = cfg.base_humidity + cfg.humidity_amplitude * sine_value
        
        # Rain increases humidity significantly
        if self.state.is_raining:
            rain_boost = self.state.rain_intensity * 20.0
            base_humidity = min(98, base_humidity + rain_boost)
        
        # Add small noise
        noise = random.gauss(0, 2.0)
        
        # Clamp to valid range
        return round(max(20, min(100, base_humidity + noise)), 2)
    
    def _calculate_pressure(self) -> float:
        """
        Simulate atmospheric pressure with slow random walk.
        
        Pressure changes slowly over time and affects rain probability.
        Low pressure systems bring storms, high pressure brings clear skies.
        """
        cfg = self.config
        
        # Random walk for pressure trend
        self._pressure_trend += random.gauss(0, 0.5)
        self._pressure_trend = max(-1, min(1, self._pressure_trend))  # Clamp drift
        
        # Apply trend to pressure
        pressure_change = self._pressure_trend * 0.1
        new_pressure = self.state.pressure + pressure_change
        
        # Keep within realistic bounds
        min_pressure = cfg.base_pressure - cfg.pressure_drift_range
        max_pressure = cfg.base_pressure + cfg.pressure_drift_range
        
        # Tendency to return to baseline
        if new_pressure < cfg.base_pressure:
            new_pressure += 0.05
        elif new_pressure > cfg.base_pressure:
            new_pressure -= 0.05
        
        return round(max(min_pressure, min(max_pressure, new_pressure)), 2)
    
    def _calculate_soil_moisture(self) -> float:
        """
        Calculate soil moisture using exponential decay model.
        
        Soil dries out over time following exponential decay:
        M(t) = M(0) * e^(-kt)
        
        Simplified per tick: M_new = M_current * decay_rate
        
        Additional evaporation occurs when temperature is high.
        Rain recharges moisture to near saturation.
        """
        cfg = self.config
        current_moisture = self.state.soil_moisture
        
        if self.state.is_raining:
            # Rain increases moisture based on intensity
            moisture_increase = self.state.rain_intensity * 5.0
            new_moisture = min(cfg.rain_moisture_spike, current_moisture + moisture_increase)
        else:
            # Exponential decay (drying out)
            new_moisture = current_moisture * cfg.decay_rate
            
            # Extra evaporation when hot
            if self.state.temperature > 30:
                extra_evap = (self.state.temperature - 30) * cfg.evaporation_factor
                new_moisture -= extra_evap
        
        # Clamp to valid range
        return round(max(0, min(100, new_moisture)), 2)
    
    def _check_rain_conditions(self) -> Tuple[bool, float]:
        """
        Determine if rain should start/continue based on conditions.
        
        Rain probability increases when:
        - Humidity is high (> 85%)
        - Pressure is low (< 1005 hPa)
        
        Returns:
            Tuple of (should_rain, rain_intensity)
        """
        cfg = self.config
        
        # If already raining, continue until duration ends
        if self.state.is_raining:
            if self.state.rain_ticks_remaining > 0:
                # Gradually vary intensity
                intensity_change = random.gauss(0, 0.1)
                new_intensity = self.state.rain_intensity + intensity_change
                return True, max(0.1, min(1.0, new_intensity))
            else:
                # Rain ending
                return False, 0.0
        
        # Check conditions for starting rain
        humidity_factor = max(0, (self.state.humidity - cfg.rain_humidity_threshold) / 15)
        pressure_factor = max(0, (cfg.rain_pressure_threshold - self.state.pressure) / 20)
        
        rain_probability = cfg.rain_base_probability + (humidity_factor * 0.1) + (pressure_factor * 0.1)
        
        if random.random() < rain_probability:
            # Start raining!
            duration = random.randint(cfg.rain_duration_min, cfg.rain_duration_max)
            intensity = random.uniform(0.3, 1.0)
            self.state.rain_ticks_remaining = duration
            return True, intensity
        
        return False, 0.0
    
    def _check_alerts(self) -> List[AlertBase]:
        """
        Check for threshold breaches and generate alerts.
        
        Alert types:
        - CRITICAL_DRY: Soil moisture < 30%
        - STORM_WARNING: Pressure < 990 hPa
        - HEAT_WARNING: Temperature > 38°C
        - FROST_WARNING: Temperature < 2°C
        """
        alerts = []
        
        # Critical Dry Alert
        if self.state.soil_moisture < 30:
            alerts.append(AlertBase(
                type=AlertType.CRITICAL_DRY,
                severity=AlertSeverity.HIGH if self.state.soil_moisture < 20 else AlertSeverity.MEDIUM,
                title="Critical Soil Moisture Alert",
                message=f"Soil moisture has dropped to {self.state.soil_moisture}%. "
                        "Irrigation recommended immediately.",
                threshold_value=30.0,
                actual_value=self.state.soil_moisture
            ))
        
        # Storm Warning
        if self.state.pressure < 990:
            alerts.append(AlertBase(
                type=AlertType.STORM_WARNING,
                severity=AlertSeverity.HIGH,
                title="Storm Warning",
                message=f"Atmospheric pressure at {self.state.pressure} hPa indicates "
                        "potential severe weather. Secure equipment and crops.",
                threshold_value=990.0,
                actual_value=self.state.pressure
            ))
        
        # Heat Warning
        if self.state.temperature > 38:
            alerts.append(AlertBase(
                type=AlertType.HEAT_WARNING,
                severity=AlertSeverity.MEDIUM,
                title="Heat Wave Alert",
                message=f"Temperature has reached {self.state.temperature}°C. "
                        "Consider shade netting and increased irrigation.",
                threshold_value=38.0,
                actual_value=self.state.temperature
            ))
        
        # Frost Warning
        if self.state.temperature < 2:
            alerts.append(AlertBase(
                type=AlertType.FROST_WARNING,
                severity=AlertSeverity.CRITICAL,
                title="Frost Warning",
                message=f"Temperature has dropped to {self.state.temperature}°C. "
                        "Frost damage risk is high. Activate frost protection.",
                threshold_value=2.0,
                actual_value=self.state.temperature
            ))
        
        return alerts
    
    def _advance_time(self):
        """Advance the simulation time by one tick."""
        self.state.tick_count += 1
        
        # Advance virtual hour
        self.state.virtual_hour += 1.0 / self.config.ticks_per_virtual_hour
        
        # Wrap around at 24 hours
        if self.state.virtual_hour >= 24:
            self.state.virtual_hour = 0.0
        
        # Decrease rain duration
        if self.state.rain_ticks_remaining > 0:
            self.state.rain_ticks_remaining -= 1
    
    def update_state(self) -> SensorReading:
        """
        Run one simulation tick and return the new sensor readings.
        
        This is the main method called every tick interval (e.g., 2 seconds).
        It updates all weather parameters based on physics models.
        
        Returns:
            SensorReading with current values
        """
        # Check rain conditions first (affects other calculations)
        should_rain, rain_intensity = self._check_rain_conditions()
        self.state.is_raining = should_rain
        self.state.rain_intensity = rain_intensity
        self.state.rainfall = rain_intensity * 2.5 if should_rain else 0.0  # mm per tick
        
        # Update all parameters
        self.state.temperature = self._calculate_diurnal_temperature()
        self.state.humidity = self._calculate_humidity()
        self.state.pressure = self._calculate_pressure()
        self.state.soil_moisture = self._calculate_soil_moisture()
        
        # Update wind (simple random walk)
        self.state.wind_speed = max(0, self.state.wind_speed + random.gauss(0, 1))
        self.state.wind_speed = min(50, self.state.wind_speed)
        
        # Check for alerts
        self._alerts = self._check_alerts()
        
        # Advance time
        self._advance_time()
        
        # Return sensor reading
        return SensorReading(
            temperature=self.state.temperature,
            humidity=self.state.humidity,
            pressure=self.state.pressure,
            soil_moisture=self.state.soil_moisture,
            rainfall=round(self.state.rainfall, 2),
            wind_speed=round(self.state.wind_speed, 2),
            is_raining=self.state.is_raining,
            simulation_tick=self.state.tick_count,
            timestamp=datetime.now()
        )
    
    def get_alerts(self) -> List[AlertBase]:
        """Get current active alerts."""
        return self._alerts
    
    def trigger_rain(self, intensity: float = 0.8, duration: int = 30):
        """
        Manually trigger a rain event (for demo/testing).
        
        Args:
            intensity: Rain intensity 0-1
            duration: Duration in ticks
        """
        self.state.is_raining = True
        self.state.rain_intensity = max(0.1, min(1.0, intensity))
        self.state.rain_ticks_remaining = duration
        self.state.humidity = min(98, self.state.humidity + 20)
        self.state.temperature -= 3  # Rain cools things down
    
    def trigger_drought(self):
        """Manually trigger drought conditions (for demo/testing)."""
        self.state.soil_moisture = 10.0
        self.state.humidity = 30.0
        self.state.is_raining = False
        self.state.rain_intensity = 0.0
        self.state.rain_ticks_remaining = 0
    
    def get_state_summary(self) -> dict:
        """Get a summary of the current simulation state."""
        return {
            "tick": self.state.tick_count,
            "virtual_time": f"{int(self.state.virtual_hour):02d}:{int((self.state.virtual_hour % 1) * 60):02d}",
            "temperature": f"{self.state.temperature}°C",
            "humidity": f"{self.state.humidity}%",
            "pressure": f"{self.state.pressure} hPa",
            "soil_moisture": f"{self.state.soil_moisture}%",
            "is_raining": self.state.is_raining,
            "rain_intensity": self.state.rain_intensity,
            "active_alerts": len(self._alerts)
        }


# Singleton instance for the WebSocket handler
_simulator_instance: Optional[WeatherSimulator] = None


def get_simulator() -> WeatherSimulator:
    """Get or create the singleton simulator instance."""
    global _simulator_instance
    if _simulator_instance is None:
        _simulator_instance = WeatherSimulator()
    return _simulator_instance
