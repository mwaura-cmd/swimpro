# SwimPro Classes Setup Instructions

## 📋 What's Included

**30 Classes Total** organized as follows:

### Swimming Strokes (5)
1. **Freestyle** - 6 classes (Beginner, Intermediate, Pro × 2 instructors each)
2. **Backstroke** - 6 classes (Beginner, Intermediate, Pro × 2 instructors each)
3. **Breaststroke** - 6 classes (Beginner, Intermediate, Pro × 2 instructors each)
4. **Butterfly** - 6 classes (Beginner, Intermediate, Pro × 2 instructors each)
5. **Water Treading** - 6 classes (Beginner, Intermediate, Pro × 2 instructors each)

### Instructors
- **Denis Mwaura**
- **Kennedy Munyua**

(Each instructor teaches all strokes at all levels)

---

## 💰 Pricing Structure

### Beginner Level
| Subscription | Student | Adult |
|---|---|---|
| Daily | KSh 300 | KSh 500 |
| Weekly (5 classes) | KSh 1,200 | KSh 2,000 |
| Monthly (unlimited) | KSh 4,000 | KSh 6,500 |

### Intermediate Level
| Subscription | Student | Adult |
|---|---|---|
| Daily | KSh 400 | KSh 650 |
| Weekly (5 classes) | KSh 1,600 | KSh 2,600 |
| Monthly (unlimited) | KSh 5,000 | KSh 8,000 |

### Pro/Advanced Level
| Subscription | Student | Adult |
|---|---|---|
| Daily | KSh 550 | KSh 850 |
| Weekly (5 classes) | KSh 2,200 | KSh 3,400 |
| Monthly (unlimited) | KSh 6,500 | KSh 10,000 |

### Water Treading (Discounted)
**Beginner:**
- Daily: KSh 250 (Student), KSh 400 (Adult)
- Weekly: KSh 1,000 (Student), KSh 1,600 (Adult)
- Monthly: KSh 3,500 (Student), KSh 5,500 (Adult)

**Intermediate:**
- Daily: KSh 350 (Student), KSh 550 (Adult)
- Weekly: KSh 1,400 (Student), KSh 2,200 (Adult)
- Monthly: KSh 4,500 (Student), KSh 7,000 (Adult)

**Pro:**
- Daily: KSh 450 (Student), KSh 700 (Adult)
- Weekly: KSh 1,800 (Student), KSh 2,800 (Adult)
- Monthly: KSh 5,500 (Student), KSh 8,500 (Adult)

---

## 🚀 Setup Steps

### Step 1: Go to Supabase Dashboard
1. Visit [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your SwimPro project
3. Click **SQL Editor** (left sidebar)

### Step 2: Create New Query
1. Click **New Query**
2. Copy the entire content from `SETUP-ALL-CLASSES.sql`
3. Paste into the SQL editor

### Step 3: Execute the SQL
1. Click **Run** (or press Ctrl+Enter)
2. Wait for completion message
3. You should see:
   ```
   ✅ Successfully inserted 30 classes
   ```

### Step 4: Verify Data
1. Go to **Table Editor** (left sidebar)
2. Click **classes** table
3. You should see 30 rows with:
   - All 5 strokes
   - 3 levels each
   - 2 instructors
   - Complete pricing data

---

## 📱 What Students Will See

### After Logging In:
1. **Classes Section** → Browse all 30 classes
2. **Class Cards** showing:
   - Class name (stroke + level)
   - Instructor name
   - Schedule date & time
   - Max capacity
3. **Book Now Button** → Opens booking modal

### Booking Modal Includes:
- Pre-filled student name (extracted from email)
- Datetime picker (calendar + time)
- Email & phone fields
- Submit button

### My Bookings Section:
- Shows all student's bookings
- Real-time status (pending/confirmed/declined)

---

## 👨‍💼 What Admins Will See

### Bookings Management:
- **All bookings table** with:
  - Student name
  - Email
  - Class name & date
  - Status badges
  - Approve/Decline/Delete buttons

### Quick Stats:
- Total bookings count
- Pending approvals
- Confirmed classes

---

## 🔑 Key Features After Setup

✅ **Real Data** - 30 actual classes to browse and book  
✅ **Smart Pricing** - Different rates for students vs. adults, 3 tiers per stroke  
✅ **Calendar Dates** - Classes scheduled from April 1-6, 2026  
✅ **Instructor Names** - Denis Mwaura & Kennedy Munyua for all classes  
✅ **Full Coverage** - All 4 swimming strokes + water treading  
✅ **Subscription Options** - Pay daily, weekly, or monthly  

---

## ⚠️ Important Notes

- This will DROP the existing `classes` table - make sure it's empty first
- All 30 classes will be public (students can see them)
- Dates are set for April 1-6, 2026 (adjust in SQL if needed)
- Pricing is in Kenyan Shillings (KSh)
- Each class has max capacity (6-12 students depending on level)

---

## 🧪 Test the System

After setup:
1. **Go to**: https://swimpro-7h93.onrender.com/login.html
2. **Sign Up** as a new student
3. **Go to**: Student Dashboard → Classes
4. **Book a Class** → Click "Book Now"
5. **Check Bookings** → "My Bookings" section shows your booking

---

## 📞 Support

If you see errors:
- Check that you're in the correct Supabase project
- Make sure SQL is fully copied (including the INSERT statements)
- If table creation fails, try clicking "Run" again
- Check Supabase error logs at bottom of SQL Editor

Pricing and instructor assignments ready! 🎯
