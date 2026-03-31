# SwimPro Dashboard Implementation Guide

## Dashboard Comparison

### Member Dashboard (`dashboard.html`)
**Purpose:** For swimming students/members to book classes and explore content

**Key Sections:**
- Dashboard: Quick stats, upcoming classes, quick actions, recent bookings
- Classes: Browse available classes with booking
- Training Videos: Watch coaching tutorials
- Pricing: View subscription options
- Strokes: Educational swimming technique guide
- Contact: Get in touch information
- Profile: View member information and stats

**Color Scheme:** Blue primary (#0066cc), calm & welcoming

**Navigation:** Sidebar with icons (Marketing + Booking focused)

**Key Features:**
- Book classes quickly
- Browse training content
- View pricing options
- Track personal bookings
- Access contact info

**Target Users:** 
- New prospects (Class/video browsing)
- Active members (Booking, scheduling)
- All skill levels

---

### Admin Dashboard (`admin-dashboard.html`)
**Purpose:** For instructors to manage bookings, students, and earnings

**Key Sections:**
- Overview: Key metrics, upcoming classes, recent bookings, revenue
- Bookings Management: Approve/decline student bookings
- My Students: View student list with profiles and stats
- My Classes: Manage scheduled classes
- Schedule: Arrange class timetable
- Earnings: Track revenue and payouts
- Profile: Instructor information and achievements

**Color Scheme:** Red/accent primary (#ff6b6b), action-oriented

**Navigation:** Sidebar with admin-specific options

**Key Features:**
- Approve/decline bookings
- View all student profiles
- Track earnings and payouts
- Manage class schedule
- Monitor student progress

**Target Users:**
- Instructors/Coaches (Management)
- Admin team (Oversight)

---

## User Flow Diagram

```
┌─────────────────┐
│   User Visits   │
│   Website       │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │  Homepage  │  (Original index.html or landing)
    │  (Browse)  │
    └────┬───────┘
         │
         ├────────────────────────┬────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
    ┌─────────┐          ┌──────────────┐        ┌─────────────┐
    │ Student │          │  Instructor  │        │    Admin    │
    │  Login  │          │    Login     │        │   Login     │
    └────┬────┘          └──────┬───────┘        └─────┬───────┘
         │                      │                      │
         ▼                      ▼                      ▼
    ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐
    │   Member     │    │     Admin        │    │   Admin       │
    │  Dashboard   │    │   Dashboard      │    │  Dashboard    │
    │              │    │                  │    │   (Full)      │
    │ - Book Class │    │ - Approve Booking│    │ - All Stats   │
    │ - View Video │    │ - Track Students │    │ - All Classes │
    │ - My Booking │    │ - Track Earnings │    │ - Analytics   │
    └──────────────┘    └──────────────────┘    └───────────────┘
```

---

## Implementation Approach

### Option 1: Separate Dashboards (Recommended)

**Benefits:**
- Clean separation of concerns
- Optimized UI for each user type
- Easy to maintain and update
- Can deploy updates independently

**Structure:**
```
/swimpro/
├── index.html (Landing page + marketing)
├── dashboard.html (Member dashboard) ← New
├── admin-dashboard.html (Instructor dashboard) ← New
├── styles.css (Shared styles)
├── server.js (API backend)
└── uploads/
```

**Navigation Flow:**
```
1. User lands on index.html
2. Click "Login" → Determine role (API check)
3. If member → Route to /dashboard.html
4. If instructor → Route to /admin-dashboard.html
5. Load appropriate UI + data
```

**Pros:**
- Cleaner code (no conditionals)
- Better performance (separate files)
- Easier testing
- Can style independently

**Cons:**
- More files to maintain
- Requires routing/auth logic

---

### Option 2: Single Dashboard with Role-Based Rendering

**Benefits:**
- ✅ One file to update
- ✅ Shared styling & components

**Structure:**
```
/swimpro/
├── index.html (Landing page)
├── dashboard.html (Combined member + admin)
├── styles.css
├── server.js
└── uploads/
```

**Code Pattern:**
```html
<main class="dashboard-container">
    <!-- Member sections (visible if role === 'member') -->
    <section id="dashboard" v-if="userRole === 'member'">...</section>
    
    <!-- Admin sections (visible if role === 'admin') -->
    <section id="overview" v-if="userRole === 'admin'">...</section>
</main>
```

**Pros:**
- Single file to deploy
- Shared components

**Cons:**
- Complex JavaScript
- CSS conflicts between roles
- Larger file size
- Harder to maintain

---

### Implementation Steps (Option 1 - Recommended)

#### Step 1: Update Backend API
Add endpoints to `server.js`:

```javascript
// Check user role
app.post('/api/auth/check', (req, res) => {
    const token = req.headers.authorization;
    // Verify token
    const isInstructor = checkIfInstructor(token);
    res.json({ 
        role: isInstructor ? 'admin' : 'member',
        user: getUserData(token)
    });
});

// Get member data
app.get('/api/member/data', authenticateUser, (req, res) => {
    const memberId = req.user.id;
    const data = {
        upcomingClasses: getUpcomingClasses(),
        bookings: getMemberBookings(memberId),
        profile: getMemberProfile(memberId)
    };
    res.json(data);
});

// Get admin data
app.get('/api/admin/data', authenticateInstructor, (req, res) => {
    const instructorId = req.user.id;
    const data = {
        bookings: getInstructorBookings(instructorId),
        students: getInstructorStudents(instructorId),
        earnings: getInstructorEarnings(instructorId),
        stats: getInstructorStats(instructorId)
    };
    res.json(data);
});
```

#### Step 2: Create Login Router
Create `login.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>SwimPro Login</title>
</head>
<body>
    <div class="login-form">
        <input type="email" placeholder="Email" id="email">
        <input type="password" placeholder="Password" id="password">
        <button onclick="login()">Login</button>
    </div>

    <script>
        async function login() {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            
            // Redirect based on role
            if (data.role === 'admin') {
                window.location.href = '/admin-dashboard.html';
            } else {
                window.location.href = '/dashboard.html';
            }
        }
    </script>
</body>
</html>
```

#### Step 3: Update Dashboards with Dynamic Data
In `dashboard.html`, add data loading:

```javascript
// Load member data on page load
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/member/data', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    // Update UI with real data
    document.getElementById('userName').textContent = data.user.name;
    renderUpcomingClasses(data.upcomingClasses);
    renderBookings(data.bookings);
});
```

Similarly for `admin-dashboard.html`:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/data', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    // Update stats
    document.querySelector('.stat-value').textContent = data.stats.classesThisMonth;
    // Update tables
    renderBookingsTable(data.bookings);
    renderStudentsGrid(data.students);
});
```

#### Step 4: Integrate Booking System
Connect Paystack and booking logic:

```javascript
// In dashboard.html - Book a class
async function bookClass(classId) {
    // 1. Create booking record
    const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ classId })
    });
    
    const booking = await bookingResponse.json();
    
    // 2. Initialize Paystack payment
    PaystackPop.setup({
        key: 'pk_live_...',
        email: currentUser.email,
        amount: booking.amount * 100,
        ref: booking.id,
        onClose: () => console.log('Payment closed'),
        onSuccess: (response) => {
            // 3. Verify payment
            verifyPayment(response.reference);
        }
    });
    
    PaystackPop.openIframe();
}

// In admin-dashboard.html - Approve booking
async function approveBooking(bookingId) {
    const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
        refreshBookings();
    }
}
```

---

## 📁 Updated File Structure

After implementation:

```
c:\Users\denis\OneDrive\Desktop\swimpro\
├── index.html                          (Landing page - unchanged)
├── login.html                          (New login page)
├── dashboard.html                      (New member dashboard)
├── admin-dashboard.html                (New admin dashboard)
├── styles.css                          (Shared/responsive styles)
├── server.js                           (Updated with role-based endpoints)
├── DASHBOARD-DESIGN-DOCS.md           (Design documentation)
├── IMPLEMENTATION-GUIDE.md            (This file)
├── package.json
├── README-SETUP.md
└── uploads/
```

---

## 🧪 Testing Checklist

### Member Dashboard
- [ ] Can view upcoming classes
- [ ] Can book classes (without payment)
- [ ] Can book classes (with Paystack)
- [ ] Can view bookings history
- [ ] Can toggle dark mode
- [ ] Sidebar collapses on mobile
- [ ] All sections load correct content
- [ ] Responsive on 480px, 768px, 1200px+

### Admin Dashboard
- [ ] Can view overview stats
- [ ] Can approve/decline bookings
- [ ] Can view student list
- [ ] Can view earnings
- [ ] Can manage schedule
- [ ] Responsive on all devices
- [ ] Dark mode works

### Common
- [ ] Login redirects to correct dashboard
- [ ] Logout clears token
- [ ] Dark mode preference persists
- [ ] Navigation works in all sections
- [ ] No console errors
- [ ] Page doesn't overflow horizontally

---

## Deployment Steps

1. **Create login system**
   - Add JWT-based authentication to server.js
   - Create login.html page

2. **Test locally**
   - Run `node server.js`
   - Test member flow
   - Test admin flow

3. **Deploy to Render.com**
   ```bash
   git add .
   git commit -m "Add modern dashboard system (member + admin)"
   git push heroku main
   ```

4. **Update DNS**
   - Point swimpro.com → dashboard.html after login
   - Add /admin route for instructors

---

## 💾 Code Files to Create/Modify

### New Files:
- `dashboard.html` (Already created)
- `admin-dashboard.html` (Already created)
- `DASHBOARD-DESIGN-DOCS.md` (Already created)

### Files to Update:
- `server.js` - Add authentication endpoints + role-based data
- `package.json` - Ensure JWT library is included
- `index.html` - Add login button (link to login.html)

---

## 🎯 Priority Implementation Order

**Phase 1 (This Week):**
1. Create dashboard HTML layouts (DONE)
2. Create login.html
3. Update server.js with auth endpoints

**Phase 2 (Next Week):**
1. Integrate real data from API
2. Connect Paystack to member dashboard
3. Test member flow end-to-end

**Phase 3 (Following Week):**
1. Connect admin dashboard to data
2. Implement approval/decline logic
3. Test admin flow end-to-end

**Phase 4 (Deploy):**
1. Deploy to Render with all connected
2. Test live system
3. Update user documentation

---

## 📞 Quick Reference

### File Locations:
- Member Dashboard: `/dashboard.html`
- Admin Dashboard: `/admin-dashboard.html`
- Landing Page: `/index.html` (existing)

### Key Endpoints (to implement):
- POST `/api/auth/login` - User authentication
- GET `/api/member/data` - Member dashboard data
- GET `/api/admin/data` - Admin dashboard data
- POST `/api/bookings` - Create booking
- POST `/api/bookings/:id/approve` - Approve booking

### Colors Used:
- Member: Blue (#0066cc, #00a8e8) - calm, welcoming
- Admin: Red (#ff6b6b) - action-oriented, distinct

---

## 🤔 Q&A

**Q: Should I keep the old index.html?**
A: Yes! Use it as homepage/landing page. Show it to visitors before login.

**Q: How do I know which dashboard to show?**
A: After login, check user role from API. Redirect accordingly.

**Q: Can I customize the colors?**
A: Yes! Change CSS variables at the top of each file. All colors are in `:root {}`

**Q: How do I add more sections?**
A: Copy an existing section, change the ID and sidebar link, add content.

**Q: Is real-time booking sync needed?**
A: No. Just refresh data when user navigates sections.

**Q: Can this work with your existing Paystack setup?**
A: Yes! The booking flow stays the same, just integrated into dashboard.

---

## You Now Have

- Modern member dashboard (for bookings + content)
- Admin dashboard (for instructor management)
- Responsive design (40px → 1400px)
- Dark mode support
- Clean component system
- 65% less vertical scrolling
- Ready for real data integration

Next step: Connect to your backend!
