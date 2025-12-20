"""
Backend Unit Tests
==================
Tests for the simulation engine and core functionality.
"""

import pytest
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.simulation_engine import WeatherSimulator, SimulationConfig


class TestWeatherSimulator:
    """Tests for the WeatherSimulator class."""

    def test_initialization(self):
        """Test simulator initializes with default values."""
        sim = WeatherSimulator()
        assert sim.state.temperature == 28.0
        assert sim.state.humidity == 65.0
        assert sim.state.soil_moisture == 50.0
        assert sim.state.is_raining == False

    def test_update_state_returns_reading(self):
        """Test that update_state returns a SensorReading object."""
        sim = WeatherSimulator()
        reading = sim.update_state()
        
        assert hasattr(reading, 'temperature')
        assert hasattr(reading, 'humidity')
        assert hasattr(reading, 'pressure')
        assert hasattr(reading, 'soil_moisture')

    def test_trigger_rain_increases_moisture(self):
        """Test that trigger_rain() increases soil moisture."""
        sim = WeatherSimulator()
        initial_moisture = sim.state.soil_moisture
        
        sim.trigger_rain(intensity=0.8, duration=30)
        
        # Run a few ticks
        for _ in range(5):
            sim.update_state()
        
        assert sim.state.is_raining == True
        assert sim.state.soil_moisture > initial_moisture

    def test_trigger_drought_decreases_moisture(self):
        """Test that trigger_drought() sets low moisture."""
        sim = WeatherSimulator()
        sim.trigger_drought()
        
        assert sim.state.soil_moisture == 10.0
        assert sim.state.humidity == 30.0
        assert sim.state.is_raining == False

    def test_reset_restores_defaults(self):
        """Test that reset() restores default state."""
        sim = WeatherSimulator()
        sim.trigger_drought()
        sim.reset()
        
        assert sim.state.temperature == 28.0
        assert sim.state.soil_moisture == 50.0

    def test_temperature_within_bounds(self):
        """Test temperature stays within realistic bounds."""
        sim = WeatherSimulator()
        
        # Run many ticks across different times
        for _ in range(100):
            reading = sim.update_state()
            assert -10 < reading.temperature < 50, f"Temperature out of bounds: {reading.temperature}"

    def test_humidity_within_bounds(self):
        """Test humidity stays between 0-100%."""
        sim = WeatherSimulator()
        
        for _ in range(100):
            reading = sim.update_state()
            assert 0 <= reading.humidity <= 100, f"Humidity out of bounds: {reading.humidity}"

    def test_soil_moisture_within_bounds(self):
        """Test soil moisture stays between 0-100%."""
        sim = WeatherSimulator()
        
        for _ in range(100):
            reading = sim.update_state()
            assert 0 <= reading.soil_moisture <= 100, f"Moisture out of bounds: {reading.soil_moisture}"

    def test_alerts_generated_on_low_moisture(self):
        """Test that alerts are generated when moisture is critically low."""
        sim = WeatherSimulator()
        sim.trigger_drought()
        sim.update_state()
        
        alerts = sim.get_alerts()
        assert len(alerts) > 0
        assert any(alert.type.value == 'CRITICAL_DRY' for alert in alerts)

    def test_diurnal_temperature_cycle(self):
        """Test that temperature follows a day/night pattern."""
        config = SimulationConfig(ticks_per_virtual_hour=1)
        sim = WeatherSimulator(config=config)
        
        # Collect temperatures throughout a "day"
        temps = []
        for _ in range(24):
            reading = sim.update_state()
            temps.append(reading.temperature)
        
        # Temperature should vary throughout the day
        assert max(temps) - min(temps) > 5, "Temperature range too small for diurnal cycle"


class TestCropEngine:
    """Tests for the crop recommendation engine."""

    def test_feasibility_calculation(self):
        """Test that feasibility scores are calculated correctly."""
        from app.services.crop_engine import get_crop_engine
        
        engine = get_crop_engine()
        recommendations = engine.get_recommendations(
            avg_temp=28,
            avg_humidity=70,
            annual_rainfall=1500,
            soil_type="Alluvial",
            top_n=5
        )
        
        assert len(recommendations) == 5
        # Scores should be sorted descending
        for i in range(len(recommendations) - 1):
            assert recommendations[i].feasibility_score >= recommendations[i + 1].feasibility_score


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
