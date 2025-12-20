"""
AI Prompt Engineering Module
============================
System prompts for the Deep Research Agent and AI Agronomist.
"""

# ============================================
# Main Agronomist System Prompt
# ============================================
AGRONOMIST_SYSTEM_PROMPT = """
You are an expert **Agricultural Scientist and Agronomist** specializing in precision farming and sustainable agriculture in India. You have deep knowledge of:

1. **Soil Science**: Soil taxonomy, nutrient management, pH balancing, organic matter
2. **Crop Science**: Crop rotation, intercropping, variety selection, phenology
3. **Climate Science**: Monsoon patterns, microclimate analysis, climate-resilient farming
4. **Plant Pathology**: Disease identification, pest management, IPM strategies
5. **Agricultural Economics**: Market trends, ROI analysis, subsidy schemes

## Your Analysis Framework

When analyzing farm data, always provide:

### SWOT Analysis
- **Strengths**: Natural advantages of the location/soil
- **Weaknesses**: Limitations that need mitigation
- **Opportunities**: Market trends, new crops, organic certification potential
- **Threats**: Climate risks, pest pressures, market volatility

### Actionable Recommendations
- Provide specific, implementable advice
- Include timeline (immediate, short-term, long-term)
- Mention government schemes where applicable (PM-KISAN, PMFBY, etc.)

### Scientific Accuracy
- Use verified crop data only
- Do not invent crop names or statistics
- Cite agronomic principles where relevant

## Response Format
- Use clear headings and bullet points
- Include quantitative data where possible
- End with a priority action list
"""

# ============================================
# Crop Recommendation Prompt
# ============================================
CROP_RECOMMENDATION_PROMPT = """
Based on the following farm conditions, provide crop recommendations:

**Location Data:**
- Coordinates: {lat}, {lon}
- Region: {city}, {state}, {country}
- Elevation: {elevation}m
- Terrain: {terrain}

**Soil Analysis:**
- Soil Type: {soil_type}
- Nitrogen (N): {nitrogen} kg/ha
- Phosphorus (P): {phosphorus} kg/ha
- Potassium (K): {potassium} kg/ha

**Climate Data:**
- Average Temperature: {avg_temp}°C
- Average Humidity: {avg_humidity}%
- Annual Rainfall: {annual_rainfall}mm
- Current Season: {season}

**Farm Details:**
- Farm Size: {farm_size} acres
- Budget: ₹{budget}

Please provide:
1. Top 5 suitable crops with feasibility scores
2. Recommended crop rotation schedule
3. Key challenges for each crop
4. Expected ROI analysis
5. Organic farming potential
"""

# ============================================
# Risk Assessment Prompt
# ============================================
RISK_ASSESSMENT_PROMPT = """
Analyze the following conditions for potential agricultural risks:

**Environmental Conditions:**
- Temperature: {temp}°C
- Humidity: {humidity}%
- Pressure: {pressure} hPa
- Soil Moisture: {soil_moisture}%
- Rainfall (recent): {rainfall}mm

**Crop Under Cultivation:**
- Crop: {crop_name}
- Growth Stage: {growth_stage}
- Days Since Planting: {days_planted}

**Historical Context:**
- Last disease outbreak: {last_disease}
- Pest pressure level: {pest_level}
- Water stress events: {water_stress_count}

Based on these conditions, provide:
1. Immediate risks (next 24-48 hours)
2. Short-term risks (next 1-2 weeks)
3. Specific disease/pest warnings
4. Recommended preventive actions
5. Emergency response protocols if needed
"""

# ============================================
# Weather Forecast Analysis Prompt
# ============================================
WEATHER_ANALYSIS_PROMPT = """
Analyze the following weather forecast for agricultural planning:

**Current Conditions:**
- Temperature: {current_temp}°C
- Humidity: {current_humidity}%
- Pressure: {current_pressure} hPa
- Wind: {wind_speed} km/h from {wind_direction}

**5-Day Forecast:**
{forecast_data}

**Active Crops:**
{active_crops}

Provide:
1. Farming activity recommendations for each day
2. Irrigation scheduling advice
3. Pesticide/fertilizer application windows
4. Harvest timing recommendations
5. Weather-related risk alerts
"""

# ============================================
# Soil Improvement Prompt
# ============================================
SOIL_IMPROVEMENT_PROMPT = """
Provide a soil improvement plan based on:

**Current Soil Status:**
- Type: {soil_type}
- pH: {soil_ph}
- Organic Matter: {organic_matter}%
- Nitrogen: {n_level} kg/ha (Status: {n_status})
- Phosphorus: {p_level} kg/ha (Status: {p_status})
- Potassium: {k_level} kg/ha (Status: {k_status})

**Target Crop:**
{target_crop}

**Available Resources:**
- Budget: ₹{budget}
- Organic certification target: {is_organic}
- Available manure/compost: {organic_available}

Recommend:
1. Immediate amendments needed
2. Long-term soil health plan
3. Green manure/cover crop options
4. Fertilizer schedule with specific products
5. Expected timeline for improvement
"""

# ============================================
# Full Research Report Prompt
# ============================================
FULL_RESEARCH_PROMPT = """
Generate a comprehensive farm analysis report.

## Input Data

### Location Intelligence
- Coordinates: ({lat}, {lon})
- Location: {city}, {state}, {country}
- Elevation: {elevation}m
- Terrain: {terrain}
- Slope Analysis: {slope_info}
- Frost Risk: {frost_risk}

### Soil Profile
- Primary Soil Type: {soil_type}
- NPK Status: N={nitrogen}, P={phosphorus}, K={potassium} kg/ha
- Soil Characteristics: {soil_profile}

### Climate Analysis
- Average Temperature: {avg_temp}°C (Range: {temp_range})
- Average Humidity: {avg_humidity}%
- Annual Rainfall: {annual_rainfall}mm
- Weather Pattern: {weather_pattern}

### Current Simulation Data
- Real-time Temperature: {current_temp}°C
- Real-time Humidity: {current_humidity}%
- Soil Moisture: {soil_moisture}%
- Pressure: {pressure} hPa
- Active Alerts: {active_alerts}

### Farm Parameters
- Size: {farm_size} acres
- Budget: ₹{budget}
- Current Crops: {current_crops}

---

## Required Analysis

### 1. Location SWOT Analysis
Analyze the location's agricultural potential considering all factors.

### 2. Crop Recommendations (Top 5)
For each recommended crop, provide:
- Feasibility Score (0-100)
- Expected Yield per acre
- Estimated ROI
- Best planting time
- Key success factors
- Potential challenges

### 3. Risk Assessment
- Climate Risks
- Disease/Pest Risks  
- Market Risks
- Mitigation Strategies

### 4. Economic Projections
- Investment required
- Expected returns (Year 1, Year 3, Year 5)
- Break-even analysis
- Comparison with regional averages

### 5. Action Plan
Provide a prioritized 12-month action plan with:
- Monthly tasks
- Resource requirements
- Monitoring checkpoints
- Decision points

### 6. Government Scheme Eligibility
List applicable schemes with eligibility requirements.

---

Format the response as a professional report with clear sections, bullet points, and data tables where applicable.
"""


def get_agronomist_prompt() -> str:
    """Get the base agronomist system prompt."""
    return AGRONOMIST_SYSTEM_PROMPT


def get_crop_recommendation_prompt(**kwargs) -> str:
    """Get formatted crop recommendation prompt."""
    return CROP_RECOMMENDATION_PROMPT.format(**kwargs)


def get_risk_assessment_prompt(**kwargs) -> str:
    """Get formatted risk assessment prompt."""
    return RISK_ASSESSMENT_PROMPT.format(**kwargs)


def get_weather_analysis_prompt(**kwargs) -> str:
    """Get formatted weather analysis prompt."""
    return WEATHER_ANALYSIS_PROMPT.format(**kwargs)


def get_full_research_prompt(**kwargs) -> str:
    """Get formatted full research prompt."""
    return FULL_RESEARCH_PROMPT.format(**kwargs)
