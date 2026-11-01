// Unified Database Service (Firestore with seamless Local Simulation fallback)
import { 
  db, 
  isConnected, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where 
} from './firebase-config.js';
import { initialMockData } from './mock-data.js';

const LOCAL_STORAGE_PREFIX = 'mess_db_';

function getLocalData(key, fallback) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage', e);
    return fallback;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
}

// Initialize local mock store
if (!localStorage.getItem(LOCAL_STORAGE_PREFIX + 'initialized')) {
  for (const [key, value] of Object.entries(initialMockData)) {
    setLocalData(key, value);
  }
  localStorage.setItem(LOCAL_STORAGE_PREFIX + 'initialized', 'true');
}

// Backward-compatibility migration: ensure all student objects have monthlyFee & amountUsed
(function migrateStudentWalletFields() {
  try {
    const users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PREFIX + 'users') || '[]');
    let changed = false;
    users.forEach(u => {
      if (u.role === 'student') {
        if (u.monthlyFee === undefined) { u.monthlyFee = 3000; changed = true; }
        if (u.amountUsed === undefined) { u.amountUsed = 0; changed = true; }
        if (u.classStandard === undefined) { u.classStandard = ''; changed = true; }
      }
    });
    if (changed) localStorage.setItem(LOCAL_STORAGE_PREFIX + 'users', JSON.stringify(users));

    // Ensure mealBookings & payments collections exist
    if (!localStorage.getItem(LOCAL_STORAGE_PREFIX + 'mealBookings')) {
      setLocalData('mealBookings', initialMockData.mealBookings || []);
    }
    if (!localStorage.getItem(LOCAL_STORAGE_PREFIX + 'payments')) {
      setLocalData('payments', initialMockData.payments || []);
    }
  } catch (e) {
    console.warn('Migration error:', e);
  }
})();

export const dbService = {
  isCloudFirestore() {
    return isConnected;
  },

  // USERS
  async getUsers() {
    if (isConnected && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), uid: d.id }));
        }
      } catch (err) {
        console.warn('Firestore fetch failed, using local store:', err);
      }
    }
    return getLocalData('users', initialMockData.users);
  },

  async getUserById(uid) {
    if (isConnected && db) {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { ...docSnap.data(), uid: docSnap.id };
        }
      } catch (err) {
        console.warn('Firestore fetch user failed:', err);
      }
    }
    const users = getLocalData('users', initialMockData.users);
    return users.find(u => u.uid === uid) || null;
  },

  async saveUser(user) {
    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'users', user.uid), user, { merge: true });
      } catch (err) {
        console.error('Firestore saveUser error:', err);
      }
    }
    const users = getLocalData('users', initialMockData.users);
    const idx = users.findIndex(u => u.uid === user.uid);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    setLocalData('users', users);
    return user;
  },

  async deleteUser(uid) {
    if (isConnected && db) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.error('Firestore deleteUser error:', err);
      }
    }
    const users = getLocalData('users', initialMockData.users).filter(u => u.uid !== uid);
    setLocalData('users', users);
  },

  async approveStudent(uid) {
    if (isConnected && db) {
      try {
        await updateDoc(doc(db, 'users', uid), { status: 'active', walletBalance: 3000 });
      } catch (err) {
        console.error('Firestore approveStudent error:', err);
      }
    }
    const users = getLocalData('users', initialMockData.users);
    const idx = users.findIndex(u => u.uid === uid);
    if (idx >= 0) {
      users[idx].status = 'active';
      if (!users[idx].walletBalance || users[idx].walletBalance === 0) {
        users[idx].walletBalance = 3000;
        users[idx].monthlyFee = 3000;
        users[idx].amountUsed = 0;
      }
      setLocalData('users', users);
      return users[idx];
    }
    return null;
  },

  async rejectStudent(uid) {
    if (isConnected && db) {
      try {
        await updateDoc(doc(db, 'users', uid), { status: 'rejected' });
      } catch (err) {
        console.error('Firestore rejectStudent error:', err);
      }
    }
    const users = getLocalData('users', initialMockData.users);
    const idx = users.findIndex(u => u.uid === uid);
    if (idx >= 0) {
      users[idx].status = 'rejected';
      setLocalData('users', users);
      return users[idx];
    }
    return null;
  },

  // ── RESET PASSWORD ─────────────────────────────────────────────────────────
  async resetPassword(emailOrRoll, newPassword) {
    const users = getLocalData('users', initialMockData.users);
    const q = (emailOrRoll || '').trim().toLowerCase();
    const idx = users.findIndex(u =>
      (u.email && u.email.toLowerCase() === q) ||
      (u.rollNumber && u.rollNumber.toLowerCase() === q)
    );
    if (idx < 0) {
      return { success: false, error: 'No account found with that email or roll number.' };
    }
    users[idx].password = newPassword;
    setLocalData('users', users);

    // Update session if this is the currently logged-in user
    try {
      const session = JSON.parse(localStorage.getItem('mess_current_user') || 'null');
      if (session && session.uid === users[idx].uid) {
        session.password = newPassword;
        localStorage.setItem('mess_current_user', JSON.stringify(session));
      }
    } catch (e) {}

    if (isConnected && db) {
      try {
        await updateDoc(doc(db, 'users', users[idx].uid), { password: newPassword });
      } catch (err) {
        console.warn('Firestore resetPassword error:', err);
      }
    }
    return { success: true, user: users[idx] };
  },

  // MENUS
  async getMenus() {
    if (isConnected && db) {
      try {
        const snap = await getDocs(collection(db, 'menus'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
      } catch (err) {
        console.warn('Firestore getMenus error, using fallback:', err);
      }
    }
    return getLocalData('menus', initialMockData.menus);
  },

  async updateMenu(menuId, data) {
    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'menus', menuId), data, { merge: true });
      } catch (err) {
        console.error('Firestore updateMenu error:', err);
      }
    }
    const menus = getLocalData('menus', initialMockData.menus);
    const idx = menus.findIndex(m => m.id === menuId);
    if (idx >= 0) {
      menus[idx] = { ...menus[idx], ...data };
      setLocalData('menus', menus);
      return menus[idx];
    }
    return null;
  },

  // ATTENDANCE & OPT-IN / OPT-OUT
  async getAttendance(date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    if (isConnected && db) {
      try {
        const q = query(collection(db, 'attendance'), where('date', '==', targetDate));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
      } catch (err) {
        console.warn('Firestore attendance fetch error:', err);
      }
    }
    const all = getLocalData('attendance', initialMockData.attendance);
    return all.filter(a => a.date === targetDate);
  },

  async setMealOptStatus(studentId, mealType, date, status) {
    // status: 'opted_in' | 'opted_out'
    const student = await this.getUserById(studentId);
    const targetDate = date || new Date().toISOString().split('T')[0];
    const id = `att-${studentId}-${targetDate}-${mealType}`;

    const record = {
      id,
      studentId,
      studentName: student ? student.displayName : 'Student',
      rollNumber: student ? student.rollNumber : 'N/A',
      date: targetDate,
      mealType,
      status, // 'opted_in' or 'opted_out'
      updatedAt: new Date().toISOString()
    };

    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'attendance', id), record, { merge: true });
      } catch (err) {
        console.error('Firestore setMealOptStatus error:', err);
      }
    }

    const attendance = getLocalData('attendance', initialMockData.attendance);
    const idx = attendance.findIndex(a => 
      (a.id === id) || 
      (a.studentId === studentId && a.date === targetDate && a.mealType === mealType)
    );
    if (idx >= 0) {
      attendance[idx] = { ...attendance[idx], ...record };
    } else {
      attendance.push(record);
    }
    setLocalData('attendance', attendance);
    return record;
  },

  async markMealScanned(studentRollOrId, mealType, staffName) {
    let cleanQuery = '';
    let expectedMeal = null;
    let qrDate = null;

    if (typeof studentRollOrId === 'object' && studentRollOrId !== null) {
      cleanQuery = String(studentRollOrId.roll || studentRollOrId.uid || '').trim();
      if (studentRollOrId.meal) expectedMeal = studentRollOrId.meal;
      if (studentRollOrId.date) qrDate = studentRollOrId.date;
    } else {
      cleanQuery = String(studentRollOrId || '').trim();
      // Check if query is JSON string from QR Code
      if (cleanQuery.startsWith('{') && cleanQuery.endsWith('}')) {
        try {
          const parsed = JSON.parse(cleanQuery);
          if (parsed.roll) cleanQuery = parsed.roll;
          else if (parsed.uid) cleanQuery = parsed.uid;
          if (parsed.meal) expectedMeal = parsed.meal;
          if (parsed.date) qrDate = parsed.date;
          // If QR has a bookingToken, use the new booking verification path
          if (parsed.bookingId) {
            return await this.verifyMealBooking(parsed.bookingId, staffName, parsed.meal || mealType);
          }
        } catch (e) {
          // Not valid JSON, keep cleanQuery as is
        }
      }
    }

    const users = await this.getUsers();
    const cleanAlphanumeric = cleanQuery.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Robust student finder: match roll number (exact or alphanumeric), UID, or name
    const student = users.find(u => {
      if (u.uid && u.uid.toLowerCase() === cleanQuery.toLowerCase()) return true;
      if (u.rollNumber) {
        if (u.rollNumber.toLowerCase() === cleanQuery.toLowerCase()) return true;
        if (u.rollNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanAlphanumeric) return true;
      }
      if (u.displayName && u.displayName.toLowerCase() === cleanQuery.toLowerCase()) return true;
      return false;
    });
    
    if (!student) {
      return { success: false, message: `No student found matching "${cleanQuery}"` };
    }

    if (student.role !== 'student') {
      return { success: false, message: `Account found for ${student.displayName} but role is "${student.role}". Only students can claim student meals.` };
    }

    // Check approval status
    if (student.status === 'pending') {
      return {
        success: false,
        pendingApproval: true,
        message: `Account Pending Approval! ${student.displayName} (${student.rollNumber || student.uid}) must be approved by Mess Warden first.`,
        student
      };
    }

    if (student.status === 'rejected') {
      return {
        success: false,
        message: `Account has been rejected by Mess Warden. Entry denied.`,
        student
      };
    }

    const today = new Date().toISOString().split('T')[0];
    if (qrDate && qrDate !== today) {
      return {
        success: false,
        message: `QR Pass Date Mismatch! This pass is dated ${qrDate}, but today is ${today}.`,
        student
      };
    }

    // Prioritize QR code's encoded meal if present, otherwise fallback to staff's selected meal
    const targetMeal = expectedMeal || mealType || 'lunch';
    const id = `att-${student.uid}-${today}-${targetMeal}`;
    const attendance = getLocalData('attendance', initialMockData.attendance);
    const existing = attendance.find(a => 
      (a.studentId === student.uid && a.date === today && a.mealType === targetMeal) ||
      (a.id === id)
    );

    if (existing && existing.status === 'attended') {
      return {
        success: false,
        alreadyScanned: true,
        message: `Already checked in for ${targetMeal.toUpperCase()}! Scanned at ${existing.scannedAt || 'earlier today'} by ${existing.scannedBy || 'Staff'}.`,
        student
      };
    }

    if (existing && existing.status === 'opted_out') {
      return {
        success: false,
        optedOut: true,
        message: `${student.displayName} (${student.rollNumber}) has opted OUT for ${targetMeal.toUpperCase()}.`,
        student
      };
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const record = {
      id,
      studentId: student.uid,
      studentName: student.displayName,
      rollNumber: student.rollNumber,
      roomNumber: student.roomNumber || 'General',
      dietaryPreference: student.dietaryPreference || 'veg',
      date: today,
      mealType: targetMeal,
      status: 'attended',
      scannedAt: nowTime,
      scannedBy: staffName || 'Kitchen Staff'
    };

    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'attendance', id), record, { merge: true });
      } catch (err) {
        console.error('Firestore markMealScanned error:', err);
      }
    }

    const idx = attendance.findIndex(a => 
      (a.id === id) || 
      (a.studentId === student.uid && a.date === today && a.mealType === targetMeal)
    );
    if (idx >= 0) {
      attendance[idx] = { ...attendance[idx], ...record };
    } else {
      attendance.push(record);
    }
    setLocalData('attendance', attendance);

    return {
      success: true,
      message: `Verified & Checked In Successfully! Welcome, ${student.displayName}.`,
      student,
      record
    };
  },

  // ── MEAL BOOKINGS ──────────────────────────────────────────────────────────
  async getMealBookings(studentId, date) {
    const allBookings = getLocalData('mealBookings', initialMockData.mealBookings || []);
    let result = allBookings;
    if (studentId) result = result.filter(b => b.studentId === studentId);
    if (date) result = result.filter(b => b.date === date);
    return result;
  },

  async createMealBooking(bookingData) {
    // bookingData: { studentId, mealType, price, menuData }
    const { studentId, mealType, price } = bookingData;

    // 1. Load student and check wallet
    const users = getLocalData('users', initialMockData.users);
    const sIdx = users.findIndex(u => u.uid === studentId);
    if (sIdx < 0) return { success: false, error: 'Student not found.' };

    const student = users[sIdx];
    const currentBalance = student.walletBalance || 0;

    if (currentBalance < price) {
      return {
        success: false,
        insufficientBalance: true,
        error: `Insufficient wallet balance! You have ₹${currentBalance} but this meal costs ₹${price}. Please add money to your wallet.`,
        balance: currentBalance
      };
    }

    // 2. Check if already booked today for this meal
    const today = new Date().toISOString().split('T')[0];
    const existing = getLocalData('mealBookings', []).find(b =>
      b.studentId === studentId && b.date === today && b.mealType === mealType
    );
    if (existing) {
      return { success: false, error: `You have already booked ${mealType} for today!`, existing };
    }

    // 3. Generate unique booking ID and QR token
    const ts = Date.now();
    const bookingId = `BK-${studentId.split('-').pop()}-${mealType.substring(0, 2).toUpperCase()}-${ts}`;
    const qrToken = `QRT-${studentId}-${mealType}-${today}-${ts}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const booking = {
      id: bookingId,
      studentId,
      studentName: student.displayName,
      rollNumber: student.rollNumber,
      mealType,
      date: today,
      price,
      qrToken,
      status: 'pending',
      bookedAt: new Date().toISOString(),
      verifiedAt: null,
      verifiedBy: null
    };

    // 4. Save booking
    const bookings = getLocalData('mealBookings', []);
    bookings.unshift(booking);
    setLocalData('mealBookings', bookings);

    // 5. Deduct wallet balance & increment amountUsed
    users[sIdx].walletBalance = currentBalance - price;
    users[sIdx].amountUsed = (users[sIdx].amountUsed || 0) + price;
    setLocalData('users', users);

    // 6. Record debit payment transaction
    const txn = {
      id: `TXN-${ts}`,
      studentId,
      type: 'debit',
      amount: price,
      method: 'Meal Booking',
      description: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} booked – ${today}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    const payments = getLocalData('payments', []);
    payments.unshift(txn);
    setLocalData('payments', payments);

    // 7. Mark attendance as opted_in
    await this.setMealOptStatus(studentId, mealType, today, 'opted_in');

    // Update Firestore if connected
    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'mealBookings', bookingId), booking);
        await updateDoc(doc(db, 'users', studentId), {
          walletBalance: users[sIdx].walletBalance,
          amountUsed: users[sIdx].amountUsed
        });
        await setDoc(doc(db, 'payments', txn.id), txn);
      } catch (err) {
        console.warn('Firestore createMealBooking error:', err);
      }
    }

    return { success: true, booking, newBalance: users[sIdx].walletBalance };
  },

  async verifyMealBooking(bookingIdOrToken, staffName, mealType) {
    // Accept booking ID (BK-...) or QR token (QRT-...)
    const bookings = getLocalData('mealBookings', []);
    let bIdx = bookings.findIndex(b => b.id === bookingIdOrToken || b.qrToken === bookingIdOrToken);

    // Fallback: try matching by roll number (for manual roll-number verification)
    if (bIdx < 0) {
      const today = new Date().toISOString().split('T')[0];
      // bookingIdOrToken might be a roll number
      const users = getLocalData('users', initialMockData.users);
      const targetMeal = mealType || 'lunch';
      const student = users.find(u => u.rollNumber && u.rollNumber.toLowerCase() === String(bookingIdOrToken).trim().toLowerCase());
      if (student) {
        bIdx = bookings.findIndex(b =>
          b.studentId === student.uid && b.date === today && b.mealType === targetMeal && b.status === 'pending'
        );
      }
    }

    if (bIdx < 0) {
      return { success: false, message: '⛔ No active pending booking found for this token/roll number.' };
    }

    const booking = bookings[bIdx];

    if (booking.status === 'verified') {
      return {
        success: false,
        alreadyVerified: true,
        message: `⚠️ Booking Already Verified! Verified at ${booking.verifiedAt} by ${booking.verifiedBy}.`,
        booking
      };
    }

    if (booking.status === 'expired') {
      return { success: false, message: '⛔ Invalid or Expired Meal Token.' };
    }

    // Date check
    const today = new Date().toISOString().split('T')[0];
    if (booking.date !== today) {
      return { success: false, message: `⛔ Invalid or Expired Meal Token. This booking was for ${booking.date}.` };
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bookings[bIdx].status = 'verified';
    bookings[bIdx].verifiedAt = nowTime;
    bookings[bIdx].verifiedBy = staffName || 'Kitchen Staff';
    setLocalData('mealBookings', bookings);

    // Auto-mark attendance (no duplicate)
    const attId = `att-${booking.studentId}-${today}-${booking.mealType}`;
    const attendance = getLocalData('attendance', initialMockData.attendance);
    const attExisting = attendance.find(a => a.id === attId || (a.studentId === booking.studentId && a.date === today && a.mealType === booking.mealType));

    if (!attExisting || attExisting.status !== 'attended') {
      const users = getLocalData('users', initialMockData.users);
      const student = users.find(u => u.uid === booking.studentId);
      const attRecord = {
        id: attId,
        studentId: booking.studentId,
        studentName: booking.studentName,
        rollNumber: booking.rollNumber,
        roomNumber: student ? (student.roomNumber || 'General') : 'General',
        dietaryPreference: student ? (student.dietaryPreference || 'veg') : 'veg',
        date: today,
        mealType: booking.mealType,
        status: 'attended',
        scannedAt: nowTime,
        scannedBy: staffName || 'Kitchen Staff'
      };
      const aIdx = attendance.findIndex(a => a.id === attId || (a.studentId === booking.studentId && a.date === today && a.mealType === booking.mealType));
      if (aIdx >= 0) {
        attendance[aIdx] = { ...attendance[aIdx], ...attRecord };
      } else {
        attendance.push(attRecord);
      }
      setLocalData('attendance', attendance);

      if (isConnected && db) {
        try {
          await setDoc(doc(db, 'attendance', attId), attRecord, { merge: true });
        } catch (err) {
          console.warn('Firestore attendance sync error:', err);
        }
      }
    }

    if (isConnected && db) {
      try {
        await updateDoc(doc(db, 'mealBookings', booking.id), {
          status: 'verified',
          verifiedAt: nowTime,
          verifiedBy: staffName || 'Kitchen Staff'
        });
      } catch (err) {
        console.warn('Firestore verifyMealBooking error:', err);
      }
    }

    const studentUsers = getLocalData('users', initialMockData.users);
    const student = studentUsers.find(u => u.uid === booking.studentId);

    return {
      success: true,
      message: `✅ Verified & Checked In Successfully! Welcome, ${booking.studentName}.`,
      booking: bookings[bIdx],
      student: student || { displayName: booking.studentName, rollNumber: booking.rollNumber }
    };
  },

  // Look up pending booking for a student by roll number (for staff manual verify)
  async lookupPendingBooking(rollNumber, mealType) {
    const today = new Date().toISOString().split('T')[0];
    const users = getLocalData('users', initialMockData.users);
    const student = users.find(u =>
      u.rollNumber && u.rollNumber.trim().toLowerCase() === rollNumber.trim().toLowerCase()
    );
    if (!student) return { found: false, error: `No student found with roll number "${rollNumber}".` };

    const bookings = getLocalData('mealBookings', []);
    const booking = bookings.find(b =>
      b.studentId === student.uid &&
      b.date === today &&
      (mealType ? b.mealType === mealType : true) &&
      b.status === 'pending'
    );

    if (!booking) {
      return {
        found: false,
        student,
        error: `No active booking found for this meal. Ask student to book meal via portal.`
      };
    }

    return { found: true, student, booking };
  },

  // ── PAYMENTS ───────────────────────────────────────────────────────────────
  async getPayments(studentId) {
    const all = getLocalData('payments', initialMockData.payments || []);
    if (studentId) return all.filter(p => p.studentId === studentId);
    return all;
  },

  async addPaymentTransaction(paymentData) {
    // paymentData: { studentId, amount, method, description }
    const { studentId, amount, method, description } = paymentData;

    const users = getLocalData('users', initialMockData.users);
    const sIdx = users.findIndex(u => u.uid === studentId);
    if (sIdx < 0) return { success: false, error: 'Student not found.' };

    const ts = Date.now();
    const txn = {
      id: `TXN-${ts}`,
      studentId,
      type: 'credit',
      amount: Number(amount),
      method: method || 'UPI',
      description: description || `Wallet top-up via ${method}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    const payments = getLocalData('payments', []);
    payments.unshift(txn);
    setLocalData('payments', payments);

    // Credit wallet balance
    users[sIdx].walletBalance = (users[sIdx].walletBalance || 0) + Number(amount);
    setLocalData('users', users);

    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'payments', txn.id), txn);
        await updateDoc(doc(db, 'users', studentId), { walletBalance: users[sIdx].walletBalance });
      } catch (err) {
        console.warn('Firestore addPaymentTransaction error:', err);
      }
    }

    return { success: true, transaction: txn, newBalance: users[sIdx].walletBalance };
  },

  // ── MONTHLY ATTENDANCE SUMMARY ─────────────────────────────────────────────
  async getMonthlyAttendance(studentId, yearMonth) {
    // yearMonth: 'YYYY-MM'
    const ym = yearMonth || new Date().toISOString().substring(0, 7);
    const [year, month] = ym.split('-').map(Number);

    // Get all attendance records
    const allAttendance = getLocalData('attendance', initialMockData.attendance);
    const allBookings = getLocalData('mealBookings', []);

    // Build per-day summary for the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${ym}-${String(d).padStart(2, '0')}`;
      const dayAtt = allAttendance.filter(a => a.studentId === studentId && a.date === dateStr);
      const dayBookings = allBookings.filter(b => b.studentId === studentId && b.date === dateStr);
      const verifiedBookings = dayBookings.filter(b => b.status === 'verified');
      const attendedCount = dayAtt.filter(a => a.status === 'attended').length;
      const bookedCount = dayBookings.length;

      dailyMap[dateStr] = {
        date: dateStr,
        attended: attendedCount > 0 || verifiedBookings.length > 0,
        bookedMeals: dayBookings.map(b => b.mealType),
        verifiedMeals: verifiedBookings.map(b => b.mealType),
        attendedMeals: dayAtt.filter(a => a.status === 'attended').map(a => a.mealType)
      };
    }

    const days = Object.values(dailyMap);
    const presentDays = days.filter(d => d.attended).length;
    const today = new Date();
    const isCurrentMonth = (today.getFullYear() === year && today.getMonth() + 1 === month);
    const totalWorkingDays = isCurrentMonth ? today.getDate() : daysInMonth;
    const absentDays = totalWorkingDays - presentDays;
    const attendancePct = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;

    return {
      yearMonth: ym,
      totalWorkingDays,
      presentDays,
      absentDays,
      attendancePct,
      dailyMap
    };
  },

  // LEAVES
  async getLeaves() {
    if (isConnected && db) {
      try {
        const snap = await getDocs(collection(db, 'leaves'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
      } catch (err) {
        console.warn('Firestore leaves error:', err);
      }
    }
    return getLocalData('leaves', initialMockData.leaves);
  },

  async applyLeave(leave) {
    const id = 'leave-' + Date.now();
    const fullLeave = { ...leave, id, status: 'pending', appliedAt: new Date().toISOString().split('T')[0] };

    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'leaves', id), fullLeave);
      } catch (err) {
        console.error('Firestore applyLeave error:', err);
      }
    }

    const leaves = getLocalData('leaves', initialMockData.leaves);
    leaves.unshift(fullLeave);
    setLocalData('leaves', leaves);
    return fullLeave;
  },

  async updateLeaveStatus(leaveId, status) {
    if (isConnected && db) {
      try {
        await updateDoc(doc(db, 'leaves', leaveId), { status });
      } catch (err) {
        console.error('Firestore updateLeaveStatus error:', err);
      }
    }
    const leaves = getLocalData('leaves', initialMockData.leaves);
    const idx = leaves.findIndex(l => l.id === leaveId);
    if (idx >= 0) {
      leaves[idx].status = status;
      setLocalData('leaves', leaves);
      return leaves[idx];
    }
    return null;
  },

  // BILLING
  async getBills() {
    if (isConnected && db) {
      try {
        const snap = await getDocs(collection(db, 'bills'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
      } catch (err) {
        console.warn('Firestore bills error:', err);
      }
    }
    return getLocalData('bills', initialMockData.bills);
  },

  async updateBillStatus(billId, status) {
    if (isConnected && db) {
      try {
        await updateDoc(doc(db, 'bills', billId), { 
          status, 
          paidAt: status === 'paid' ? new Date().toISOString().split('T')[0] : null 
        });
      } catch (err) {
        console.error('Firestore updateBillStatus error:', err);
      }
    }
    const bills = getLocalData('bills', initialMockData.bills);
    const idx = bills.findIndex(b => b.id === billId);
    if (idx >= 0) {
      bills[idx].status = status;
      if (status === 'paid') bills[idx].paidAt = new Date().toISOString().split('T')[0];
      setLocalData('bills', bills);
      return bills[idx];
    }
    return null;
  },

  async generateMonthlyBills(monthName, baseFee, rebateRate) {
    const students = (await this.getUsers()).filter(u => u.role === 'student');
    const leaves = await this.getLeaves();
    const existingBills = await this.getBills();
    const newBills = [];

    for (const student of students) {
      // Calculate approved leave days
      const approvedLeaves = leaves.filter(l => l.studentId === student.uid && l.status === 'approved');
      const totalLeaveDays = approvedLeaves.reduce((acc, curr) => acc + (Number(curr.totalDays) || 0), 0);
      const rebate = totalLeaveDays * (rebateRate || 120);
      const net = Math.max(0, (baseFee || 3200) - rebate);

      const bill = {
        id: `bill-${monthName.replace(/\s+/g, '-').toLowerCase()}-${student.uid}`,
        studentId: student.uid,
        studentName: student.displayName,
        rollNumber: student.rollNumber,
        month: monthName,
        baseFee: baseFee || 3200,
        rebateAmount: rebate,
        extraCharges: 0,
        netPayable: net,
        status: 'unpaid',
        dueDate: '10th ' + monthName
      };

      if (isConnected && db) {
        try {
          await setDoc(doc(db, 'bills', bill.id), bill);
        } catch (e) {
          console.error(e);
        }
      }

      newBills.push(bill);
    }

    const merged = [...newBills, ...existingBills.filter(b => !newBills.some(nb => nb.id === b.id))];
    setLocalData('bills', merged);
    return newBills;
  },

  // FEEDBACK
  async getFeedback() {
    if (isConnected && db) {
      try {
        const snap = await getDocs(collection(db, 'feedback'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
      } catch (err) {
        console.warn('Firestore feedback error:', err);
      }
    }
    return getLocalData('feedback', initialMockData.feedback);
  },

  async submitFeedback(fb) {
    const id = 'fb-' + Date.now();
    const fullFb = { ...fb, id, resolved: false, date: new Date().toISOString().split('T')[0] };

    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'feedback', id), fullFb);
      } catch (err) {
        console.error('Firestore submitFeedback error:', err);
      }
    }

    const list = getLocalData('feedback', initialMockData.feedback);
    list.unshift(fullFb);
    setLocalData('feedback', list);
    return fullFb;
  },

  async replyFeedback(fbId, reply) {
    if (isConnected && db) {
      try {
        await updateDoc(doc(db, 'feedback', fbId), { adminReply: reply, resolved: true });
      } catch (err) {
        console.error('Firestore replyFeedback error:', err);
      }
    }
    const list = getLocalData('feedback', initialMockData.feedback);
    const idx = list.findIndex(f => f.id === fbId);
    if (idx >= 0) {
      list[idx].adminReply = reply;
      list[idx].resolved = true;
      setLocalData('feedback', list);
      return list[idx];
    }
    return null;
  },

  // WASTAGE LOGS
  async getWastageLogs() {
    if (isConnected && db) {
      try {
        const snap = await getDocs(collection(db, 'wastageLogs'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
      } catch (err) {
        console.warn('Firestore wastage error:', err);
      }
    }
    return getLocalData('wastageLogs', initialMockData.wastageLogs);
  },

  async logWastage(data) {
    const id = 'waste-' + Date.now();
    const item = { ...data, id, date: new Date().toISOString().split('T')[0] };

    if (isConnected && db) {
      try {
        await setDoc(doc(db, 'wastageLogs', id), item);
      } catch (err) {
        console.error('Firestore logWastage error:', err);
      }
    }

    const list = getLocalData('wastageLogs', initialMockData.wastageLogs);
    list.unshift(item);
    setLocalData('wastageLogs', list);
    return item;
  },

  async deleteWastageLog(id) {
    if (isConnected && db) {
      try {
        await deleteDoc(doc(db, 'wastageLogs', id));
      } catch (err) {
        console.error('Firestore deleteWastageLog error:', err);
      }
    }
    const list = getLocalData('wastageLogs', initialMockData.wastageLogs).filter(w => w.id !== id);
    setLocalData('wastageLogs', list);
    return true;
  },

  // SEED TO FIRESTORE UTILITY
  async seedFirestoreWithMockData() {
    if (!isConnected || !db) {
      throw new Error('Please configure a valid Firebase Project first before uploading initial data.');
    }
    const batchPromises = [];

    // Seed users
    for (const u of initialMockData.users) {
      batchPromises.push(setDoc(doc(db, 'users', u.uid), u));
    }
    // Seed menus
    for (const m of initialMockData.menus) {
      batchPromises.push(setDoc(doc(db, 'menus', m.id), m));
    }
    // Seed leaves
    for (const l of initialMockData.leaves) {
      batchPromises.push(setDoc(doc(db, 'leaves', l.id), l));
    }
    // Seed bills
    for (const b of initialMockData.bills) {
      batchPromises.push(setDoc(doc(db, 'bills', b.id), b));
    }

    await Promise.all(batchPromises);
    return true;
  }
};
