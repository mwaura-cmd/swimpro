-- ==========================================
-- SWIMPRO COMPLETE SETUP - CLASSES & BOOKINGS
-- ==========================================

-- ==========================================
-- DROP OLD TABLES
-- ==========================================
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

-- ==========================================
-- CREATE CLASSES TABLE
-- ==========================================
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stroke TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Pro')),
  instructor TEXT NOT NULL,
  
  -- Availability window (flexible, not fixed times)
  availability_start TIME DEFAULT '10:00:00',
  availability_end TIME DEFAULT '18:00:00',
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

-- Enable RLS for classes
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Public read policy for classes
CREATE POLICY "Allow public read" ON classes FOR SELECT USING (true);

-- ==========================================
-- CREATE BOOKINGS TABLE
-- ==========================================
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Booking details
  booking_date DATE,
  suggested_time TIME,
  message TEXT,
  
  -- Status & payment
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  paid BOOLEAN DEFAULT false,
  screenshot TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Students can view their own bookings
CREATE POLICY "Students view own bookings" ON bookings 
  FOR SELECT USING (auth.uid() = user_id);

-- Students can create bookings
CREATE POLICY "Students create bookings" ON bookings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- INSERT 30 CLASSES - FREESTYLE
-- ==========================================
INSERT INTO classes (
  name, description, stroke, level, instructor,
  availability_start, availability_end, max_students, duration_minutes,
  daily_price_student, daily_price_adult,
  weekly_price_student, weekly_price_adult,
  monthly_price_student, monthly_price_adult
) VALUES

-- Freestyle - Beginner
('Freestyle - Beginner (Denis)', 'Learn basic freestyle technique - perfect for beginners', 'Freestyle', 'Beginner', 'Denis Mwaura', '10:00:00', '18:00:00', 10, 45, 300, 500, 1200, 2000, 4000, 6500),
('Freestyle - Beginner (Kennedy)', 'Learn basic freestyle technique - perfect for beginners', 'Freestyle', 'Beginner', 'Kennedy Munyua', '10:00:00', '18:00:00', 10, 45, 300, 500, 1200, 2000, 4000, 6500),

-- Freestyle - Intermediate
('Freestyle - Intermediate (Denis)', 'Improve speed and endurance in freestyle', 'Freestyle', 'Intermediate', 'Denis Mwaura', '10:00:00', '18:00:00', 8, 50, 400, 650, 1600, 2600, 5000, 8000),
('Freestyle - Intermediate (Kennedy)', 'Improve speed and endurance in freestyle', 'Freestyle', 'Intermediate', 'Kennedy Munyua', '10:00:00', '18:00:00', 8, 50, 400, 650, 1600, 2600, 5000, 8000),

-- Freestyle - Pro
('Freestyle - Pro (Denis)', 'Advanced technique and competitive training', 'Freestyle', 'Pro', 'Denis Mwaura', '10:00:00', '18:00:00', 6, 60, 550, 850, 2200, 3400, 6500, 10000),
('Freestyle - Pro (Kennedy)', 'Advanced technique and competitive training', 'Freestyle', 'Pro', 'Kennedy Munyua', '10:00:00', '18:00:00', 6, 60, 550, 850, 2200, 3400, 6500, 10000),

-- ==========================================
-- INSERT BACKSTROKE CLASSES
-- ==========================================

-- Backstroke - Beginner
('Backstroke - Beginner (Denis)', 'Master backstroke fundamentals from scratch', 'Backstroke', 'Beginner', 'Denis Mwaura', '10:00:00', '18:00:00', 10, 45, 300, 500, 1200, 2000, 4000, 6500),
('Backstroke - Beginner (Kennedy)', 'Master backstroke fundamentals from scratch', 'Backstroke', 'Beginner', 'Kennedy Munyua', '10:00:00', '18:00:00', 10, 45, 300, 500, 1200, 2000, 4000, 6500),

-- Backstroke - Intermediate
('Backstroke - Intermediate (Denis)', 'Perfect backstroke technique and increase distance', 'Backstroke', 'Intermediate', 'Denis Mwaura', '10:00:00', '18:00:00', 8, 50, 400, 650, 1600, 2600, 5000, 8000),
('Backstroke - Intermediate (Kennedy)', 'Perfect backstroke technique and increase distance', 'Backstroke', 'Intermediate', 'Kennedy Munyua', '10:00:00', '18:00:00', 8, 50, 400, 650, 1600, 2600, 5000, 8000),

-- Backstroke - Pro
('Backstroke - Pro (Denis)', 'Competitive backstroke training and racing strategies', 'Backstroke', 'Pro', 'Denis Mwaura', '10:00:00', '18:00:00', 6, 60, 550, 850, 2200, 3400, 6500, 10000),
('Backstroke - Pro (Kennedy)', 'Competitive backstroke training and racing strategies', 'Backstroke', 'Pro', 'Kennedy Munyua', '10:00:00', '18:00:00', 6, 60, 550, 850, 2200, 3400, 6500, 10000),

-- ==========================================
-- INSERT BREASTSTROKE CLASSES
-- ==========================================

-- Breaststroke - Beginner
('Breaststroke - Beginner (Denis)', 'Learn proper breaststroke coordination and kicks', 'Breaststroke', 'Beginner', 'Denis Mwaura', '10:00:00', '18:00:00', 10, 45, 300, 500, 1200, 2000, 4000, 6500),
('Breaststroke - Beginner (Kennedy)', 'Learn proper breaststroke coordination and kicks', 'Breaststroke', 'Beginner', 'Kennedy Munyua', '10:00:00', '18:00:00', 10, 45, 300, 500, 1200, 2000, 4000, 6500),

-- Breaststroke - Intermediate
('Breaststroke - Intermediate (Denis)', 'Refine breaststroke efficiency and build stamina', 'Breaststroke', 'Intermediate', 'Denis Mwaura', '10:00:00', '18:00:00', 8, 50, 400, 650, 1600, 2600, 5000, 8000),
('Breaststroke - Intermediate (Kennedy)', 'Refine breaststroke efficiency and build stamina', 'Breaststroke', 'Intermediate', 'Kennedy Munyua', '10:00:00', '18:00:00', 8, 50, 400, 650, 1600, 2600, 5000, 8000),

-- Breaststroke - Pro
('Breaststroke - Pro (Denis)', 'Elite breaststroke training and stroke optimization', 'Breaststroke', 'Pro', 'Denis Mwaura', '10:00:00', '18:00:00', 6, 60, 550, 850, 2200, 3400, 6500, 10000),
('Breaststroke - Pro (Kennedy)', 'Elite breaststroke training and stroke optimization', 'Breaststroke', 'Pro', 'Kennedy Munyua', '10:00:00', '18:00:00', 6, 60, 550, 850, 2200, 3400, 6500, 10000),

-- ==========================================
-- INSERT BUTTERFLY CLASSES
-- ==========================================

-- Butterfly - Beginner
('Butterfly - Beginner (Denis)', 'Introduction to butterfly stroke technique', 'Butterfly', 'Beginner', 'Denis Mwaura', '10:00:00', '18:00:00', 10, 45, 300, 500, 1200, 2000, 4000, 6500),
('Butterfly - Beginner (Kennedy)', 'Introduction to butterfly stroke technique', 'Butterfly', 'Beginner', 'Kennedy Munyua', '10:00:00', '18:00:00', 10, 45, 300, 500, 1200, 2000, 4000, 6500),

-- Butterfly - Intermediate
('Butterfly - Intermediate (Denis)', 'Build butterfly speed and consistency', 'Butterfly', 'Intermediate', 'Denis Mwaura', '10:00:00', '18:00:00', 8, 50, 400, 650, 1600, 2600, 5000, 8000),
('Butterfly - Intermediate (Kennedy)', 'Build butterfly speed and consistency', 'Butterfly', 'Intermediate', 'Kennedy Munyua', '10:00:00', '18:00:00', 8, 50, 400, 650, 1600, 2600, 5000, 8000),

-- Butterfly - Pro
('Butterfly - Pro (Denis)', 'Advanced butterfly training for competitive swimmers', 'Butterfly', 'Pro', 'Denis Mwaura', '10:00:00', '18:00:00', 6, 60, 550, 850, 2200, 3400, 6500, 10000),
('Butterfly - Pro (Kennedy)', 'Advanced butterfly training for competitive swimmers', 'Butterfly', 'Pro', 'Kennedy Munyua', '10:00:00', '18:00:00', 6, 60, 550, 850, 2200, 3400, 6500, 10000),

-- ==========================================
-- INSERT WATER TREADING CLASSES
-- ==========================================

-- Water Treading - Beginner
('Water Treading - Beginner (Denis)', 'Master water treading for survival and fitness', 'Water Treading', 'Beginner', 'Denis Mwaura', '10:00:00', '18:00:00', 12, 40, 250, 400, 1000, 1600, 3500, 5500),
('Water Treading - Beginner (Kennedy)', 'Master water treading for survival and fitness', 'Water Treading', 'Beginner', 'Kennedy Munyua', '10:00:00', '18:00:00', 12, 40, 250, 400, 1000, 1600, 3500, 5500),

-- Water Treading - Intermediate
('Water Treading - Intermediate (Denis)', 'Advanced water treading techniques', 'Water Treading', 'Intermediate', 'Denis Mwaura', '10:00:00', '18:00:00', 10, 45, 350, 550, 1400, 2200, 4500, 7000),
('Water Treading - Intermediate (Kennedy)', 'Advanced water treading techniques', 'Water Treading', 'Intermediate', 'Kennedy Munyua', '10:00:00', '18:00:00', 10, 45, 350, 550, 1400, 2200, 4500, 7000),

-- Water Treading - Pro
('Water Treading - Pro (Denis)', 'Elite water treading and aquatic survival skills', 'Water Treading', 'Pro', 'Denis Mwaura', '10:00:00', '18:00:00', 8, 50, 450, 700, 1800, 2800, 5500, 8500),
('Water Treading - Pro (Kennedy)', 'Elite water treading and aquatic survival skills', 'Water Treading', 'Pro', 'Kennedy Munyua', '10:00:00', '18:00:00', 8, 50, 450, 700, 1800, 2800, 5500, 8500);

-- ==========================================
-- VERIFY DATA
-- ==========================================
SELECT COUNT(*) as total_classes FROM classes;
SELECT COUNT(*) as total_bookings FROM bookings;
SELECT DISTINCT stroke, level FROM classes ORDER BY stroke, level;
