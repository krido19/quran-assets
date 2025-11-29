
// Supabase Configuration
// REPLACE THESE WITH YOUR ACTUAL SUPABASE URL AND KEY
const SUPABASE_URL = 'https://iobjxfmhziptjwlctxjo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvYmp4Zm1oemlwdGp3bGN0eGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzODYzNDEsImV4cCI6MjA3OTk2MjM0MX0.W8hgaOI-QXnxt1l6yNLfgTgpNzveeCNJVaDEkK-4QTQ';

let supabase;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
    console.error("Supabase client failed to initialize:", error);
}

// Auth State
let currentUser = null;

// Initialize Auth
async function initAuth() {
    if (!supabase) return;

    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    handleSession(session);

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
    });

    // Setup Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await signIn(email, password);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            await signUp(email, password);
        });
    }
}

function handleSession(session) {
    if (session) {
        currentUser = session.user;
        updateAuthUI(true);
    } else {
        currentUser = null;
        updateAuthUI(false);
    }
}

function updateAuthUI(isLoggedIn) {
    const navProfile = document.getElementById('nav-profile');
    const loginView = document.getElementById('view-login');

    if (isLoggedIn) {
        // Change Profile Icon/Text
        if (navProfile) {
            navProfile.querySelector('span').textContent = 'Account';
            navProfile.querySelector('i').className = 'fa-solid fa-user';
        }

        // Update Login View to show Profile info instead of form
        if (loginView) {
            loginView.innerHTML = `
                <div class="auth-container">
                    <h2>My Profile</h2>
                    <p>${currentUser.email}</p>
                    <button class="btn-primary" onclick="signOut()" style="background:var(--text-muted)">Sign Out</button>
                </div>
            `;
        }
    } else {
        // Reset to default
        if (navProfile) {
            navProfile.querySelector('span').textContent = 'Profile';
            navProfile.querySelector('i').className = 'fa-regular fa-user';
        }

        // Restore Login Form (if needed, though usually we just switch views)
        // Since we replaced innerHTML, we might need to reload the page or reconstruct the form.
        // For simplicity, we'll just reload if they sign out to restore the form state, 
        // or we can reconstruct the form HTML here.
        if (loginView && !loginView.querySelector('form')) {
            loginView.innerHTML = `
                <div class="auth-container">
                    <h2>Welcome Back</h2>
                    <p>Sign in to sync your bookmarks</p>
                    <form id="login-form" onsubmit="handleLogin(event)">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="login-email" required placeholder="name@example.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="login-password" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn-primary">Sign In</button>
                    </form>
                    <p class="auth-footer">Don't have an account? <a href="#" onclick="switchView('view-signup')">Sign Up</a></p>
            </div>`;
            // Re-attach listener
            const form = document.getElementById('login-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                await signIn(email, password);
            });
        }
    }
}

async function signUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        if (error) throw error;
        showToast('Signup successful! Please check your email.', 'success');
        switchView('view-login');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) throw error;
        showToast('Welcome back!', 'success');
        switchView('view-quran'); // Redirect to home
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        showToast('Signed out successfully.', 'success');
        switchView('view-login');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Toast Notification Helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// Helper for the re-injected form
function handleLogin(e) {
    e.preventDefault();
    // Logic handled by event listener re-attachment
}

// Call init
document.addEventListener('DOMContentLoaded', initAuth);
