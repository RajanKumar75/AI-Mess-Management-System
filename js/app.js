// Core Application Orchestrator & Role Router
import { authService } from './auth.js';
import { dbService } from './db.js';
import { studentModule } from './student.js';
import { staffModule } from './staff.js';
import { adminModule } from './admin.js';
import { isConnected, getStoredFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig } from './firebase-config.js';

export const app = {
  currentUser: null,

  async init() {
    this.currentUser = authService.getCurrentUser();
    this.renderShell();
    this.setupGlobalModals();

    window.addEventListener('auth-state-changed', (e) => {
      this.currentUser = e.detail;
      this.renderView();
    });

    await this.renderView();
  },

  renderShell() {
    const nav = document.getElementById('app-navbar');
    if (!nav) return;

    if (!this.currentUser) {
      nav.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl font-black shadow-md">
              M
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 tracking-tight leading-none">Apex Mess Management</h1>
              <p class="text-xs text-gray-500 mt-0.5">Automated Dining, QR Attendance & Firestore Sync</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button id="nav-btn-firebase" class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
              <span class="w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
              ${isConnected ? 'Firestore Cloud' : 'Demo Simulation'}
            </button>
          </div>
        </div>
      `;
    } else {
      const roleBadges = {
        student: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        staff: 'bg-amber-100 text-amber-800 border-amber-200',
        admin: 'bg-purple-100 text-purple-800 border-purple-200'
      };

      nav.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl font-black shadow-md">
              M
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-bold text-gray-900 tracking-tight leading-none">Apex Mess Management</h1>
                <span class="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border ${roleBadges[this.currentUser.role] || 'bg-gray-100 text-gray-800'}">
                  ${this.currentUser.role}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Hostel Dining & Food Administration System</p>
            </div>
          </div>

          <!-- Quick Role Switcher Bar (Convenient pair-programming & demo tester) -->
          <div class="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
              <span class="px-2 text-gray-400">Switch:</span>
              <button data-switch-role="student" class="px-2.5 py-1 rounded-lg transition ${this.currentUser.role === 'student' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'hover:text-gray-900'}">Student</button>
              <button data-switch-role="staff" class="px-2.5 py-1 rounded-lg transition ${this.currentUser.role === 'staff' ? 'bg-white text-amber-800 shadow-sm font-bold' : 'hover:text-gray-900'}">Mess Staff</button>
              <button data-switch-role="admin" class="px-2.5 py-1 rounded-lg transition ${this.currentUser.role === 'admin' ? 'bg-white text-purple-800 shadow-sm font-bold' : 'hover:text-gray-900'}">Admin</button>
            </div>

            ${this.currentUser.role !== 'admin' ? `
            <button id="nav-btn-firebase" title="Firestore Settings" class="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center gap-1.5 text-gray-700">
              <span class="w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
              <span class="hidden md:inline">${isConnected ? 'Firestore' : 'Demo'}</span>
            </button>
            ` : ''}

            <button id="btn-logout" class="bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition">
              Sign Out
            </button>
          </div>
        </div>
      `;

      // Attach navbar listeners
      document.querySelectorAll('[data-switch-role]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const targetRole = e.currentTarget.dataset.switchRole;
          await authService.quickDemoLogin(targetRole);
        });
      });

      const logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          await authService.logout();
        });
      }
    }

    const firebaseBtn = document.getElementById('nav-btn-firebase');
    if (firebaseBtn) {
      firebaseBtn.addEventListener('click', () => {
        const modal = document.getElementById('firebase-settings-modal');
        if (modal) modal.classList.remove('hidden');
      });
    }
  },

  async renderView() {
    this.renderShell();
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    if (!this.currentUser) {
      this.renderLoginScreen(container);
      return;
    }

    if (this.currentUser.role === 'student') {
      await studentModule.init(this.currentUser);
    } else if (this.currentUser.role === 'staff') {
      await staffModule.init(this.currentUser);
    } else if (this.currentUser.role === 'admin') {
      await adminModule.init(this.currentUser);
    } else {
      container.innerHTML = `<div class="p-8 text-center text-rose-600 font-bold">Unrecognized role: ${this.currentUser.role}</div>`;
    }
  },

  renderLoginScreen(container) {
    container.innerHTML = `
      <div class="max-w-5xl mx-auto py-8">
        <!-- Hero Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 mb-3">
            ✨ Centralized Dining & Automated Meal Management
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Choose Your Portal to Continue
          </h1>
          <p class="text-gray-500 text-sm max-w-lg mx-auto mt-2">
            Dedicated logins for students, kitchen cooks, and mess administration with real-time Cloud Firestore synchronization.
          </p>
        </div>

        <!-- Three Main Role Cards (1-Click Instant Login) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <!-- 1. STUDENT CARD -->
          <div class="bg-white rounded-3xl p-6 border-2 border-emerald-100 hover:border-emerald-500 shadow-sm hover:shadow-xl transition flex flex-col justify-between group">
            <div>
              <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                🎓
              </div>
              <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Role 1: Student</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Student Portal</h3>
              <p class="text-xs text-gray-500 leading-relaxed mb-4">
                View weekly rotating menus, mark meal attendance/opt-outs, access dynamic QR passes, apply for leaves and view fee receipts.
              </p>
              <div class="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 mb-4 border border-gray-100">
                <div class="font-bold text-gray-800">Default Demo Account:</div>
                <div>Rahul Sharma (Roll: CS2024-042)</div>
              </div>
            </div>
            <button data-quick-login="student" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2">
              <span>Enter as Student</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>

          <!-- 2. MESS STAFF CARD -->
          <div class="bg-white rounded-3xl p-6 border-2 border-amber-100 hover:border-amber-500 shadow-sm hover:shadow-xl transition flex flex-col justify-between group">
            <div>
              <div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                👨‍🍳
              </div>
              <div class="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Role 2: Kitchen Staff</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Mess Staff Portal</h3>
              <p class="text-xs text-gray-500 leading-relaxed mb-4">
                Live attendance headcount forecast (Veg/Non-veg), camera QR meal scanner, serving checkpoint, and food wastage logs.
              </p>
              <div class="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 mb-4 border border-gray-100">
                <div class="font-bold text-gray-800">Default Demo Account:</div>
                <div>Ramesh Kumar (Head Cook)</div>
              </div>
            </div>
            <button data-quick-login="staff" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2">
              <span>Enter as Mess Staff</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>

          <!-- 3. ADMIN CARD -->
          <div class="bg-white rounded-3xl p-6 border-2 border-purple-100 hover:border-purple-500 shadow-sm hover:shadow-xl transition flex flex-col justify-between group">
            <div>
              <div class="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                🛡️
              </div>
              <div class="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Role 3: Warden / Admin</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Admin Control</h3>
              <p class="text-xs text-gray-500 leading-relaxed mb-4">
                Institutional oversight, user directory, weekly menu scheduler, monthly billing engine, leave approvals, and grievance replies.
              </p>
              <div class="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 mb-4 border border-gray-100">
                <div class="font-bold text-gray-800">Default Demo Account:</div>
                <div>Rajan (Mess Warden / Admin)</div>
              </div>
            </div>
            <button data-quick-login="admin" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2">
              <span>Enter as Admin</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </div>

        <!-- Custom Email / Password Sign In Accordion -->
        <div class="max-w-md mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h4 class="font-bold text-gray-800 text-sm mb-3 text-center">Or Sign In with Email & Password</h4>
          <form id="custom-login-form" class="space-y-3">
            <div>
              <input type="email" id="login-email" required placeholder="Email address"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            </div>
            <div>
              <input type="password" id="login-password" required placeholder="Password"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            </div>
            <button type="submit" class="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl text-sm transition">
              Sign In
            </button>
          </form>

          <div class="text-center mt-4 pt-4 border-t border-gray-100">
            <button id="btn-open-register" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
              Don't have an account? Register as New Student / Staff &rarr;
            </button>
          </div>
        </div>
      </div>
    `;

    // Attach login handlers
    document.querySelectorAll('[data-quick-login]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const role = e.currentTarget.dataset.quickLogin;
        await authService.quickDemoLogin(role);
      });
    });

    const customForm = document.getElementById('custom-login-form');
    if (customForm) {
      customForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const res = await authService.login(email, pass);
        if (!res.success) {
          alert(res.error || 'Login failed');
        }
      });
    }

    const regBtn = document.getElementById('btn-open-register');
    if (regBtn) {
      regBtn.addEventListener('click', () => {
        const regModal = document.getElementById('register-modal');
        if (regModal) regModal.classList.remove('hidden');
      });
    }
  },

  setupGlobalModals() {
    // 1. Firebase Modal
    const fModal = document.getElementById('firebase-settings-modal');
    const fClose = document.getElementById('btn-close-firebase-modal');
    const fForm = document.getElementById('firebase-config-form');
    const fReset = document.getElementById('btn-reset-firebase');

    const stored = getStoredFirebaseConfig();
    if (stored && document.getElementById('fb-api-key')) {
      document.getElementById('fb-api-key').value = stored.apiKey || '';
      document.getElementById('fb-auth-domain').value = stored.authDomain || '';
      document.getElementById('fb-project-id').value = stored.projectId || '';
      document.getElementById('fb-storage-bucket').value = stored.storageBucket || '';
      document.getElementById('fb-messaging-sender-id').value = stored.messagingSenderId || '';
      document.getElementById('fb-app-id').value = stored.appId || '';
    }

    if (fClose && fModal) {
      fClose.addEventListener('click', () => fModal.classList.add('hidden'));
    }

    if (fForm) {
      fForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const config = {
          apiKey: document.getElementById('fb-api-key').value.trim(),
          authDomain: document.getElementById('fb-auth-domain').value.trim(),
          projectId: document.getElementById('fb-project-id').value.trim(),
          storageBucket: document.getElementById('fb-storage-bucket').value.trim(),
          messagingSenderId: document.getElementById('fb-messaging-sender-id').value.trim(),
          appId: document.getElementById('fb-app-id').value.trim()
        };
        saveFirebaseConfig(config);
      });
    }

    if (fReset) {
      fReset.addEventListener('click', () => {
        if (confirm('Clear custom Firebase configuration and revert to Demo Mode?')) {
          clearFirebaseConfig();
        }
      });
    }

    // 2. Registration Modal
    const rModal = document.getElementById('register-modal');
    const rClose = document.getElementById('btn-close-register');
    const rForm = document.getElementById('register-form');
    const regRoleSelect = document.getElementById('reg-role');
    const studentFields = document.getElementById('reg-student-fields');
    const studentNote = document.getElementById('reg-student-note');
    const rollInput = document.getElementById('reg-roll');
    const roomInput = document.getElementById('reg-room');

    if (regRoleSelect) {
      const syncRoleFields = () => {
        const isStudent = regRoleSelect.value === 'student';
        if (studentFields) studentFields.style.display = isStudent ? 'block' : 'none';
        if (studentNote) studentNote.style.display = isStudent ? 'block' : 'none';
        if (rollInput) {
          rollInput.required = isStudent;
          if (!isStudent) rollInput.value = '';
        }
        if (roomInput) {
          roomInput.required = isStudent;
          if (!isStudent) roomInput.value = '';
        }
      };
      regRoleSelect.addEventListener('change', syncRoleFields);
      syncRoleFields();
    }

    if (rClose && rModal) {
      rClose.addEventListener('click', () => rModal.classList.add('hidden'));
    }

    if (rForm) {
      rForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        const roll = rollInput ? rollInput.value.trim() : '';
        const room = roomInput ? roomInput.value.trim() : '';
        const diet = document.getElementById('reg-diet') ? document.getElementById('reg-diet').value : 'veg';

        const res = await authService.register({
          displayName: name,
          email,
          password,
          role,
          rollNumber: roll,
          roomNumber: room,
          dietaryPreference: diet
        });

        if (res.success) {
          if (res.pendingApproval) {
            alert(`Registration Submitted Successfully!\n\nWelcome, ${name}!\nYour student account has been registered and is now pending approval from the Mess Warden / Admin.\nYou will be able to log in and use mess services once the Warden approves your registration.`);
          } else {
            alert(`Account registered successfully as ${role.toUpperCase()}! Logged in.`);
          }
          rForm.reset();
          if (regRoleSelect) {
            regRoleSelect.value = 'student';
            if (studentFields) studentFields.style.display = 'block';
            if (studentNote) studentNote.style.display = 'block';
            if (rollInput) rollInput.required = true;
            if (roomInput) roomInput.required = true;
          }
          if (rModal) rModal.classList.add('hidden');
        } else {
          alert(res.error || 'Registration failed.');
        }
      });
    }
  }
};

// Global Live Clock updater: updates all elements with .live-clock-text every 1000ms
setInterval(() => {
  const clockEls = document.querySelectorAll('.live-clock-text');
  if (clockEls.length > 0) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const fullClock = `${timeStr} • ${dateStr}`;
    clockEls.forEach(el => {
      if (el.textContent !== fullClock) {
        el.textContent = fullClock;
      }
    });
  }
}, 1000);

// Start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
