"""
Research Router
===============
Deep Research Agent endpoints for AI-powered farm analysis.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime
import logging

from app.models.schemas import (
    FullScanRequest, FullScanResponse, GeoLookupResponse,
    CropFeasibility, RiskAssessment
)
from app.services.geo_service import get_geo_service, get_soil_service
from app.services.crop_engine import get_crop_engine, get_risk_predictor
from app.services.simulation_engine import get_simulator

router = APIRouter()
logger = logging.getLogger("agri-nexus.research")


@router.post("/research/full-scan", response_model=FullScanResponse)
async def full_farm_scan(request: FullScanRequest):
    """
    Comprehensive AI-powered farm analysis.
    
    Combines:
    - Geolocation and topography analysis
    - Soil type estimation and NPK analysis
    - Weather data (from simulation or real API)
    - AI-powered crop recommendations
    - Risk assessment and mitigation strategies
    - Economic ROI projections
    
    Args:
        request: FullScanRequest with lat, lon, farm_size, budget
        
    Returns:
        FullScanResponse with complete analysis
    """
    logger.info(f"Starting full scan for location: {request.lat}, {request.lon}")
    
    # Get services
    geo_service = get_geo_service()
    soil_service = get_soil_service()
    crop_engine = get_crop_engine()
    risk_predictor = get_risk_predictor()
    simulator = get_simulator()
    
    # 1. Location Analysis
    location_data = await geo_service.lookup_location(request.lat, request.lon)
    
    # 2. Soil Analysis
    soil_data = soil_service.estimate_soil_type(
        state=location_data.state,
        terrain=location_data.terrain_type
    )
    
    # Determine soil type to use
    soil_type_str = (
        request.soil_type.value if request.soil_type 
        else soil_data.get("type", "Loamy")
    )
    
    # 3. Weather Data (from simulation)
    current_state = simulator.state
    
    # Estimate annual rainfall from current conditions
    # In production, this would come from historical API
    base_rainfall = 1200  # Default for tropical
    if location_data.terrain_type and "Coastal" in location_data.terrain_type:
        base_rainfall = 2500
    elif location_data.terrain_type and "Desert" in location_data.terrain_type:
        base_rainfall = 400
    
    # Weather trends analysis
    weather_trends = _get_weather_trends(request.lat, request.lon, location_data.state)
    
    weather_analysis = {
        "current": {
            "temperature": current_state.temperature,
            "humidity": current_state.humidity,
            "pressure": current_state.pressure,
            "soil_moisture": current_state.soil_moisture,
            "is_raining": current_state.is_raining
        },
        "estimated_annual_rainfall": base_rainfall,
        "climate_zone": _classify_climate(current_state.temperature, current_state.humidity),
        "current_alerts": [alert.model_dump() for alert in simulator.get_alerts()],
        "trends": weather_trends
    }
    
    # 4. Crop Recommendations
    crop_recommendations = crop_engine.get_recommendations(
        avg_temp=current_state.temperature,
        avg_humidity=current_state.humidity,
        annual_rainfall=base_rainfall,
        soil_type=soil_type_str,
        budget=request.budget,
        top_n=5
    )
    
    # 5. Risk Assessment
    risks = []
    if crop_recommendations:
        top_crop = crop_recommendations[0].crop_name
        risks = risk_predictor.get_risk_assessments(
            crop=top_crop,
            humidity=current_state.humidity,
            temp=current_state.temperature,
            soil_type=soil_type_str,
            rainfall=base_rainfall
        )
    
    # 6. Economic Analysis
    economic_analysis = None
    if request.farm_size and request.budget:
        economic_analysis = _calculate_economics(
            crop_recommendations, 
            request.farm_size, 
            request.budget
        )
    
    # 7. Market Analysis (NEW)
    market_analysis = _get_market_analysis(
        [c.crop_name for c in crop_recommendations[:5]],
        location_data.state
    )
    
    logger.info(f"Full scan complete. Found {len(crop_recommendations)} crop recommendations.")
    
    return FullScanResponse(
        location=location_data,
        soil_analysis=soil_data,
        weather_analysis=weather_analysis,
        crop_recommendations=crop_recommendations,
        risks=risks,
        economic_analysis=economic_analysis,
        market_analysis=market_analysis,
        generated_at=datetime.now()
    )


@router.get("/geo/lookup")
async def geo_lookup(lat: float, lon: float):
    """
    Lookup location information from coordinates.
    
    Args:
        lat: Latitude (-90 to 90)
        lon: Longitude (-180 to 180)
    
    Returns:
        Location info with city, state, country, elevation, terrain
    """
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        raise HTTPException(
            status_code=400,
            detail="Invalid coordinates. Lat must be -90 to 90, Lon must be -180 to 180"
        )
    
    geo_service = get_geo_service()
    location = await geo_service.lookup_location(lat, lon)
    
    # Add slope analysis
    if location.elevation_meters:
        slope, recommendation = geo_service.estimate_slope(location.elevation_meters)
        frost_prone, frost_msg = geo_service.check_frost_risk(lat, location.elevation_meters)
        
        return {
            **location.model_dump(),
            "slope": {
                "percentage": slope,
                "recommendation": recommendation
            },
            "frost_risk": {
                "is_prone": frost_prone,
                "message": frost_msg
            }
        }
    
    return location


@router.get("/research/crops")
async def get_crop_list(
    soil_type: str = "Loamy",
    temp: float = 28,
    humidity: float = 65,
    rainfall: float = 1200,
    limit: int = 10
):
    """
    Get crop recommendations based on conditions.
    
    Args:
        soil_type: Type of soil
        temp: Average temperature (°C)
        humidity: Average humidity (%)
        rainfall: Annual rainfall (mm)
        limit: Number of recommendations
    
    Returns:
        List of crop recommendations with feasibility scores
    """
    crop_engine = get_crop_engine()
    
    recommendations = crop_engine.get_recommendations(
        avg_temp=temp,
        avg_humidity=humidity,
        annual_rainfall=rainfall,
        soil_type=soil_type,
        top_n=limit
    )
    
    return {
        "conditions": {
            "soil_type": soil_type,
            "temperature": temp,
            "humidity": humidity,
            "rainfall": rainfall
        },
        "recommendations": recommendations,
        "total": len(recommendations)
    }


@router.post("/analysis/roi")
async def calculate_roi(
    crop: str,
    acres: float,
    budget: float
):
    """
    Calculate ROI for a specific crop.
    
    Args:
        crop: Crop name
        acres: Farm size in acres
        budget: Available budget in INR
    
    Returns:
        Detailed ROI projection
    """
    from app.services.crop_engine import CROP_DATABASE
    
    if crop not in CROP_DATABASE:
        raise HTTPException(
            status_code=404,
            detail=f"Crop '{crop}' not found in database"
        )
    
    crop_data = CROP_DATABASE[crop]
    
    # Calculate projections
    total_yield = crop_data.yield_per_acre * acres
    gross_revenue = total_yield * crop_data.market_price_per_kg
    
    # Estimate costs
    cost_per_acre = {
        "low": 15000,
        "medium": 25000,
        "high": 40000
    }.get(crop_data.water_requirement, 25000)
    
    total_cost = cost_per_acre * acres
    net_profit = gross_revenue - total_cost
    roi_percentage = (net_profit / total_cost) * 100 if total_cost > 0 else 0
    
    return {
        "crop": crop,
        "farm_size_acres": acres,
        "analysis": {
            "yield_per_acre_kg": crop_data.yield_per_acre,
            "total_yield_kg": total_yield,
            "market_price_per_kg": crop_data.market_price_per_kg,
            "gross_revenue": gross_revenue,
            "estimated_cost": total_cost,
            "net_profit": net_profit,
            "roi_percentage": round(roi_percentage, 1),
            "growing_days": crop_data.growing_days
        },
        "investment_status": "Viable" if budget >= total_cost else "Insufficient Budget",
        "breakeven_price": round(total_cost / total_yield, 2) if total_yield > 0 else 0
    }


def _classify_climate(temp: float, humidity: float) -> str:
    """Classify climate zone based on conditions."""
    if temp > 30 and humidity > 70:
        return "Tropical Humid"
    elif temp > 30 and humidity < 50:
        return "Tropical Dry"
    elif temp > 25:
        return "Subtropical"
    elif temp > 15:
        return "Temperate"
    else:
        return "Cool/Highland"


def _calculate_economics(
    crops: list,
    farm_size: float,
    budget: float
) -> dict:
    """Calculate economic projections for top crops."""
    from app.services.crop_engine import CROP_DATABASE
    
    projections = []
    
    for crop_rec in crops[:3]:  # Top 3 crops
        crop_name = crop_rec.crop_name
        if crop_name in CROP_DATABASE:
            crop = CROP_DATABASE[crop_name]
            
            total_yield = crop.yield_per_acre * farm_size
            revenue = total_yield * crop.market_price_per_kg
            cost = revenue * 0.45  # Assume 45% cost ratio
            profit = revenue - cost
            
            projections.append({
                "crop": crop_name,
                "investment_required": cost,
                "expected_revenue": revenue,
                "expected_profit": profit,
                "roi_percentage": round((profit / cost) * 100, 1) if cost > 0 else 0,
                "within_budget": cost <= budget
            })
    
    return {
        "farm_size_acres": farm_size,
        "budget": budget,
        "projections": projections,
        "recommendation": projections[0]["crop"] if projections else None
    }


def _get_weather_trends(lat: float, lon: float, state: str) -> dict:
    """
    Generate weather trends for the location.
    In production, this would fetch from a weather API with historical data.
    """
    import random
    import math
    
    # Base values adjusted by latitude (tropical vs temperate)
    is_tropical = abs(lat) < 23.5
    is_coastal = abs(lon) > 75 or abs(lon) < 78  # Rough India coastal check
    
    # Monthly temperature variation (simulated)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    base_temp = 28 if is_tropical else 22
    temp_variation = 8 if not is_tropical else 5
    
    monthly_temps = []
    monthly_rainfall = []
    
    for i, month in enumerate(months):
        # Temperature follows a sine wave peaking in May-June
        temp = base_temp + temp_variation * math.sin((i - 1) * math.pi / 6)
        monthly_temps.append({"month": month, "avg_temp": round(temp, 1)})
        
        # Rainfall peaks during monsoon (Jun-Sep for India)
        if 5 <= i <= 8:  # Monsoon months
            rain = random.randint(150, 350) if is_coastal else random.randint(80, 200)
        elif 9 <= i <= 11:  # Post-monsoon
            rain = random.randint(20, 80)
        else:  # Dry season
            rain = random.randint(5, 40)
        monthly_rainfall.append({"month": month, "rainfall_mm": rain})
    
    # Seasonal analysis
    seasons = {
        "kharif": {
            "period": "June - October",
            "conditions": "Monsoon, high humidity, warm",
            "suitable_crops": ["Rice", "Cotton", "Sugarcane", "Maize"]
        },
        "rabi": {
            "period": "November - March", 
            "conditions": "Winter, moderate rainfall, cool nights",
            "suitable_crops": ["Wheat", "Mustard", "Chickpea", "Potato"]
        },
        "zaid": {
            "period": "March - June",
            "conditions": "Summer, hot, irrigation dependent",
            "suitable_crops": ["Watermelon", "Cucumber", "Muskmelon", "Vegetables"]
        }
    }
    
    # Current season
    from datetime import datetime
    month = datetime.now().month
    if 6 <= month <= 10:
        current_season = "kharif"
    elif month >= 11 or month <= 3:
        current_season = "rabi"
    else:
        current_season = "zaid"
    
    return {
        "monthly_temperature": monthly_temps,
        "monthly_rainfall": monthly_rainfall,
        "annual_rainfall_mm": sum(r["rainfall_mm"] for r in monthly_rainfall),
        "seasons": seasons,
        "current_season": current_season,
        "climate_summary": f"{'Tropical' if is_tropical else 'Subtropical'} climate with monsoon influence. "
                          f"Best growing season: {seasons[current_season]['period']}"
    }


def _get_market_analysis(crops: list, state: str) -> dict:
    """
    Generate market demand/supply analysis for recommended crops.
    In production, this would fetch from agricultural market APIs.
    """
    import random
    
    # Market data for crops (simulated realistic Indian market)
    market_data = {
        "Rice": {"msp": 2183, "market_price": 2400, "demand": "high", "export_potential": "medium"},
        "Wheat": {"msp": 2125, "market_price": 2350, "demand": "high", "export_potential": "low"},
        "Cotton": {"msp": 6620, "market_price": 7200, "demand": "high", "export_potential": "high"},
        "Sugarcane": {"msp": 315, "market_price": 350, "demand": "high", "export_potential": "medium"},
        "Maize": {"msp": 2090, "market_price": 2200, "demand": "medium", "export_potential": "medium"},
        "Soybean": {"msp": 4600, "market_price": 5100, "demand": "high", "export_potential": "high"},
        "Groundnut": {"msp": 6377, "market_price": 6800, "demand": "medium", "export_potential": "medium"},
        "Mustard": {"msp": 5650, "market_price": 6200, "demand": "high", "export_potential": "low"},
        "Chickpea": {"msp": 5440, "market_price": 5800, "demand": "high", "export_potential": "medium"},
        "Potato": {"msp": 0, "market_price": 1800, "demand": "very high", "export_potential": "low"},
        "Tomato": {"msp": 0, "market_price": 2500, "demand": "very high", "export_potential": "low"},
        "Onion": {"msp": 0, "market_price": 2200, "demand": "very high", "export_potential": "medium"},
        "Turmeric": {"msp": 0, "market_price": 8500, "demand": "high", "export_potential": "high"},
        "Chilli": {"msp": 0, "market_price": 12000, "demand": "high", "export_potential": "high"},
        "Banana": {"msp": 0, "market_price": 2000, "demand": "high", "export_potential": "medium"},
        "Mango": {"msp": 0, "market_price": 5000, "demand": "very high", "export_potential": "high"},
        "Coconut": {"msp": 0, "market_price": 2500, "demand": "high", "export_potential": "medium"},
        "Tea": {"msp": 0, "market_price": 25000, "demand": "high", "export_potential": "very high"},
        "Coffee": {"msp": 0, "market_price": 35000, "demand": "high", "export_potential": "very high"},
        "Cardamom": {"msp": 0, "market_price": 120000, "demand": "medium", "export_potential": "very high"},
    }
    
    crop_analysis = []
    
    for crop in crops:
        if crop in market_data:
            data = market_data[crop]
            
            # Price trend (simulated)
            price_trend = random.choice(["rising", "stable", "falling"])
            price_change = random.randint(5, 15) if price_trend != "stable" else 0
            
            # Supply status
            supply = random.choice(["surplus", "adequate", "shortage"])
            
            crop_analysis.append({
                "crop": crop,
                "current_price_per_quintal": data["market_price"],
                "msp_per_quintal": data["msp"] if data["msp"] > 0 else "Not applicable",
                "price_trend": price_trend,
                "price_change_percent": price_change if price_trend == "rising" else -price_change if price_trend == "falling" else 0,
                "demand_level": data["demand"],
                "supply_status": supply,
                "export_potential": data["export_potential"],
                "market_outlook": _get_market_outlook(data["demand"], supply, price_trend)
            })
        else:
            crop_analysis.append({
                "crop": crop,
                "current_price_per_quintal": "Data not available",
                "demand_level": "medium",
                "supply_status": "adequate",
                "market_outlook": "Stable market conditions expected"
            })
    
    # Regional market info
    regional_info = {
        "Karnataka": {"major_market": "APMC Yeshwanthpur, Bangalore", "specialty": "Coffee, Ragi"},
        "Tamil Nadu": {"major_market": "Koyambedu, Chennai", "specialty": "Rice, Banana"},
        "Maharashtra": {"major_market": "APMC Vashi, Mumbai", "specialty": "Onion, Sugarcane"},
        "Punjab": {"major_market": "Grain Market, Ludhiana", "specialty": "Wheat, Rice"},
        "Gujarat": {"major_market": "APMC Unjha", "specialty": "Cotton, Groundnut"},
        "Andhra Pradesh": {"major_market": "Guntur Market", "specialty": "Chilli, Rice"},
        "Uttar Pradesh": {"major_market": "Azadpur Mandi", "specialty": "Potato, Wheat"},
    }
    
    return {
        "crop_analysis": crop_analysis,
        "regional_market": regional_info.get(state, {
            "major_market": "Local APMC Market",
            "specialty": "Varies by region"
        }),
        "market_summary": "Current market shows favorable conditions for most recommended crops. "
                         "MSP (Minimum Support Price) ensures price floor for major crops.",
        "best_time_to_sell": "Post-harvest (3-4 weeks) for perishables, storage for 2-3 months for grains",
        "price_source": "Simulated data based on typical Indian agricultural market trends"
    }


def _get_market_outlook(demand: str, supply: str, trend: str) -> str:
    """Generate market outlook based on conditions."""
    if demand in ["high", "very high"] and supply == "shortage":
        return "🔥 Excellent - High demand with limited supply. Premium prices expected."
    elif demand in ["high", "very high"] and supply == "adequate":
        return "👍 Good - Strong demand with stable prices."
    elif demand in ["high", "very high"] and supply == "surplus":
        return "⚠️ Moderate - High demand but oversupply may pressure prices."
    elif demand == "medium" and supply == "shortage":
        return "👍 Good - Moderate demand with limited supply supports prices."
    elif demand == "medium" and supply == "adequate":
        return "➡️ Stable - Balanced market conditions."
    else:
        return "⚠️ Cautious - Consider storage or alternative markets."
