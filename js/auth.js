// Authentication Service supporting Student, Mess Staff, and Admin roles
import { auth, isConnected, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase-config.js';
import { dbService } from './db.js';

const SESSION_KEY = 'mess_current_user';

export const authService = {
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: user }));
  },

  async login(email, password) {
    if (isConnected && auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await dbService.getUserById(userCred.user.uid);
        if (profile) {
          if (profile.role === 'student' && profile.status === 'pending') {
            return { success: false, error: 'Your student account is pending approval from the Mess Warden/Admin. Please wait for approval before logging in.' };
          }
          if (profile.status === 'rejected') {
            return { success: false, error: 'Your account registration was rejected by the Mess Warden.' };
          }
          this.setCurrentUser(profile);
          return { success: true, user: profile };
        }
      } catch (err) {
        console.warn('Firebase Auth login failed, checking fallback credentials:', err.message);
      }
    }

    // Local / Demo check
    const users = await dbService.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      if (!found.password || found.password === password.trim()) {
        if (found.role === 'student' && found.status === 'pending') {
          return { success: false, error: 'Your student account is pending approval from the Mess Warden/Admin. Please wait for approval before logging in.' };
        }
        if (found.status === 'rejected') {
          return { success: false, error: 'Your account registration was rejected by the Mess Warden.' };
        }
        this.setCurrentUser(found);
        return { success: true, user: found };
      } else {
        return { success: false, error: 'Incorrect password entered.' };
      }
    }

    return { success: false, error: 'No account found with this email address.' };
  },

  async quickDemoLogin(role) {
    const users = await dbService.getUsers();
    let target = null;
    if (role === 'student') {
      target = users.find(u => u.role === 'student' && u.status === 'active');
    } else if (role === 'staff') {
      target = users.find(u => u.role === 'staff');
    } else if (role === 'admin') {
      target = users.find(u => u.role === 'admin');
    }

    if (target) {
      this.setCurrentUser(target);
      return { success: true, user: target };
    }
    return { success: false, error: `Could not find an active ${role} account.` };
  },

  async register(data) {
    const { email, password, displayName, role, rollNumber, roomNumber, phone, dietaryPreference, classStandard, monthlyFee } = data;
    const selectedRole = role || 'student';
    let uid = 'usr-' + Date.now();

    if (isConnected && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        uid = cred.user.uid;
      } catch (err) {
        console.warn('Firebase user creation notice:', err.message);
      }
    }

    const isStudent = selectedRole === 'student';
    const stdMonthlyFee = isStudent ? (Number(monthlyFee) || 3000) : 0;

    const newUser = {
      uid,
      email: email.trim().toLowerCase(),
      password,
      displayName: displayName.trim(),
      role: selectedRole,
      rollNumber: isStudent ? (rollNumber ? rollNumber.trim() : 'ROLL-' + Math.floor(1000 + Math.random() * 9000)) : (selectedRole === 'admin' ? 'ADMIN-' + Math.floor(10 + Math.random() * 90) : 'STAFF-' + Math.floor(100 + Math.random() * 900)),
      roomNumber: isStudent ? (roomNumber ? roomNumber.trim() : 'General') : (selectedRole === 'admin' ? 'Admin Office' : 'Mess Counter'),
      phone: phone || '',
      dietaryPreference: isStudent ? (dietaryPreference || 'veg') : 'veg',
      classStandard: isStudent ? (classStandard || '') : '',
      // Wallet starts equal to the assigned standard monthly fee
      walletBalance: isStudent ? stdMonthlyFee : 0,
      monthlyFee: stdMonthlyFee,
      amountUsed: 0,
      status: isStudent ? 'pending' : 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    await dbService.saveUser(newUser);

    // Seed initial "Monthly Fee Credit" transaction for new student
    if (isStudent && stdMonthlyFee > 0) {
      const ts = Date.now();
      const txn = {
        id: `TXN-INIT-${ts}`,
        studentId: uid,
        type: 'credit',
        amount: stdMonthlyFee,
        method: 'Monthly Fee Credit',
        description: `Standard Monthly Meal Fee – ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
        status: 'completed',
        createdAt: new Date().toISOString()
      };
      try {
        const payments = JSON.parse(localStorage.getItem('mess_db_payments') || '[]');
        payments.unshift(txn);
        localStorage.setItem('mess_db_payments', JSON.stringify(payments));
      } catch (e) {}
    }

    // Only auto sign-in if active (staff / admin). Students wait for Admin approval!
    if (newUser.status === 'active') {
      this.setCurrentUser(newUser);
      return { success: true, user: newUser, pendingApproval: false };
    } else {
      return { success: true, user: newUser, pendingApproval: true };
    }
  },

  // ── FORGOT PASSWORD ────────────────────────────────────────────────────────
  async forgotPassword(emailOrRoll, newPassword) {
    return await dbService.resetPassword(emailOrRoll, newPassword);
  },

  async logout() {
    if (isConnected && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    this.setCurrentUser(null);
  }
};
