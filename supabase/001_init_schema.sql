-- ============================================
-- Agri-Nexus Database Schema
-- Supabase PostgreSQL with PostGIS Extension
-- ============================================

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- Table: farms
-- Stores farm information and location data
-- ============================================
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lon DECIMAL(11, 8) NOT NULL,
    location_point GEOGRAPHY(POINT, 4326), -- PostGIS point for geospatial queries
    soil_type VARCHAR(100),
    size_acres DECIMAL(10, 2),
    elevation_meters DECIMAL(8, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index for fast location queries
CREATE INDEX IF NOT EXISTS idx_farms_location ON farms USING GIST(location_point);

-- Trigger to auto-update location_point from lat/lon
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.location_lon, NEW.location_lat), 4326)::geography;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_point
    BEFORE INSERT OR UPDATE ON farms
    FOR EACH ROW
    EXECUTE FUNCTION update_location_point();

-- ============================================
-- Table: sensor_logs
-- Time-series data from simulated/real sensors
-- ============================================
CREATE TABLE IF NOT EXISTS sensor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Environmental Data
    temperature DECIMAL(5, 2),          -- Celsius
    humidity DECIMAL(5, 2),             -- Percentage
    pressure DECIMAL(7, 2),             -- hPa
    soil_moisture DECIMAL(5, 2),        -- Percentage
    rainfall DECIMAL(6, 2),             -- mm
    
    -- Extended Metrics
    wind_speed DECIMAL(5, 2),           -- km/h
    uv_index DECIMAL(4, 2),
    light_intensity DECIMAL(8, 2),      -- Lux
    
    -- Simulation Metadata
    is_simulated BOOLEAN DEFAULT TRUE,
    simulation_tick INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast time-series queries
CREATE INDEX IF NOT EXISTS idx_sensor_logs_farm_time ON sensor_logs(farm_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_timestamp ON sensor_logs(timestamp DESC);

-- ============================================
-- Table: alerts
-- Stores generated alerts from the system
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,          -- CRITICAL_DRY, STORM_WARNING, etc.
    severity VARCHAR(20) NOT NULL,      -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    message TEXT,
    threshold_value DECIMAL(10, 2),
    actual_value DECIMAL(10, 2),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_farm ON alerts(farm_id, created_at DESC);

-- ============================================
-- Table: research_reports
-- Stores AI-generated research reports
-- ============================================
CREATE TABLE IF NOT EXISTS research_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,   -- full_scan, crop_analysis, weather_report
    content JSONB NOT NULL,             -- Full report data
    summary TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_reports_farm ON research_reports(farm_id, generated_at DESC);

-- ============================================
-- Table: crop_recommendations
-- Cached crop recommendations for farms
-- ============================================
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    feasibility_score DECIMAL(5, 2),    -- 0-100
    roi_estimate DECIMAL(10, 2),
    growing_season VARCHAR(50),
    risks JSONB,                        -- Array of risk factors
    recommendations JSONB,              -- Array of recommendations
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crop_recs_farm ON crop_recommendations(farm_id, feasibility_score DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;

-- Farm policies (users can only see their own farms)
CREATE POLICY "Users can view own farms" ON farms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farms" ON farms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farms" ON farms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own farms" ON farms
    FOR DELETE USING (auth.uid() = user_id);

-- Sensor logs policies (accessible via farm ownership)
CREATE POLICY "Users can view own sensor logs" ON sensor_logs
    FOR SELECT USING (
        farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own sensor logs" ON sensor_logs
    FOR INSERT WITH CHECK (
        farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
    );

-- Similar policies for other tables...
CREATE POLICY "Users can view own alerts" ON alerts
    FOR SELECT USING (
        farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view own research" ON research_reports
    FOR SELECT USING (
        farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view own crop recs" ON crop_recommendations
    FOR SELECT USING (
        farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
    );

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Agri-Nexus database schema created successfully!';
END $$;
