// Seed sample classes into Supabase
// Run this with: node seed-classes.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rvpgoyufmegaqxvlwddi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGdveXVmbWVnYXF4dmx3ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NTQ4MjQsImV4cCI6MjA5MDQzMDgyNH0.xM0Xqvy9aX7JFyueg6duGGbsrocf2qgtfvngciYM4nE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedClasses() {
    try {
        // First, try to list table columns
        const { data: tableInfo, error: tableError } = await supabase
            .from('classes')
            .select('*')
            .limit(1);
        
        if (tableError && tableError.code === 'PGRST204') {
            console.log('Classes table exists but is empty - creating test data...');
        } else if (tableError) {
            console.error('Table query error:', tableError);
            return;
        }

        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 1);
        
        const classes = [
            {
                id: '001',
                name: 'Beginner Freestyle',
                description: 'Learn basic freestyle swimming',
                level: 'Beginner',
                stroke: 'Freestyle',
                schedule_date: new Date(baseDate.getTime()).toISOString(),
                schedule_time: '09:00 AM',
                max_students: 10
            },
            {
                id: '002',
                name: 'Intermediate Backstroke',
                description: 'Improve backstroke technique',
                level: 'Intermediate',
                stroke: 'Backstroke',
                schedule_date: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                schedule_time: '10:30 AM',
                max_students: 8
            },
            {
                id: '003',
                name: 'Breaststroke Mastery',
                description: 'Advanced breaststroke training',
                level: 'Advanced',
                stroke: 'Breaststroke',
                schedule_date: new Date(baseDate.getTime()).toISOString(),
                schedule_time: '02:00 PM',
                max_students: 6
            }
        ];

        console.log('Inserting classes...');
        const { data, error } = await supabase
            .from('classes')
            .insert(classes)
            .select();

        if (error) {
            console.error('Insert error:', error);
            console.log('Trying with minimal fields...');
            // Try with minimal data
            const minimalClasses = classes.map(c => ({id: c.id, name: c.name, description: c.description}));
            const { data: data2, error: error2 } = await supabase
                .from('classes')
                .insert(minimalClasses)
                .select();
            if (error2) {
                console.error('Minimal insert also failed:', error2);
            } else {
                console.log('Success with minimal fields:', data2.length, 'rows');
            }
            return;
        }

        console.log('Successfully seeded', data.length, 'classes');
        data.forEach(cls => {
            console.log(`  - ${cls.name}`);
        });
    } catch (err) {
        console.error('Seed error:', err);
    }
}

seedClasses();
