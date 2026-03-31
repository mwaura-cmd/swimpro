# SwimPro Dashboard Wireframes

## Member Dashboard Layout Map

### Desktop View (1200px+)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SwimPro                                    User Profile                      │ ← Header (H: 70px)
├─────────────────┬─────────────────────────────────────────────────────────────┤
│                 │                                                             │
│ NAVIGATION      │  MAIN CONTENT AREA                                          │
│                 │                                                             │
│ Dashboard ▪     │ Welcome back, Denis!                                     │
│ Schedule        │                                                             │
│ Bookings        │ ┌────────────────────────────────────────────────────────┐ │
│                 │ │ [12]          [48]          [94%]        [4.8K]        │ │
│ EXPLORE         │ │ Classes       Students      Satisfaction Revenue        │ │ ← Stats: 4-col grid
│ Classes         │ └────────────────────────────────────────────────────────┘ │
│ Videos          │                                                             │
│ Pricing         │ UPCOMING CLASSES THIS WEEK                             │
│ Strokes         │ ┌──────────────┬──────────────┬──────────────┐            │
│                 │ │ Freestyle    │ Backstroke   │ Butterfly    │            │
│ ACCOUNT         │ │ Beginner     │ Advanced     │ Power        │            │
│ Profile         │ │ With Denis   │ With Kennedy │ With Kennedy │            │ ← Classes: 3-col grid
│ Settings        │ │ 4/6 spots    │ 2/6 spots    │ 1/6 spots    │            │
│ Contact         │ │ [Book Class]  │ [Book Class] │ [Book Class] │            │
│                 │ └──────────────┴──────────────┴──────────────┘            │
│ W: 260px        │                                                             │
│                 │ QUICK ACTIONS                                          │
│                 │ ┌────┬────┬────┬────┐                                      │
│                 │ │Book│Vids│Prog│Team│                                      │ ← Actions: 4-col grid
│                 │ └────┴────┴────┴────┘                                      │
│                 │                                                             │
│                 │ RECENT BOOKINGS                   [View All]           │
│                 │ ┌──────────┬──────────┬──────────┐                        │
│                 │ │Freestyle │Backstroke│Breaststroke│                     │ ← Recent: 3-col grid
│                 │ │Mon 10 AM │Wed 14 PM │Fri 16 PM │                      │
│                 │ │Confirmed │Pending   │Confirmed │                      │
│                 │ └──────────┴──────────┴──────────┘                        │
└─────────────────┴─────────────────────────────────────────────────────────────┘

Sidebar: 260px (fixed left)
Main area: Remaining width, 30px padding
Grid gaps: 20px
Card padding: 20px
```

### Tablet View (768px - 1199px)

```
┌──────────────────────────────────────┐
│ ☰ SwimPro              User Profile   │ ← Header
├──────────────────────────────────────┤
│ ≡ Dashboard  Classes  Videos  Contact │ ← Hamburger sidebar
│                                       │
│ Welcome back, Denis!              │
├──────────────────────────────────────┤
│ [12]         [48]         [94%]      │
│ Classes      Students     Satisfaction│ ← Stats: 2-col grid
│ [4.8K]                               │
│ Revenue                               │
├──────────────────────────────────────┤
│ UPCOMING CLASSES                  │
│ ┌──────────────┬──────────────┐      │
│ │ Freestyle    │ Backstroke   │      │
│ │ Beginner     │ Advanced     │      │ ← Classes: 2-col grid
│ │ [Book Class] │ [Book Class] │      │
│ ├──────────────┼──────────────┤      │
│ │ Butterfly    │ Swimming Tips│      │
│ │ Power        │ Techniques   │      │
│ │ [Book Class] │ [View]       │      │
│ └──────────────┴──────────────┘      │
│                                       │
│ QUICK ACTIONS                    │
│ ┌────┬────┬────┬────┐               │
│ │Book│Vids│Prog│Team│               │ ← Actions: 2x2 grid
│ ├────┼────┼────┼────┤               │
│ (wraps to fit)                        │
│ └────┴────┴────┴────┘               │
└──────────────────────────────────────┘

Sidebar: Slides from left, full height, collapses with click
Main area: Full width, 30px padding
Grid: 2 columns max
```

### Mobile View (≤480px)

```
┌──────────────────┐
│ ☰ SwimPro   🌙 D │ ← Header
└────────┬─────────┘
         │ (Hamburger opens sidebar)
         ▼
┌──────────────────┐
│ Navigation Menu  │
│ Dashboard        │
│ Classes          │
│ Videos           │
│ Pricing          │
│ Contact          │
└─────────────────┐
Content below:
┌──────────────────────────────┐
│                              │
│  Welcome, Denis!         │
│                              │
│ ┌──────┬──────┬──────┬────┐ │
│ │ 12   │ 48   │ 94%  │4.8K│ │ ← Stats: 2-col grid
│ │ Cls  │Stud  │Satis │Rev │ │
│ └──────┴──────┴──────┴────┘ │
│                              │
│ 📅 UPCOMING CLASSES         │
│ ┌──────────────────────────┐ │
│ │ Freestyle Beginner       │ │ ← Classes: 1-col stack
│ │ Mon 10:00 AM             │ │
│ │ 4/6 spots                │ │
│ │ [Book Class]             │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Backstroke Advanced      │ │
│ │ Wed 2:30 PM              │ │
│ │ 2/6 spots                │ │
│ │ [Book Class]             │ │
│ └──────────────────────────┘ │
│                              │
│ 🎯 QUICK ACTIONS            │
│ ┌──────────────────────────┐ │
│ │ Book a Class             │ │ ← Actions: 1-col stack
│ │ [Button]                 │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Training Videos          │ │
│ │ [Button]                 │ │
│ └──────────────────────────┘ │
│ ... (more items stack)       │
└──────────────────────────────┘

Sidebar: Full-screen drawer from left
Main area: Full width, 15px padding
Grid: 1 column (2 only for stats)
Fonts: Reduced sizes
```

---

## 📐 Admin Dashboard Layout Map

### Desktop View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ☰ SwimPro [INSTRUCTOR]    🔍 Search bookings...  🌙  Denis   🎯             │
├─────────────────┬───────────────────────────────────────────────────────────┤
│                 │                                                            │
│ DASHBOARD       │  Overview                            [+ Add Class]        │
│ Overview ▪      │                                                            │
│ Bookings        │ ┌──────────────────────────────────────────────────────┐ │
│ Students        │ │ [24]          [134]         [4.8★]       [KSh 58K] │ │
│                 │ │ This Month    Total Sessions Average Rating Revenue  │ │ ← Stats
│ MANAGEMENT      │ └──────────────────────────────────────────────────────┘ │
│ My Classes      │                                                            │
│ Schedule        │ 📊 KEY METRICS                                           │
│ Earnings        │ ┌──────────────┬──────────────┬──────────────┐           │
│                 │ │ 48 Active    │ 3 Pending    │ KSh 58K      │           │
│ ACCOUNT         │ │ Students     │ Bookings     │ Revenue      │           │ ← Metrics: 3-col
│ Profile         │ │ +5 this mo   │ Confirm 24h  │ 20% ↑ YoY    │           │
│ Settings        │ └──────────────┴──────────────┴──────────────┘           │
│                 │                                                            │
│ W: 260px        │ 📅 UPCOMING CLASSES                                       │
│                 │ ┌─────────────────────────────────────────────────────┐  │
│                 │ │ Freestyle     │ Mon 10:00 │ 5/6 │ ✓ Confirmed  │V  │  │
│                 │ │ Backstroke    │ Wed 14:30 │ 3/6 │ ⏳ Pending    │V  │  │ ← Table
│                 │ │ Butterfly     │ Fri 16:00 │ 6/6 │ ✓ Confirmed  │V  │  │
│                 │ └─────────────────────────────────────────────────────┘  │
│                 │                                                            │
│                 │ 📋 RECENT BOOKINGS                                        │
│                 │ ┌──────────────────────────────────────────────────────┐ │
│                 │ │ John          │ Freestyle  │ Mar 22 │ KSh 200 │✓ Comp │ │
│                 │ │ Sarah         │ Backstroke │ Mar 20 │ KSh 500 │✓ Comp │ │ ← Table
│                 │ └──────────────────────────────────────────────────────┘ │
└─────────────────┴───────────────────────────────────────────────────────────┘

Sidebar: 260px fixed left
Main area: Remaining width, 30px padding
Search bar: 300px wide
Tables: Sortable, hover states
```

---

## 🎨 Component Breakdown

### Card Component
```
┌─────────────────────────────┐
│ ┌──────────────────────────┐│
│ │ Title          [Icon]    ││ ← Card Header
│ │ [Small text]             ││
│ └──────────────────────────┘│
│                             │
│ Content here                │ ← Card Content
│ Paragraphs, lists, data     │
│                             │
│ ─────────────────────────── │ ← Divider
│ [Button] [Button]           │ ← Card Footer
└─────────────────────────────┘
```

### Class Card Component
```
┌─────────────────────────────┐
│ ┌──────────────────────────┐│ ← Blue left border
│ │ Freestyle         [🏊]    ││
│ │ [Badge: Popular]          ││
│ │                           ││
│ │ [Avatar] Denis Mwaura     ││
│ │ 🕐 Mon 10:00 - 11:00 AM  ││
│ │ 🅘 4/6 spots available    ││
│ │                           ││
│ │ ─────────────────────────││
│ │ [Book Class]              ││
│ └──────────────────────────┘│
└─────────────────────────────┘
```

### Stat Box Component
```
┌─────────────────────────────┐
│                             │ ← Gradient background
│       24                    │ ← Large number
│   Classes This Month        │ ← Label
│                             │
└─────────────────────────────┘
```

### Booking Table
```
┌─────────────────────────────────────────────────────┐
│ Student  │ Class      │ Time      │ Status          │ ← Header row
├────────────────────────────────────────────────────┤
│ John     │ Freestyle  │ Mon 10 AM │ ✓ Confirmed    │ ← Data rows
│ Sarah    │ Backstroke │ Wed 2 PM  │ ⏳ Pending      │
│ Peter    │ Butterfly  │ Fri 4 PM  │ ✓ Confirmed    │
└─────────────────────────────────────────────────────┘
```

---

## 📍 Navigation Structure

### Member Dashboard Sidebar
```
MAIN
├── Dashboard ▪
├── My Schedule
└── Bookings

EXPLORE
├── Classes
├── Training Videos
├── Pricing
└── Strokes

ACCOUNT
├── Profile
├── Settings
└── Contact
```

### Admin Dashboard Sidebar
```
DASHBOARD
├── Overview ▪
├── Bookings
└── Students

MANAGEMENT
├── My Classes
├── Schedule
└── Earnings

ACCOUNT
├── Profile
└── Settings
```

---

## 🎯 Section Content Map

### Member Dashboard Sections

**DASHBOARD**
- Stats: 4 metrics (Classes, Students, Satisfaction, Revenue)
- Upcoming Classes: 3-col grid with cards
- Quick Actions: 4-col grid of CTAs
- Recent Bookings: Horizontal scroll/grid

**CLASSES**
- Browse all available classes
- Filter by instructor, time, level
- Cards showing time, spots, instructor
- Book button on each

**TRAINING VIDEOS**
- Video thumbnails with play button
- Duration badge
- Instructor name
- Watch button

**PRICING**
- 3 pricing tiers (Daily, Monthly, Student)
- Feature lists
- CTA buttons

**STROKES**
- 4 swimming techniques
- Descriptions
- Related classes
- Learn more

---

### Admin Dashboard Sections

**OVERVIEW**
- 4 quick stats
- 3 key metrics cards
- Upcoming classes table
- Recent bookings table

**BOOKINGS**
- Filter tabs (All, Pending, Confirmed, Cancelled)
- Searchable table
- Approve/Decline buttons
- Student info

**STUDENTS**
- Grid of student cards
- Profile, classes attended, rating, spent
- View profile button
- Message button

**EARNINGS**
- 3 earnings cards (Month, Pending, YTD)
- Transaction table
- Export button

---

## 🔄 Responsive Behavior

### Desktop (1200px+)
- Sidebar: 260px fixed left
- Main: Full width minus sidebar
- Grids: 3-4 columns
- Tables: Full width with scroll
- Search bar: Visible in header

### Tablet (768px - 1199px)
- Sidebar: Hamburger toggle
- Main: Full width
- Grids: 2 columns max
- Tables: Smaller fonts
- Search bar: Hidden

### Mobile (≤480px)
- Sidebar: Full-screen drawer
- Main: Full width, 15px padding
- Grids: 1 column (stats 2-col)
- Tables: Horizontal scroll or cards
- Search bar: Hidden
- All spacing: Reduced

---

## 🎨 Color Palette

### Member Dashboard
```
Primary:     #0066cc (Blue - welcoming)
Secondary:  #00a8e8 (Light blue)
Success:    #27ae60 (Green)
Warning:    #f39c12 (Orange)
Danger:     #ff6b6b (Red)
```

### Admin Dashboard
```
Primary:    #ff6b6b (Red - action-oriented)
Success:    #27ae60 (Green)
Warning:    #f39c12 (Orange)
Danger:     #e74c3c (Dark red)
```

---

## 📏 Spacing System

```
Header:    70px fixed
Sidebar:   260px (desktop), 100% (mobile)
Padding:   30px (desktop), 20px (tablet), 15px (mobile)
Gap:       20px between cards/grid items
Card:      20px internal padding
Border:    1px solid #e0e6ed
Border-radius: 12px for cards, 8px for buttons
```

---

## 🎬 Animations

```
Transitions:
- All hover effects: 0.3s ease
- Transform on hover: translateY(-2px)
- Color changes: smooth fade

Hover States:
- Cards: Border color change + shadow + lift
- Buttons: Color change + shadow + lift
- Links: Underline + color change
```

---

## ✅ Design Review Checklist

- [ ] Desktop layout shows 3+ columns
- [ ] Tablet layout shows 2 columns max
- [ ] Mobile shows 1 column
- [ ] Header is always visible
- [ ] Sidebar/nav is accessible
- [ ] All cards have hover states
- [ ] Buttons are clearly clickable
- [ ] Dark mode works on all elements
- [ ] Icons are Font Awesome
- [ ] Text has sufficient contrast
- [ ] Responsive images work
- [ ] Tables don't overflow
- [ ] No horizontal scrolling (except tables)
- [ ] Touch targets are 44px+ on mobile

This completes your modern SaaS-style dashboard system! 🎉
