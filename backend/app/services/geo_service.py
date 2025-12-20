"""
Geo-Intelligence Service
========================
Location-based analysis including geocoding, topography, and regional data.
"""

from typing import Optional, Tuple
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import logging
import math

from app.models.schemas import GeoLookupResponse

logger = logging.getLogger("agri-nexus.geo")


class GeoService:
    """
    Provides geolocation and topography analysis services.
    
    Features:
    - Reverse geocoding (lat/lon to address)
    - Rough elevation estimation
    - Terrain/slope analysis
    - Regional soil type estimation
    """
    
    def __init__(self):
        """Initialize the geocoder with a user agent."""
        self.geocoder = Nominatim(
            user_agent="agri-nexus-digital-twin",
            timeout=10
        )
    
    async def lookup_location(self, lat: float, lon: float) -> GeoLookupResponse:
        """
        Get location information from coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            GeoLookupResponse with city, state, country, elevation
        """
        try:
            location = self.geocoder.reverse(f"{lat}, {lon}", language="en")
            
            if location:
                address = location.raw.get("address", {})
                
                # Extract location components
                city = (
                    address.get("city") or 
                    address.get("town") or 
                    address.get("village") or
                    address.get("municipality")
                )
                state = address.get("state")
                country = address.get("country")
                
                # Estimate elevation (mock - would use real elevation API)
                elevation = self._estimate_elevation(lat, lon)
                
                # Determine terrain type
                terrain = self._analyze_terrain(lat, lon, elevation)
                
                return GeoLookupResponse(
                    city=city,
                    state=state,
                    country=country,
                    elevation_meters=elevation,
                    terrain_type=terrain
                )
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            logger.error(f"Geocoding error: {e}")
        except Exception as e:
            logger.error(f"Unexpected geo error: {e}")
        
        return GeoLookupResponse(
            terrain_type="Unknown"
        )
    
    def _estimate_elevation(self, lat: float, lon: float) -> float:
        """
        Estimate elevation based on location.
        
        Note: In production, this would call a real elevation API
        like Google Elevation or OpenTopoData.
        """
        # Mock elevation based on known regions in India
        elevation_map = {
            # Coastal regions (low elevation)
            "coastal_karnataka": (12.5, 15.5, 74, 75.5, 50),
            "kerala_coast": (8, 12, 75.5, 77, 30),
            "goa": (14.8, 15.8, 73.5, 74.5, 20),
            
            # Western Ghats (high elevation)
            "western_ghats_south": (10, 14, 75, 77, 800),
            "western_ghats_north": (14, 17, 73.5, 75, 600),
            
            # Deccan Plateau
            "deccan_plateau": (15, 20, 74, 79, 450),
            
            # North India Plains
            "indo_gangetic": (25, 30, 75, 88, 100),
            
            # Himalayas
            "himalaya_foothills": (28, 32, 76, 80, 1200),
        }
        
        for region, (lat_min, lat_max, lon_min, lon_max, elev) in elevation_map.items():
            if lat_min <= lat <= lat_max and lon_min <= lon <= lon_max:
                # Add some variation
                return elev + (lat * 10 % 50) - 25
        
        # Default mid-elevation
        return 300.0
    
    def _analyze_terrain(self, lat: float, lon: float, elevation: float) -> str:
        """
        Analyze terrain type based on location and elevation.
        """
        # Simple heuristics
        if elevation < 50:
            return "Coastal Plain"
        elif elevation < 200:
            return "Low-lying Plain"
        elif elevation < 500:
            return "Plateau"
        elif elevation < 800:
            return "Hilly Terrain"
        elif elevation < 1500:
            return "Mountain Foothills"
        else:
            return "High Altitude"
    
    def estimate_slope(self, elevation: float) -> Tuple[float, str]:
        """
        Estimate slope grade and farming recommendation.
        
        Returns:
            Tuple of (slope_percentage, farming_recommendation)
        """
        # Mock slope based on elevation and terrain
        if elevation < 100:
            slope = 2.0
            recommendation = "Flat terrain - suitable for all crops"
        elif elevation < 300:
            slope = 5.0
            recommendation = "Gentle slope - standard farming practices"
        elif elevation < 600:
            slope = 12.0
            recommendation = "Moderate slope - contour farming recommended"
        elif elevation < 1000:
            slope = 18.0
            recommendation = "Steep slope - terrace farming needed"
        else:
            slope = 25.0
            recommendation = "Very steep - specialized hill farming only"
        
        return slope, recommendation
    
    def check_frost_risk(self, lat: float, elevation: float) -> Tuple[bool, str]:
        """
        Check if location is frost-prone.
        
        Valley bottoms and high elevations are frost-prone.
        """
        # High latitude or elevation = frost risk
        is_frost_prone = elevation > 1000 or lat > 30
        
        if is_frost_prone:
            if elevation > 1500:
                return True, "High elevation - severe frost risk in winter"
            elif lat > 32:
                return True, "Northern latitude - moderate frost risk"
            else:
                return True, "Mild frost risk - consider frost-tolerant varieties"
        
        return False, "Low frost risk"


class SoilTaxonomyService:
    """
    Provides soil type estimation based on region.
    """
    
    # Regional soil type mapping for India
    REGIONAL_SOIL_MAP = {
        # State-based soil types
        "Punjab": {"primary": "Alluvial", "npk": (280, 22, 210)},
        "Haryana": {"primary": "Alluvial", "npk": (260, 18, 200)},
        "Karnataka": {"primary": "Red", "npk": (180, 12, 150)},
        "Maharashtra": {"primary": "Black (Regur)", "npk": (220, 25, 280)},
        "Kerala": {"primary": "Laterite", "npk": (160, 8, 120)},
        "Tamil Nadu": {"primary": "Red", "npk": (170, 10, 140)},
        "Andhra Pradesh": {"primary": "Black (Regur)", "npk": (200, 20, 240)},
        "Gujarat": {"primary": "Black (Regur)", "npk": (210, 22, 260)},
        "Rajasthan": {"primary": "Desert", "npk": (120, 6, 80)},
        "West Bengal": {"primary": "Alluvial", "npk": (290, 24, 220)},
        "Uttar Pradesh": {"primary": "Alluvial", "npk": (270, 20, 200)},
        "Madhya Pradesh": {"primary": "Black (Regur)", "npk": (190, 18, 230)},
    }
    
    # Soil characteristics
    SOIL_PROFILES = {
        "Alluvial": {
            "texture": "Sandy Loam to Silty Clay",
            "drainage": "Good to Moderate",
            "ph_range": (6.5, 8.0),
            "water_retention": "Moderate",
            "fertility": "High",
            "suitable_crops": ["Rice", "Wheat", "Sugarcane", "Vegetables"]
        },
        "Black (Regur)": {
            "texture": "Clay",
            "drainage": "Poor",
            "ph_range": (7.5, 8.5),
            "water_retention": "High",
            "fertility": "High",
            "suitable_crops": ["Cotton", "Soybean", "Wheat", "Pulses"]
        },
        "Red": {
            "texture": "Sandy to Loamy",
            "drainage": "Good",
            "ph_range": (6.0, 7.0),
            "water_retention": "Low",
            "fertility": "Low to Medium",
            "suitable_crops": ["Groundnut", "Millets", "Tobacco", "Vegetables"]
        },
        "Laterite": {
            "texture": "Gravelly",
            "drainage": "Excessive",
            "ph_range": (5.0, 6.0),
            "water_retention": "Very Low",
            "fertility": "Low",
            "suitable_crops": ["Cashew", "Coconut", "Arecanut", "Rubber"]
        },
        "Desert": {
            "texture": "Sandy",
            "drainage": "Excessive",
            "ph_range": (8.0, 8.5),
            "water_retention": "Very Low",
            "fertility": "Very Low",
            "suitable_crops": ["Millets", "Guar", "Dates"]
        }
    }
    
    def estimate_soil_type(self, state: Optional[str], terrain: Optional[str]) -> dict:
        """
        Estimate soil type based on region.
        
        Args:
            state: Indian state name
            terrain: Terrain type from geo analysis
            
        Returns:
            Complete soil analysis dict
        """
        # Try state-based lookup
        if state and state in self.REGIONAL_SOIL_MAP:
            soil_info = self.REGIONAL_SOIL_MAP[state]
            primary_soil = soil_info["primary"]
            npk = soil_info["npk"]
        else:
            # Default based on terrain
            if terrain and "Coastal" in terrain:
                primary_soil = "Alluvial"
                npk = (250, 18, 180)
            elif terrain and "Plateau" in terrain:
                primary_soil = "Black (Regur)"
                npk = (200, 20, 240)
            elif terrain and "Mountain" in terrain:
                primary_soil = "Mountain"
                npk = (150, 10, 130)
            else:
                primary_soil = "Loamy"
                npk = (200, 15, 170)
        
        # Get profile if available
        profile = self.SOIL_PROFILES.get(primary_soil, {})
        
        return {
            "type": primary_soil,
            "npk": {
                "nitrogen_kg_ha": npk[0],
                "phosphorus_kg_ha": npk[1],
                "potassium_kg_ha": npk[2]
            },
            "profile": profile,
            "recommendation": self._get_soil_recommendation(primary_soil, npk)
        }
    
    def _get_soil_recommendation(self, soil_type: str, npk: Tuple[int, int, int]) -> str:
        """Generate recommendation based on soil analysis."""
        n, p, k = npk
        
        recommendations = []
        
        if n < 200:
            recommendations.append("Apply nitrogen-rich fertilizers (Urea)")
        if p < 15:
            recommendations.append("Add phosphorus (DAP or SSP)")
        if k < 150:
            recommendations.append("Supplement with potash (MOP)")
        
        if soil_type == "Laterite":
            recommendations.append("Add lime to correct acidity")
            recommendations.append("Apply organic matter to improve water retention")
        elif soil_type == "Black (Regur)":
            recommendations.append("Ensure proper drainage for monsoon")
            recommendations.append("Avoid over-irrigation")
        elif soil_type == "Desert":
            recommendations.append("Focus on drip irrigation")
            recommendations.append("Add organic matter extensively")
        
        return "; ".join(recommendations) if recommendations else "Soil is well-balanced"


# Singleton instances
_geo_service: Optional[GeoService] = None
_soil_service: Optional[SoilTaxonomyService] = None


def get_geo_service() -> GeoService:
    global _geo_service
    if _geo_service is None:
        _geo_service = GeoService()
    return _geo_service


def get_soil_service() -> SoilTaxonomyService:
    global _soil_service
    if _soil_service is None:
        _soil_service = SoilTaxonomyService()
    return _soil_service
