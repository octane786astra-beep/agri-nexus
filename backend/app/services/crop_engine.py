"""
Crop Feasibility & Recommendation Engine
=========================================
AI-powered crop recommendation based on environmental conditions.
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
import logging

from app.models.schemas import CropFeasibility, RiskAssessment

logger = logging.getLogger("agri-nexus.crops")


@dataclass
class CropRequirements:
    """Requirements for a specific crop."""
    name: str
    min_temp: float
    max_temp: float
    min_rainfall: float  # mm annual
    max_rainfall: float
    min_humidity: float
    max_humidity: float
    suitable_soils: List[str]
    growing_season: str
    water_requirement: str  # low, medium, high
    market_price_per_kg: float  # INR
    yield_per_acre: float  # kg
    growing_days: int


# Crop Database - 20 major crops for India
CROP_DATABASE: Dict[str, CropRequirements] = {
    "Rice": CropRequirements(
        name="Rice",
        min_temp=20, max_temp=35,
        min_rainfall=1000, max_rainfall=2500,
        min_humidity=60, max_humidity=95,
        suitable_soils=["Alluvial", "Clay", "Black (Regur)"],
        growing_season="Kharif (June-Nov)",
        water_requirement="high",
        market_price_per_kg=25,
        yield_per_acre=2500,
        growing_days=120
    ),
    "Wheat": CropRequirements(
        name="Wheat",
        min_temp=10, max_temp=25,
        min_rainfall=400, max_rainfall=1000,
        min_humidity=40, max_humidity=70,
        suitable_soils=["Alluvial", "Loamy", "Clay"],
        growing_season="Rabi (Oct-Mar)",
        water_requirement="medium",
        market_price_per_kg=22,
        yield_per_acre=1800,
        growing_days=140
    ),
    "Cotton": CropRequirements(
        name="Cotton",
        min_temp=21, max_temp=35,
        min_rainfall=500, max_rainfall=1200,
        min_humidity=50, max_humidity=75,
        suitable_soils=["Black (Regur)", "Alluvial"],
        growing_season="Kharif (June-Dec)",
        water_requirement="medium",
        market_price_per_kg=65,
        yield_per_acre=600,
        growing_days=180
    ),
    "Sugarcane": CropRequirements(
        name="Sugarcane",
        min_temp=20, max_temp=40,
        min_rainfall=1000, max_rainfall=2000,
        min_humidity=60, max_humidity=90,
        suitable_soils=["Alluvial", "Loamy", "Black (Regur)"],
        growing_season="Year-round",
        water_requirement="high",
        market_price_per_kg=3,
        yield_per_acre=35000,
        growing_days=365
    ),
    "Groundnut": CropRequirements(
        name="Groundnut",
        min_temp=20, max_temp=35,
        min_rainfall=500, max_rainfall=1200,
        min_humidity=40, max_humidity=70,
        suitable_soils=["Red", "Sandy Loam", "Loamy"],
        growing_season="Kharif/Rabi",
        water_requirement="low",
        market_price_per_kg=55,
        yield_per_acre=1200,
        growing_days=100
    ),
    "Soybean": CropRequirements(
        name="Soybean",
        min_temp=20, max_temp=30,
        min_rainfall=500, max_rainfall=1000,
        min_humidity=50, max_humidity=80,
        suitable_soils=["Black (Regur)", "Loamy"],
        growing_season="Kharif (June-Oct)",
        water_requirement="medium",
        market_price_per_kg=42,
        yield_per_acre=800,
        growing_days=100
    ),
    "Maize": CropRequirements(
        name="Maize",
        min_temp=18, max_temp=32,
        min_rainfall=500, max_rainfall=1200,
        min_humidity=50, max_humidity=80,
        suitable_soils=["Alluvial", "Loamy", "Red"],
        growing_season="Kharif/Rabi",
        water_requirement="medium",
        market_price_per_kg=18,
        yield_per_acre=2000,
        growing_days=90
    ),
    "Tomato": CropRequirements(
        name="Tomato",
        min_temp=15, max_temp=30,
        min_rainfall=400, max_rainfall=800,
        min_humidity=50, max_humidity=75,
        suitable_soils=["Loamy", "Alluvial", "Red"],
        growing_season="Rabi (Oct-Mar)",
        water_requirement="medium",
        market_price_per_kg=30,
        yield_per_acre=15000,
        growing_days=90
    ),
    "Onion": CropRequirements(
        name="Onion",
        min_temp=15, max_temp=30,
        min_rainfall=350, max_rainfall=800,
        min_humidity=40, max_humidity=70,
        suitable_soils=["Loamy", "Alluvial"],
        growing_season="Rabi (Oct-Mar)",
        water_requirement="low",
        market_price_per_kg=25,
        yield_per_acre=12000,
        growing_days=120
    ),
    "Potato": CropRequirements(
        name="Potato",
        min_temp=10, max_temp=25,
        min_rainfall=400, max_rainfall=800,
        min_humidity=50, max_humidity=80,
        suitable_soils=["Loamy", "Sandy Loam", "Alluvial"],
        growing_season="Rabi (Oct-Feb)",
        water_requirement="medium",
        market_price_per_kg=20,
        yield_per_acre=10000,
        growing_days=100
    ),
    "Arecanut": CropRequirements(
        name="Arecanut",
        min_temp=18, max_temp=35,
        min_rainfall=2000, max_rainfall=4000,
        min_humidity=70, max_humidity=95,
        suitable_soils=["Laterite", "Alluvial", "Red"],
        growing_season="Perennial",
        water_requirement="high",
        market_price_per_kg=400,
        yield_per_acre=1500,
        growing_days=365
    ),
    "Coconut": CropRequirements(
        name="Coconut",
        min_temp=20, max_temp=35,
        min_rainfall=1500, max_rainfall=3000,
        min_humidity=60, max_humidity=90,
        suitable_soils=["Laterite", "Alluvial", "Sandy Loam"],
        growing_season="Perennial",
        water_requirement="medium",
        market_price_per_kg=15,
        yield_per_acre=8000,
        growing_days=365
    ),
    "Coffee": CropRequirements(
        name="Coffee",
        min_temp=15, max_temp=28,
        min_rainfall=1500, max_rainfall=2500,
        min_humidity=70, max_humidity=90,
        suitable_soils=["Laterite", "Red", "Loamy"],
        growing_season="Perennial",
        water_requirement="medium",
        market_price_per_kg=350,
        yield_per_acre=500,
        growing_days=365
    ),
    "Tea": CropRequirements(
        name="Tea",
        min_temp=13, max_temp=28,
        min_rainfall=1500, max_rainfall=3000,
        min_humidity=70, max_humidity=95,
        suitable_soils=["Red", "Loamy", "Laterite"],
        growing_season="Perennial",
        water_requirement="high",
        market_price_per_kg=250,
        yield_per_acre=800,
        growing_days=365
    ),
    "Banana": CropRequirements(
        name="Banana",
        min_temp=20, max_temp=35,
        min_rainfall=1000, max_rainfall=2500,
        min_humidity=60, max_humidity=90,
        suitable_soils=["Alluvial", "Loamy", "Red"],
        growing_season="Year-round",
        water_requirement="high",
        market_price_per_kg=30,
        yield_per_acre=25000,
        growing_days=300
    ),
    "Mango": CropRequirements(
        name="Mango",
        min_temp=20, max_temp=40,
        min_rainfall=800, max_rainfall=2500,
        min_humidity=40, max_humidity=80,
        suitable_soils=["Alluvial", "Loamy", "Red"],
        growing_season="Perennial (harvest Mar-Jun)",
        water_requirement="low",
        market_price_per_kg=60,
        yield_per_acre=5000,
        growing_days=365
    ),
    "Chilli": CropRequirements(
        name="Chilli",
        min_temp=18, max_temp=35,
        min_rainfall=600, max_rainfall=1200,
        min_humidity=50, max_humidity=70,
        suitable_soils=["Loamy", "Alluvial", "Red"],
        growing_season="Kharif/Rabi",
        water_requirement="medium",
        market_price_per_kg=120,
        yield_per_acre=3000,
        growing_days=120
    ),
    "Turmeric": CropRequirements(
        name="Turmeric",
        min_temp=20, max_temp=35,
        min_rainfall=1500, max_rainfall=2500,
        min_humidity=70, max_humidity=90,
        suitable_soils=["Alluvial", "Loamy", "Red"],
        growing_season="Kharif (Jun-Feb)",
        water_requirement="medium",
        market_price_per_kg=80,
        yield_per_acre=6000,
        growing_days=240
    ),
    "Ginger": CropRequirements(
        name="Ginger",
        min_temp=20, max_temp=32,
        min_rainfall=1500, max_rainfall=3000,
        min_humidity=70, max_humidity=90,
        suitable_soils=["Loamy", "Alluvial", "Red"],
        growing_season="Kharif (Apr-Dec)",
        water_requirement="high",
        market_price_per_kg=90,
        yield_per_acre=5000,
        growing_days=240
    ),
    "Black Pepper": CropRequirements(
        name="Black Pepper",
        min_temp=20, max_temp=35,
        min_rainfall=2000, max_rainfall=4000,
        min_humidity=75, max_humidity=95,
        suitable_soils=["Laterite", "Red", "Loamy"],
        growing_season="Perennial",
        water_requirement="high",
        market_price_per_kg=500,
        yield_per_acre=400,
        growing_days=365
    ),
}


class CropFeasibilityEngine:
    """
    Calculates crop feasibility scores based on environmental conditions.
    """
    
    def __init__(self):
        self.crops = CROP_DATABASE
    
    def calculate_feasibility(
        self,
        crop: CropRequirements,
        avg_temp: float,
        avg_humidity: float,
        annual_rainfall: float,
        soil_type: str
    ) -> float:
        """
        Calculate feasibility score (0-100) for a crop.
        
        Score components:
        - Temperature match: 30%
        - Humidity match: 20%
        - Rainfall match: 25%
        - Soil match: 25%
        """
        score = 0.0
        
        # Temperature score (30%)
        if crop.min_temp <= avg_temp <= crop.max_temp:
            # Perfect range
            temp_score = 30
        elif avg_temp < crop.min_temp:
            # Too cold
            diff = crop.min_temp - avg_temp
            temp_score = max(0, 30 - (diff * 3))
        else:
            # Too hot
            diff = avg_temp - crop.max_temp
            temp_score = max(0, 30 - (diff * 3))
        score += temp_score
        
        # Humidity score (20%)
        if crop.min_humidity <= avg_humidity <= crop.max_humidity:
            hum_score = 20
        elif avg_humidity < crop.min_humidity:
            diff = crop.min_humidity - avg_humidity
            hum_score = max(0, 20 - (diff * 0.5))
        else:
            diff = avg_humidity - crop.max_humidity
            hum_score = max(0, 20 - (diff * 0.5))
        score += hum_score
        
        # Rainfall score (25%)
        if crop.min_rainfall <= annual_rainfall <= crop.max_rainfall:
            rain_score = 25
        elif annual_rainfall < crop.min_rainfall:
            ratio = annual_rainfall / crop.min_rainfall
            rain_score = 25 * ratio
        else:
            excess = annual_rainfall - crop.max_rainfall
            rain_score = max(0, 25 - (excess / 100))
        score += rain_score
        
        # Soil score (25%)
        if soil_type in crop.suitable_soils:
            soil_score = 25
        else:
            # Partial match for similar soils
            similar_mappings = {
                "Loamy": ["Alluvial", "Sandy Loam"],
                "Clay": ["Black (Regur)"],
                "Sandy": ["Sandy Loam", "Desert"],
                "Mountain": ["Laterite", "Red"]
            }
            soil_score = 10  # Default partial
            for base, similars in similar_mappings.items():
                if soil_type == base and any(s in crop.suitable_soils for s in similars):
                    soil_score = 18
                    break
        score += soil_score
        
        return round(score, 1)
    
    def get_recommendations(
        self,
        avg_temp: float,
        avg_humidity: float,
        annual_rainfall: float,
        soil_type: str,
        budget: Optional[float] = None,
        top_n: int = 5
    ) -> List[CropFeasibility]:
        """
        Get top crop recommendations based on conditions.
        
        Args:
            avg_temp: Average temperature (°C)
            avg_humidity: Average humidity (%)
            annual_rainfall: Annual rainfall (mm)
            soil_type: Soil type string
            budget: Optional budget in INR
            top_n: Number of recommendations to return
            
        Returns:
            List of CropFeasibility objects sorted by score
        """
        recommendations = []
        
        for crop_name, crop in self.crops.items():
            score = self.calculate_feasibility(
                crop, avg_temp, avg_humidity, annual_rainfall, soil_type
            )
            
            # Calculate ROI
            revenue = crop.yield_per_acre * crop.market_price_per_kg
            # Estimate cost as 40% of revenue (varies by crop)
            cost_ratio = 0.5 if crop.water_requirement == "high" else 0.4
            cost = revenue * cost_ratio
            roi = ((revenue - cost) / cost) * 100 if cost > 0 else 0
            
            # Identify risks
            risks = self._identify_risks(crop, avg_temp, avg_humidity, annual_rainfall)
            
            recommendations.append(CropFeasibility(
                crop_name=crop_name,
                feasibility_score=score,
                roi_estimate=round(roi, 1),
                growing_season=crop.growing_season,
                requirements={
                    "temp_range": f"{crop.min_temp}-{crop.max_temp}°C",
                    "rainfall": f"{crop.min_rainfall}-{crop.max_rainfall}mm",
                    "water_need": crop.water_requirement,
                    "growing_days": crop.growing_days
                },
                risks=risks
            ))
        
        # Sort by feasibility score
        recommendations.sort(key=lambda x: x.feasibility_score, reverse=True)
        
        return recommendations[:top_n]
    
    def _identify_risks(
        self,
        crop: CropRequirements,
        temp: float,
        humidity: float,
        rainfall: float
    ) -> List[str]:
        """Identify potential risks for a crop given conditions."""
        risks = []
        
        # Temperature risks
        if temp > crop.max_temp:
            risks.append("Heat stress risk")
        if temp < crop.min_temp:
            risks.append("Cold damage risk")
        
        # Water risks
        if rainfall < crop.min_rainfall:
            risks.append("Drought stress - irrigation required")
        if rainfall > crop.max_rainfall * 1.2:
            risks.append("Waterlogging risk")
        
        # Humidity risks
        if humidity > 85:
            if crop.name in ["Arecanut", "Coconut", "Black Pepper"]:
                risks.append("Koleroga (Fruit Rot) disease risk")
            elif crop.name in ["Tomato", "Potato", "Chilli"]:
                risks.append("Fungal disease risk (Late Blight)")
        
        return risks


class RiskPredictor:
    """
    Predicts agricultural challenges and provides mitigation strategies.
    """
    
    RISK_MITIGATIONS = {
        "Heat stress risk": "Install shade nets; increase irrigation frequency; apply mulch",
        "Cold damage risk": "Use frost covers; apply potassium fertilizer to strengthen plants",
        "Drought stress - irrigation required": "Set up drip irrigation; apply organic mulch; consider drought-resistant varieties",
        "Waterlogging risk": "Dig drainage trenches; create raised beds; avoid planting in low-lying areas",
        "Koleroga (Fruit Rot) disease risk": "Apply Bordeaux mixture before monsoon; ensure proper tree spacing; remove infected parts",
        "Fungal disease risk (Late Blight)": "Apply copper-based fungicides; ensure plant spacing; avoid overhead irrigation",
        "Pest infestation risk": "Implement integrated pest management; use pheromone traps; encourage natural predators",
    }
    
    def get_risk_assessments(
        self,
        crop: str,
        humidity: float,
        temp: float,
        soil_type: str,
        rainfall: float
    ) -> List[RiskAssessment]:
        """Generate comprehensive risk assessment."""
        risks = []
        
        # High humidity + specific crops = disease risk
        if humidity > 85:
            if crop in ["Arecanut", "Coconut", "Black Pepper"]:
                risks.append(RiskAssessment(
                    risk_type="Disease",
                    probability=75.0,
                    description="High risk of Koleroga (Fruit Rot) due to humidity > 85%",
                    mitigation=self.RISK_MITIGATIONS["Koleroga (Fruit Rot) disease risk"]
                ))
        
        # Clay soil + heavy rain = waterlogging
        if soil_type in ["Clay", "Black (Regur)"] and rainfall > 1500:
            risks.append(RiskAssessment(
                risk_type="Waterlogging",
                probability=60.0,
                description="Clay soil combined with heavy rainfall may cause waterlogging",
                mitigation=self.RISK_MITIGATIONS["Waterlogging risk"]
            ))
        
        # High temp = heat stress
        if temp > 38:
            risks.append(RiskAssessment(
                risk_type="Heat Stress",
                probability=80.0,
                description="Temperature exceeds 38°C - crop stress likely",
                mitigation=self.RISK_MITIGATIONS["Heat stress risk"]
            ))
        
        # Low rainfall = drought
        if rainfall < 600:
            risks.append(RiskAssessment(
                risk_type="Drought",
                probability=70.0,
                description="Annual rainfall below 600mm - irrigation critical",
                mitigation=self.RISK_MITIGATIONS["Drought stress - irrigation required"]
            ))
        
        return risks


# Singleton instances
_crop_engine: Optional[CropFeasibilityEngine] = None
_risk_predictor: Optional[RiskPredictor] = None


def get_crop_engine() -> CropFeasibilityEngine:
    global _crop_engine
    if _crop_engine is None:
        _crop_engine = CropFeasibilityEngine()
    return _crop_engine


def get_risk_predictor() -> RiskPredictor:
    global _risk_predictor
    if _risk_predictor is None:
        _risk_predictor = RiskPredictor()
    return _risk_predictor
