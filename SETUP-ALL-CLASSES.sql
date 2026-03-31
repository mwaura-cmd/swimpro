-- ==========================================
-- SWIMPRO CLASSES - COMPLETE SETUP
-- All 4 swimming strokes + Water Treading
-- Beginner, Intermediate, Pro levels
-- Instructors: Denis Mwaura & Kennedy Munyua
-- Pricing: Daily, Weekly, Monthly
-- ==========================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS classes CASCADE;

-- Create classes table with comprehensive schema
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stroke TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Pro')),
  instructor TEXT NOT NULL,
  schedule_date DATE,
  schedule_time TEXT,
  max_students INT DEFAULT 8,
  duration_minutes INT DEFAULT 45,
  
  -- Pricing tiers
  daily_price_student INT,
  daily_price_adult INT,
  weekly_price_student INT,
  weekly_price_adult INT,
  monthly_price_student INT,
  monthly_price_adult INT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Allow public read" ON classes FOR SELECT USING (true);

-- ==========================================
-- INSERT FREESTYLE CLASSES
-- ==========================================
INSERT INTO classes (
  name, description, stroke, level, instructor,
  schedule_date, schedule_time, max_students, duration_minutes,
  daily_price_student, daily_price_adult,
  weekly_price_student, weekly_price_adult,
  monthly_price_student, monthly_price_adult
) VALUES

-- Freestyle - Beginner
('Freestyle - Beginner (Denis)', 'Learn basic freestyle technique - perfect for beginners', 'Freestyle', 'Beginner', 'Denis Mwaura', '2026-04-01', '09:00 AM', 10, 45, 300, 500, 1200, 2000, 4000, 6500),
('Freestyle - Beginner (Kennedy)', 'Learn basic freestyle technique - perfect for beginners', 'Freestyle', 'Beginner', 'Kennedy Munyua', '2026-04-02', '10:00 AM', 10, 45, 300, 500, 1200, 2000, 4000, 6500),

-- Freestyle - Intermediate
('Freestyle - Intermediate (Denis)', 'Improve speed and endurance in freestyle', 'Freestyle', 'Intermediate', 'Denis Mwaura', '2026-04-03', '11:00 AM', 8, 50, 400, 650, 1600, 2600, 5000, 8000),
('Freestyle - Intermediate (Kennedy)', 'Improve speed and endurance in freestyle', 'Freestyle', 'Intermediate', 'Kennedy Munyua', '2026-04-04', '02:00 PM', 8, 50, 400, 650, 1600, 2600, 5000, 8000),

-- Freestyle - Pro
('Freestyle - Pro (Denis)', 'Advanced technique and competitive training', 'Freestyle', 'Pro', 'Denis Mwaura', '2026-04-05', '06:00 AM', 6, 60, 550, 850, 2200, 3400, 6500, 10000),
('Freestyle - Pro (Kennedy)', 'Advanced technique and competitive training', 'Freestyle', 'Pro', 'Kennedy Munyua', '2026-04-06', '05:30 AM', 6, 60, 550, 850, 2200, 3400, 6500, 10000),

-- ==========================================
-- INSERT BACKSTROKE CLASSES
-- ==========================================

-- Backstroke - Beginner
('Backstroke - Beginner (Denis)', 'Master backstroke fundamentals from scratch', 'Backstroke', 'Beginner', 'Denis Mwaura', '2026-04-01', '08:15 AM', 10, 45, 300, 500, 1200, 2000, 4000, 6500),
('Backstroke - Beginner (Kennedy)', 'Master backstroke fundamentals from scratch', 'Backstroke', 'Beginner', 'Kennedy Munyua', '2026-04-02', '03:00 PM', 10, 45, 300, 500, 1200, 2000, 4000, 6500),

-- Backstroke - Intermediate
('Backstroke - Intermediate (Denis)', 'Perfect backstroke technique and increase distance', 'Backstroke', 'Intermediate', 'Denis Mwaura', '2026-04-03', '10:15 AM', 8, 50, 400, 650, 1600, 2600, 5000, 8000),
('Backstroke - Intermediate (Kennedy)', 'Perfect backstroke technique and increase distance', 'Backstroke', 'Intermediate', 'Kennedy Munyua', '2026-04-04', '04:00 PM', 8, 50, 400, 650, 1600, 2600, 5000, 8000),

-- Backstroke - Pro
('Backstroke - Pro (Denis)', 'Competitive backstroke training and racing strategies', 'Backstroke', 'Pro', 'Denis Mwaura', '2026-04-05', '07:00 AM', 6, 60, 550, 850, 2200, 3400, 6500, 10000),
('Backstroke - Pro (Kennedy)', 'Competitive backstroke training and racing strategies', 'Backstroke', 'Pro', 'Kennedy Munyua', '2026-04-06', '06:30 AM', 6, 60, 550, 850, 2200, 3400, 6500, 10000),

-- ==========================================
-- INSERT BREASTSTROKE CLASSES
-- ==========================================

-- Breaststroke - Beginner
('Breaststroke - Beginner (Denis)', 'Learn proper breaststroke coordination and kicks', 'Breaststroke', 'Beginner', 'Denis Mwaura', '2026-04-01', '09:45 AM', 10, 45, 300, 500, 1200, 2000, 4000, 6500),
('Breaststroke - Beginner (Kennedy)', 'Learn proper breaststroke coordination and kicks', 'Breaststroke', 'Beginner', 'Kennedy Munyua', '2026-04-02', '11:30 AM', 10, 45, 300, 500, 1200, 2000, 4000, 6500),

-- Breaststroke - Intermediate
('Breaststroke - Intermediate (Denis)', 'Refine breaststroke efficiency and build stamina', 'Breaststroke', 'Intermediate', 'Denis Mwaura', '2026-04-03', '01:00 PM', 8, 50, 400, 650, 1600, 2600, 5000, 8000),
('Breaststroke - Intermediate (Kennedy)', 'Refine breaststroke efficiency and build stamina', 'Breaststroke', 'Intermediate', 'Kennedy Munyua', '2026-04-04', '03:15 PM', 8, 50, 400, 650, 1600, 2600, 5000, 8000),

-- Breaststroke - Pro
('Breaststroke - Pro (Denis)', 'Elite breaststroke training and stroke optimization', 'Breaststroke', 'Pro', 'Denis Mwaura', '2026-04-05', '05:30 AM', 6, 60, 550, 850, 2200, 3400, 6500, 10000),
('Breaststroke - Pro (Kennedy)', 'Elite breaststroke training and stroke optimization', 'Breaststroke', 'Pro', 'Kennedy Munyua', '2026-04-06', '07:30 AM', 6, 60, 550, 850, 2200, 3400, 6500, 10000),

-- ==========================================
-- INSERT BUTTERFLY CLASSES
-- ==========================================

-- Butterfly - Beginner
('Butterfly - Beginner (Denis)', 'Introduction to butterfly stroke technique', 'Butterfly', 'Beginner', 'Denis Mwaura', '2026-04-01', '10:30 AM', 10, 45, 300, 500, 1200, 2000, 4000, 6500),
('Butterfly - Beginner (Kennedy)', 'Introduction to butterfly stroke technique', 'Butterfly', 'Beginner', 'Kennedy Munyua', '2026-04-02', '12:30 PM', 10, 45, 300, 500, 1200, 2000, 4000, 6500),

-- Butterfly - Intermediate
('Butterfly - Intermediate (Denis)', 'Build butterfly speed and consistency', 'Butterfly', 'Intermediate', 'Denis Mwaura', '2026-04-03', '02:00 PM', 8, 50, 400, 650, 1600, 2600, 5000, 8000),
('Butterfly - Intermediate (Kennedy)', 'Build butterfly speed and consistency', 'Butterfly', 'Intermediate', 'Kennedy Munyua', '2026-04-04', '05:00 PM', 8, 50, 400, 650, 1600, 2600, 5000, 8000),

-- Butterfly - Pro
('Butterfly - Pro (Denis)', 'Advanced butterfly training for competitive swimmers', 'Butterfly', 'Pro', 'Denis Mwaura', '2026-04-05', '06:30 AM', 6, 60, 550, 850, 2200, 3400, 6500, 10000),
('Butterfly - Pro (Kennedy)', 'Advanced butterfly training for competitive swimmers', 'Butterfly', 'Pro', 'Kennedy Munyua', '2026-04-06', '08:00 AM', 6, 60, 550, 850, 2200, 3400, 6500, 10000),

-- ==========================================
-- INSERT WATER TREADING CLASSES
-- ==========================================

-- Water Treading - Beginner
('Water Treading - Beginner (Denis)', 'Master water treading for survival and fitness', 'Water Treading', 'Beginner', 'Denis Mwaura', '2026-04-01', '02:30 PM', 12, 40, 250, 400, 1000, 1600, 3500, 5500),
('Water Treading - Beginner (Kennedy)', 'Master water treading for survival and fitness', 'Water Treading', 'Beginner', 'Kennedy Munyua', '2026-04-02', '04:30 PM', 12, 40, 250, 400, 1000, 1600, 3500, 5500),

-- Water Treading - Intermediate
('Water Treading - Intermediate (Denis)', 'Advanced water treading techniques', 'Water Treading', 'Intermediate', 'Denis Mwaura', '2026-04-03', '03:30 PM', 10, 45, 350, 550, 1400, 2200, 4500, 7000),
('Water Treading - Intermediate (Kennedy)', 'Advanced water treading techniques', 'Water Treading', 'Intermediate', 'Kennedy Munyua', '2026-04-04', '06:00 PM', 10, 45, 350, 550, 1400, 2200, 4500, 7000),

-- Water Treading - Pro
('Water Treading - Pro (Denis)', 'Elite water treading and aquatic survival skills', 'Water Treading', 'Pro', 'Denis Mwaura', '2026-04-05', '04:00 PM', 8, 50, 450, 700, 1800, 2800, 5500, 8500),
('Water Treading - Pro (Kennedy)', 'Elite water treading and aquatic survival skills', 'Water Treading', 'Pro', 'Kennedy Munyua', '2026-04-06', '04:30 PM', 8, 50, 450, 700, 1800, 2800, 5500, 8500);

-- ==========================================
-- SUMMARY
-- ==========================================
-- Total: 30 classes
-- Strokes: 5 (Freestyle, Backstroke, Breaststroke, Butterfly, Water Treading)
-- Levels: 3 each (Beginner, Intermediate, Pro)
-- Instructors: 2 (Denis Mwaura, Kennedy Munyua)
-- Pricing: Daily, Weekly, Monthly for Students & Adults
-- ==========================================

-- Verify data was inserted
SELECT COUNT(*) as total_classes, stroke, level FROM classes GROUP BY stroke, level ORDER BY stroke, level;
SELECT DISTINCT instructor FROM classes ORDER BY instructor;
