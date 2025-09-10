// Database simulation using localStorage
class EventDatabase {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize admin account
        if (!localStorage.getItem('admin')) {
            localStorage.setItem('admin', JSON.stringify({
                email: 'harshitha8388@gmail.com',
                password: '123456789'
            }));
        }

        // Initialize empty users array if not exists
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }

        // Initialize empty registrations array if not exists
        if (!localStorage.getItem('registrations')) {
            localStorage.setItem('registrations', JSON.stringify([]));
        }
    }

    // User registration
    registerUser(userData) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        const existingUser = users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Add new user
        const newUser = {
            id: Date.now(),
            ...userData,
            registeredAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Also add to registrations
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        registrations.push({
            id: Date.now(),
            userId: newUser.id,
            ...userData,
            status: 'pending',
            registeredAt: new Date().toISOString()
        });
        localStorage.setItem('registrations', JSON.stringify(registrations));

        return newUser;
    }

    // User login
    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(user => user.email === email && user.password === password);
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        return user;
    }

    // Admin login
    loginAdmin(email, password) {
        const admin = JSON.parse(localStorage.getItem('admin'));
        
        if (admin.email !== email || admin.password !== password) {
            throw new Error('Invalid admin credentials');
        }

        return admin;
    }

    // Get user registrations
    getUserRegistrations(userId) {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        return registrations.filter(reg => reg.userId === userId);
    }

    // Get all users (admin only)
    getAllUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Get all registrations (admin only)
    getAllRegistrations() {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        return registrations.map(reg => {
            const user = users.find(u => u.id === reg.userId);
            return {
                ...reg,
                userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
            };
        });
    }

    // Update registration status (admin only)
    updateRegistrationStatus(registrationId, status) {
        const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
        const registrationIndex = registrations.findIndex(reg => reg.id === registrationId);
        
        if (registrationIndex !== -1) {
            registrations[registrationIndex].status = status;
            localStorage.setItem('registrations', JSON.stringify(registrations));
            return true;
        }
        
        return false;
    }
}

// Initialize database
const db = new EventDatabase();

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
});

// Registration form handler
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const userData = Object.fromEntries(formData);
            
            // Validate password confirmation
            if (userData.password !== userData.confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Remove confirm password from data
            delete userData.confirmPassword;
            
            try {
                db.registerUser(userData);
                alert('Registration successful! You can now login.');
                window.location.href = 'login.html';
            } catch (error) {
                alert('Registration failed: ' + error.message);
            }
        });
    }
});

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const userLoginOption = document.getElementById('userLogin');
    const adminLoginOption = document.getElementById('adminLogin');
    const userLoginOptions = document.getElementById('userLoginOptions');
    const forgotPassword = document.getElementById('forgotPassword');
    
    let isAdminLogin = false;
    
    // Login option selection
    if (userLoginOption && adminLoginOption) {
        userLoginOption.addEventListener('click', function() {
            isAdminLogin = false;
            userLoginOption.classList.add('selected');
            adminLoginOption.classList.remove('selected');
            userLoginOptions.style.display = 'block';
            
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        });
        
        adminLoginOption.addEventListener('click', function() {
            isAdminLogin = true;
            adminLoginOption.classList.add('selected');
            userLoginOption.classList.remove('selected');
            userLoginOptions.style.display = 'none';
            
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        });
        
        // Default to user login
        userLoginOption.click();
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                if (isAdminLogin) {
                    const admin = db.loginAdmin(email, password);
                    sessionStorage.setItem('currentUser', JSON.stringify({
                        ...admin,
                        role: 'admin'
                    }));
                    window.location.href = 'admin-dashboard.html';
                } else {
                    const user = db.loginUser(email, password);
                    sessionStorage.setItem('currentUser', JSON.stringify({
                        ...user,
                        role: 'user'
                    }));
                    window.location.href = 'user-dashboard.html';
                }
            } catch (error) {
                alert('Login failed: ' + error.message);
            }
        });
    }
    
    // Forgot password handler (simulated)
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Password reset functionality would send an OTP to your email. This is a demo system.');
        });
    }
});

// Dashboard handlers
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    // User Dashboard
    const userName = document.getElementById('userName');
    const userEvents = document.getElementById('userEvents');
    
    if (userName && currentUser.firstName) {
        userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        
        const registrations = db.getUserRegistrations(currentUser.id);
        
        if (registrations.length === 0) {
            userEvents.innerHTML = `
                <div class="dashboard-card">
                    <h3>No Events Registered</h3>
                    <p>You haven't registered for any events yet. Browse our events and register for your perfect celebration!</p>
                    <a href="events.html" class="btn btn-primary">Browse Events</a>
                </div>
            `;
        } else {
            userEvents.innerHTML = registrations.map(reg => `
                <div class="dashboard-card">
                    <h3>${getEventDisplayName(reg.eventName)}</h3>
                    <p><strong>Venue:</strong> ${reg.venueName}</p>
                    <p><strong>Contact:</strong> ${reg.mobile}</p>
                    <p><strong>Status:</strong> 
                        <span class="status-badge ${
                            reg.status === 'confirmed' ? 'status-confirmed' :
                            reg.status === 'cancelled' ? 'status-cancelled' : 'status-pending'
                        }">${reg.status}</span>
                    </p>
                    <div class="event-actions">
                        <button class="btn btn-primary" onclick="toggleEventStatus(${reg.id}, '${reg.status}', 'confirm')">Confirm</button>
                        <button class="btn btn-secondary" onclick="toggleEventStatus(${reg.id}, '${reg.status}', 'pending')">Mark Pending</button>
                        <button class="btn btn-danger" onclick="toggleEventStatus(${reg.id}, '${reg.status}', 'cancel')">Cancel</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Admin Dashboard
    const allUsers = document.getElementById('allUsers');
    const allEvents = document.getElementById('allEvents');
    
    if (allUsers && currentUser.role === 'admin') {
        const users = db.getAllUsers();
        const registrations = db.getAllRegistrations();
        
        allUsers.innerHTML = users.map(user => `
            <div class="dashboard-card">
                <h3>${user.firstName} ${user.lastName}</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Mobile:</strong> ${user.mobile}</p>
                <p><strong>Registered:</strong> ${new Date(user.registeredAt).toLocaleDateString()}</p>
            </div>
        `).join('');
        
        allEvents.innerHTML = registrations.map(reg => `
            <div class="dashboard-card">
                <h3>${getEventDisplayName(reg.eventName)}</h3>
                <p><strong>User:</strong> ${reg.userName}</p>
                <p><strong>Venue:</strong> ${reg.venueName}</p>
                <p><strong>Date:</strong> ${new Date(reg.eventDate).toLocaleDateString()}</p>
                <p><strong>Contact:</strong> ${reg.mobile}</p>
                <p><strong>Status:</strong> 
                    <span class="status-badge ${
                        reg.status === 'confirmed' ? 'status-confirmed' :
                        reg.status === 'cancelled' ? 'status-cancelled' : 'status-pending'
                    }">${reg.status}</span>
                </p>
                <div class="event-actions">
                    <button class="btn btn-primary" onclick="toggleEventStatus(${reg.id}, '${reg.status}', 'confirm')">Confirm Event</button>
                    <button class="btn btn-secondary" onclick="toggleEventStatus(${reg.id}, '${reg.status}', 'pending')">Mark Pending</button>
                    <button class="btn btn-danger" onclick="toggleEventStatus(${reg.id}, '${reg.status}', 'cancel')">Cancel</button>
                </div>
            </div>
        `).join('');
    }
    
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});

// Helper functions
function getEventDisplayName(eventName) {
    const eventNames = {
        'marriage': 'Marriage Ceremony',
        'birthday': 'Birthday Party',
        'anniversary': 'Anniversary Party',
        'meeting': 'Official Meeting',
        'dance': 'Dance Show',
        'custom': 'Custom Event'
    };
    return eventNames[eventName] || eventName;
}

function toggleEventStatus(registrationId, currentStatus, action) {
    let newStatus;

    if (action === 'confirm') {
        newStatus = 'confirmed';
    } else if (action === 'pending') {
        newStatus = 'pending';
    } else if (action === 'cancel') {
        newStatus = 'cancelled';
    }

    if (db.updateRegistrationStatus(registrationId, newStatus)) {
        location.reload();
    } else {
        alert('Failed to update event status');
    }
}

// Check authentication for dashboard pages
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    if (currentPath.includes('user-dashboard.html')) {
        if (!currentUser.role || currentUser.role !== 'user') {
            window.location.href = 'login.html';
        }
    }
    
    if (currentPath.includes('admin-dashboard.html')) {
        if (!currentUser.role || currentUser.role !== 'admin') {
            window.location.href = 'login.html';
        }
    }
});

// New Event Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (currentUser.email) {
        const emailInput = document.getElementById('email');
        if (emailInput) emailInput.value = currentUser.email;
    }

    const form = document.getElementById('newEventForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const eventData = Object.fromEntries(formData);

            const registrations = JSON.parse(localStorage.getItem('registrations') || '[]');

            registrations.push({
                id: Date.now(),
                userId: currentUser.id,
                ...eventData,
                status: 'pending',
                registeredAt: new Date().toISOString()
            });

            localStorage.setItem('registrations', JSON.stringify(registrations));

            alert('Event booked successfully!');
            window.location.href = 'user-dashboard.html';
        });
    }
});

