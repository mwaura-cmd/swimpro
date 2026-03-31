# Code Integration Examples

## 🔗 Integrating Dashboard with Existing Backend

### 1. Update `server.js` - Add Member Data Endpoint

Add this to your server.js:

```javascript
// GET member dashboard data
app.get('/api/member/:id/dashboard', (req, res) => {
    const memberId = req.params.id;
    
    try {
        // Load bookings for this member
        const bookingsFile = './bookings.json';
        const bookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
        
        // Filter bookings by member
        const memberBookings = bookings.filter(b => b.studentEmail === req.query.email);
        
        // Get stats
        const stats = {
            totalClasses: memberBookings.length,
            upcomingClasses: memberBookings.filter(b => new Date(b.date) > new Date()).length,
            totalSpent: memberBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
        };
        
        // Get upcoming classes
        const upcomingClasses = memberBookings
            .filter(b => new Date(b.date) > new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
        
        res.json({
            user: {
                name: req.query.name || 'Guest',
                email: req.query.email,
                id: memberId
            },
            stats: {
                classesThisMonth: stats.totalClasses,
                activeMembers: 48, // Placeholder
                satisfaction: 94,
                monthlyRevenue: stats.totalSpent
            },
            upcomingClasses: [
                {
                    id: 1,
                    name: 'Freestyle Beginner',
                    instructor: 'Denis Mwaura',
                    time: 'Mon, 10:00 AM - 11:00 AM',
                    spots: '4/6',
                    badge: 'Popular',
                    instructorAvatar: 'D'
                },
                {
                    id: 2,
                    name: 'Backstroke Advanced',
                    instructor: 'Kennedy Munyua',
                    time: 'Wed, 2:30 PM - 3:30 PM',
                    spots: '2/6',
                    badge: 'Expert',
                    instructorAvatar: 'K'
                }
            ],
            bookings: upcomingClasses
        });
    } catch (error) {
        console.error('Error fetching member data:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// GET classes available for booking
app.get('/api/classes', (req, res) => {
    const classes = [
        {
            id: 1,
            name: 'Freestyle Beginner',
            instructor: 'Denis Mwaura',
            instructorAvatar: 'D',
            date: '2024-03-24',
            time: '10:00 AM - 11:00 AM',
            totalSpots: 6,
            bookedSpots: 2,
            price: 200,
            level: 'Beginner',
            description: 'Perfect for beginners learning freestyle basics'
        },
        {
            id: 2,
            name: 'Backstroke Advanced',
            instructor: 'Kennedy Munyua',
            instructorAvatar: 'K',
            date: '2024-03-26',
            time: '2:30 PM - 3:30 PM',
            totalSpots: 6,
            bookedSpots: 4,
            price: 500,
            level: 'Advanced',
            description: 'Advanced techniques for experienced swimmers'
        }
    ];
    
    res.json(classes);
});
```

### 2. Update `dashboard.html` - Load Real Data

Replace the hardcoded stats with API calls:

```javascript
// Add this at the beginning of the script section
class DashboardManager {
    constructor() {
        this.memberId = localStorage.getItem('memberId');
        this.memberEmail = localStorage.getItem('memberEmail');
        this.memberName = localStorage.getItem('memberName');
    }
    
    async loadDashboardData() {
        try {
            const response = await fetch(
                `/api/member/${this.memberId}/dashboard?email=${this.memberEmail}&name=${this.memberName}`
            );
            
            if (!response.ok) throw new Error('Failed to load data');
            
            const data = await response.json();
            
            // Update user profile
            document.getElementById('userName').textContent = data.user.name;
            document.querySelector('.user-avatar').textContent = data.user.name.charAt(0);
            
            // Update stats
            this.updateStats(data.stats);
            
            // Render upcoming classes
            this.renderUpcomingClasses(data.upcomingClasses);
            
            // Render recent bookings
            this.renderRecentBookings(data.bookings);
            
            console.log('Dashboard loaded successfully');
        } catch (error) {
            console.error('Error loading dashboard:', error);
            // Show error message to user
            alert('Failed to load dashboard data');
        }
    }
    
    updateStats(stats) {
        // Update stat boxes
        document.querySelectorAll('.stat-box-value').forEach((el, idx) => {
            const values = [stats.classesThisMonth, stats.activeMembers, stats.satisfaction, stats.monthlyRevenue];
            el.textContent = values[idx] || '0';
        });
    }
    
    renderUpcomingClasses(classes) {
        const container = document.querySelector('.section:nth-of-type(1) .grid');
        container.innerHTML = '';
        
        classes.forEach(cls => {
            const card = this.createClassCard(cls);
            container.appendChild(card);
        });
    }
    
    createClassCard(cls) {
        const card = document.createElement('div');
        card.className = 'card class-card';
        
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="card-title">${cls.name}</div>
                    <div class="badge badge-primary">${cls.badge}</div>
                </div>
                <div class="card-icon primary">
                    <i class="fas fa-swimmer"></i>
                </div>
            </div>
            <div class="card-content">
                <div class="class-instructor">
                    <div class="class-instructor-avatar">${cls.instructorAvatar}</div>
                    <span>${cls.instructor}</span>
                </div>
                <div class="class-time">
                    <i class="fas fa-clock"></i> ${cls.time}
                </div>
                <div class="class-spots">
                    <span class="spot-indicator available"></span>
                    ${cls.spots} spots available
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-small" onclick="dashboardManager.bookClass('${cls.id}')">
                    Book Class
                </button>
            </div>
        `;
        
        return card;
    }
    
    async bookClass(classId) {
        try {
            // Create booking
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classId,
                    studentEmail: this.memberEmail,
                    studentName: this.memberName,
                    amount: 200
                })
            });
            
            if (!response.ok) throw new Error('Booking failed');
            
            const booking = await response.json();
            
            // Trigger Paystack payment
            this.initiatePayment(booking);
        } catch (error) {
            console.error('Error booking class:', error);
            alert('Failed to create booking');
        }
    }
    
    initiatePayment(booking) {
        PaystackPop.setup({
            key: 'pk_live_YOUR_PAYSTACK_KEY',
            email: this.memberEmail,
            amount: booking.amount * 100,
            ref: booking.id,
            onClose: () => alert('Payment cancelled'),
            onSuccess: (response) => {
                this.verifyPayment(response.reference, booking.id);
            }
        });
        
        PaystackPop.openIframe();
    }
    
    async verifyPayment(reference, bookingId) {
        try {
            const response = await fetch('/api/paystack/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                alert('Booking confirmed!');
                this.loadDashboardData(); // Refresh data
            } else {
                alert('Payment verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
        }
    }
    
    renderRecentBookings(bookings) {
        const container = document.querySelector('section#dashboard .grid:last-of-type');
        container.innerHTML = '';
        
        bookings.slice(0, 3).forEach(booking => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <div class="card-title">${booking.name}</div>
                        <div class="card-title" style="font-size: 0.9rem; font-weight: 400; color: var(--text-secondary); margin-top: 5px;">
                            ${booking.time}
                        </div>
                    </div>
                    <div class="badge badge-success">Confirmed</div>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

// Initialize on page load
const dashboardManager = new DashboardManager();

document.addEventListener('DOMContentLoaded', () => {
    dashboardManager.loadDashboardData();
    setupNavigation();
    setupThemeToggle();
});
```

### 3. Update `admin-dashboard.html` - Admin Data

```javascript
class AdminDashboardManager {
    constructor(instructorId) {
        this.instructorId = instructorId;
    }
    
    async loadAdminData() {
        try {
            const response = await fetch(
                `/api/admin/${this.instructorId}/dashboard`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                }
            );
            
            const data = await response.json();
            
            // Update stats
            this.updateStats(data.stats);
            
            // Update tables
            this.renderUpcomingClassesTable(data.upcomingClasses);
            this.renderBookingsTable(data.bookings);
            this.renderStudentsGrid(data.students);
            
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }
    
    updateStats(stats) {
        const statBoxes = document.querySelectorAll('.stat-box-value');
        statBoxes[0].textContent = stats.classesThisMonth;
        statBoxes[1].textContent = stats.totalSessions;
        statBoxes[2].textContent = stats.averageRating.toFixed(1) + '★';
        statBoxes[3].textContent = stats.monthlyEarnings;
    }
    
    renderBookingsTable(bookings) {
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';
        
        bookings.forEach(booking => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>
                    <div class="student-name">
                        <div class="student-avatar">${booking.studentName.charAt(0)}</div>
                        <span>${booking.studentName}</span>
                    </div>
                </td>
                <td>${booking.className}</td>
                <td>${booking.date} @ ${booking.time}</td>
                <td><span class="badge badge-success">Paid</span></td>
                <td><span class="badge ${booking.status === 'pending' ? 'badge-warning' : 'badge-success'}">
                    ${booking.status === 'pending' ? 'Pending' : 'Confirmed'}
                </span></td>
                <td>
                    ${booking.status === 'pending' ? `
                        <button class="btn btn-success btn-small" onclick="adminManager.approveBooking('${booking.id}')">Confirm</button>
                        <button class="btn btn-secondary btn-small" onclick="adminManager.declineBooking('${booking.id}')">Decline</button>
                    ` : `
                        <button class="btn btn-secondary btn-small">View</button>
                    `}
                </td>
            `;
        });
    }
    
    async approveBooking(bookingId) {
        try {
            const response = await fetch(`/api/bookings/${bookingId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                alert('Booking confirmed!');
                this.loadAdminData();
            }
        } catch (error) {
            console.error('Error approving booking:', error);
        }
    }
    
    async declineBooking(bookingId) {
        try {
            const response = await fetch(`/api/bookings/${bookingId}/decline`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            
            if (response.ok) {
                alert('Booking declined!');
                this.loadAdminData();
            }
        } catch (error) {
            console.error('Error declining booking:', error);
        }
    }
}

// Initialize admin dashboard
const adminManager = new AdminDashboardManager(localStorage.getItem('instructorId'));
document.addEventListener('DOMContentLoaded', () => {
    adminManager.loadAdminData();
});
```

### 4. Create Simple Login Flow

Create `login.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwimPro Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0066cc 0%, #00a8e8 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .login-header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #0066cc;
        }
        .login-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        label {
            font-weight: 600;
            color: #1a1a2e;
        }
        input {
            padding: 12px;
            border: 1px solid #e0e6ed;
            border-radius: 8px;
            font-size: 1rem;
        }
        input:focus {
            outline: none;
            border-color: #0066cc;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }
        .btn-login {
            padding: 12px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        .btn-login:hover {
            background: #0052a3;
        }
        .role-selector {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 20px;
        }
        .role-btn {
            padding: 12px;
            border: 2px solid #e0e6ed;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 600;
        }
        .role-btn.active {
            border-color: #0066cc;
            color: #0066cc;
            background: rgba(0, 102, 204, 0.05);
        }
        .error {
            color: #ff6b6b;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <h1><i class="fas fa-water"></i> SwimPro</h1>
            <p>Swimming Excellence Platform</p>
        </div>
        
        <div class="role-selector">
            <button class="role-btn active" data-role="member" onclick="setRole('member')">
                <i class="fas fa-user"></i> Member
            </button>
            <button class="role-btn" data-role="admin" onclick="setRole('admin')">
                <i class="fas fa-user-tie"></i> Instructor
            </button>
        </div>
        
        <form class="login-form" id="loginForm" onsubmit="handleLogin(event)">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" required value="test@example.com">
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" required value="password123">
            </div>
            
            <div class="error" id="errorMsg"></div>
            
            <button type="submit" class="btn-login">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
        </form>
    </div>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script>
        let selectedRole = 'member';
        
        function setRole(role) {
            selectedRole = role;
            document.querySelectorAll('.role-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.closest('.role-btn').classList.add('active');
        }
        
        async function handleLogin(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        role: selectedRole
                    })
                });
                
                if (!response.ok) throw new Error('Login failed');
                
                const data = await response.json();
                
                // Store auth info
                localStorage.setItem('token', data.token);
                localStorage.setItem('memberId', data.userId);
                localStorage.setItem('memberEmail', data.email);
                localStorage.setItem('memberName', data.name);
                
                // Redirect based on role
                if (selectedRole === 'admin') {
                    localStorage.setItem('adminToken', data.token);
                    localStorage.setItem('instructorId', data.userId);
                    window.location.href = '/admin-dashboard.html';
                } else {
                    window.location.href = '/dashboard.html';
                }
            } catch (error) {
                errorMsg.textContent = 'Login failed. Try: test@example.com / password123';
                console.error('Login error:', error);
            }
        }
    </script>
</body>
</html>
```

### 5. Add Backend Endpoints to `server.js`

```javascript
// Handle member login
app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    
    // TODO: Verify user credentials against database
    // For now, accept test credentials
    if (email === 'test@example.com' && password === 'password123') {
        const token = 'test-token-' + Date.now();
        
        res.json({
            token,
            userId: 'user-123',
            email,
            name: email.split('@')[0],
            role
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Get admin dashboard data
app.get('/api/admin/:id/dashboard', (req, res) => {
    try {
        const stats = {
            classesThisMonth: 24,
            totalSessions: 134,
            averageRating: 4.8,
            monthlyEarnings: 'KSh 58K'
        };
        
        // Load bookings data
        const bookings = JSON.parse(
            fs.readFileSync('./bookings.json', 'utf8')
        );
        
        res.json({
            stats,
            upcomingClasses: bookings.slice(0, 3),
            bookings: bookings.filter(b => b.status === 'pending').slice(0, 5),
            students: [
                { id: 1, name: 'John Kipchoge', classes: 12, rating: 5, spent: 2400 },
                { id: 2, name: 'Sarah Kipchoge', classes: 8, rating: 4, spent: 1600 },
                { id: 3, name: 'Peter Kiprotich', classes: 3, rating: 3, spent: 600 }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load data' });
    }
});
```

---

## Integration Checklist

- [ ] Create login.html
- [ ] Update server.js with new endpoints
- [ ] Add member data API call to dashboard.html
- [ ] Add admin data API call to admin-dashboard.html
- [ ] Test member login flow
- [ ] Test admin login flow
- [ ] Connect real Paystack key
- [ ] Connect real database queries
- [ ] Test booking creation
- [ ] Test booking approval
- [ ] Deploy to production

This provides a complete working integration!
