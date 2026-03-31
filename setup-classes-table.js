// Migrate/create classes table with proper schema
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rvpgoyufmegaqxvlwddi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGdveXVmbWVnYXF4dmx3ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTQ4MjQsImV4cCI6MjA5MDQzMDgyNH0.xM0Xqvy9aX7JFyueg6duGGbsrocf2qgtfvngciYM4nE';

async function setupTable() {
    try {
        console.log('🚀 Starting setup...');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('📋 Checking classes table...');
        const { data: existing, error: checkError } = await supabase
            .from('classes')
            .select('*')
            .limit(0);
        
        if (checkError) {
            console.error('❌ Error checking table:', checkError);
            console.log('\n📊 SQL to run in Supabase Dashboard:');
            console.log(`
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level TEXT DEFAULT 'All Levels',
  stroke TEXT DEFAULT 'General',
  schedule_date DATE,
  schedule_time TEXT,
  max_students INT DEFAULT 10,
  instructor TEXT,
  price INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read classes
CREATE POLICY classes_read ON classes FOR SELECT USING (true);
            `);
            return;
        }

        console.log('✅ Classes table exists');
        
        // Seed data
        console.log('\n🌱 Seeding sample classes...');
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 1);

        const classes = [
            {
                name: 'Beginner Freestyle',
                description: 'Learn basic freestyle swimming technique',
                level: 'Beginner',
                stroke: 'Freestyle',
                schedule_date: new Date(baseDate).toISOString().split('T')[0],
                schedule_time: '09:00 AM',
                max_students: 10,
                instructor: 'John Smith',
                price: 500
            },
            {
                name: 'Intermediate Backstroke',
                description: 'Improve your backstroke with drills',
                level: 'Intermediate',
                stroke: 'Backstroke',
                schedule_date: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                schedule_time: '10:30 AM',
                max_students: 8,
                instructor: 'Sarah Johnson',
                price: 600
            },
            {
                name: 'Breaststroke Mastery',
                description: 'Advanced breaststroke technique',
                level: 'Advanced',
                stroke: 'Breaststroke',
                schedule_date: new Date(baseDate).toISOString().split('T')[0],
                schedule_time: '02:00 PM',
                max_students: 6,
                instructor: 'Mike Davis',
                price: 700
            },
            {
                name: 'Butterfly Technique',
                description: 'Master the butterfly stroke',
                level: 'Expert',
                stroke: 'Butterfly',
                schedule_date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                schedule_time: '06:00 PM',
                max_students: 5,
                instructor: 'Emma Wilson',
                price: 800
            },
            {
                name: 'Water Safety & Survival',
                description: 'Essential water safety skills',
                level: 'All Levels',
                stroke: 'General',
                schedule_date: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                schedule_time: '03:30 PM',
                max_students: 12,
                instructor: 'Tom Anderson',
                price: 450
            },
            {
                name: 'Freestyle Speed Training',
                description: 'High-intensity freestyle',
                level: 'Advanced',
                stroke: 'Freestyle',
                schedule_date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                schedule_time: '07:00 AM',
                max_students: 8,
                instructor: 'Lisa Chen',
                price: 650
            }
        ];

        const { data, error } = await supabase
            .from('classes')
            .insert(classes)
            .select();

        if (error) {
            console.error('❌ Insert failed:', error);
            return;
        }

        console.log('✅ Successfully seeded', data.length, 'classes!');
        data.forEach((cls, i) => {
            console.log(`  ${i+1}. ${cls.name} - ${cls.schedule_date} @ ${cls.schedule_time}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

setupTable();
