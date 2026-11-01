// Student Portal Dashboard Logic
import { dbService } from './db.js';

export const studentModule = {
  currentStudent: null,
  activeTab: 'today',
  selectedDay: null,
  selectedMonth: null,   // for attendance tab (YYYY-MM)

  async init(user) {
    this.currentStudent = user;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.selectedDay = days[new Date().getDay()];
    this.selectedMonth = this.selectedMonth || new Date().toISOString().substring(0, 7);
    await this.render();
  },

  async render() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    // Refresh student data from DB in case balance/status changed
    const freshUser = await dbService.getUserById(this.currentStudent.uid);
    if (freshUser) this.currentStudent = freshUser;

    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    // Wallet stats
    const monthlyFee = this.currentStudent.monthlyFee || 3000;
    const walletBalance = this.currentStudent.walletBalance || 0;
    const amountUsed = this.currentStudent.amountUsed || 0;
    const remainingBalance = walletBalance;

    container.innerHTML = `
      <!-- Student Top Profile Banner -->
      <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="inline-flex items-center gap-2 bg-emerald-800/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            Hostel Student Dining Portal
          </div>
          <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <span>Welcome, ${this.currentStudent.displayName}</span>
            <span class="text-xs bg-white/20 font-normal px-2.5 py-1 rounded-full">${this.currentStudent.dietaryPreference ? this.currentStudent.dietaryPreference.toUpperCase() : 'VEG'}</span>
          </h1>
          <p class="text-emerald-100 text-sm mt-1">
            Roll No: <span class="font-semibold text-white">${this.currentStudent.rollNumber || 'N/A'}</span> &bull; 
            Room: <span class="font-semibold text-white">${this.currentStudent.roomNumber || 'General'}</span>
            ${this.currentStudent.classStandard ? ` &bull; <span class="font-semibold text-white">${this.currentStudent.classStandard}</span>` : ''}
          </p>
        </div>

        <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <!-- Live Current Time -->
          <div class="text-left md:text-right pr-3 border-r border-white/20">
            <div class="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Current Time</div>
            <div class="text-xs font-mono font-bold text-white live-clock-text">
              ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • ${new Date().toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div>
            <div class="text-xs text-emerald-200">Wallet Balance</div>
            <div class="text-2xl font-bold text-white" id="student-wallet-display">₹${walletBalance.toLocaleString('en-IN')}</div>
          </div>
          <button id="btn-open-add-money" class="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-3 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5">
            + Add Money
          </button>
          <button id="btn-show-qr-pass" class="bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            Meal Pass QR
          </button>
        </div>
      </div>

      <!-- ── Wallet Financial Summary Cards ── -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div class="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Monthly Fee</div>
          <div class="text-xl font-extrabold text-gray-900">₹${monthlyFee.toLocaleString('en-IN')}</div>
          <div class="text-[11px] text-gray-400 mt-0.5">Standard plan</div>
        </div>
        <div class="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-4">
          <div class="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider mb-1">Wallet Balance</div>
          <div class="text-xl font-extrabold text-emerald-700" id="wallet-balance-card">₹${walletBalance.toLocaleString('en-IN')}</div>
          <div class="text-[11px] text-emerald-500 mt-0.5">Available to spend</div>
        </div>
        <div class="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm p-4">
          <div class="text-[11px] text-amber-600 font-semibold uppercase tracking-wider mb-1">Amount Used</div>
          <div class="text-xl font-extrabold text-amber-700">₹${amountUsed.toLocaleString('en-IN')}</div>
          <div class="text-[11px] text-amber-500 mt-0.5">Meals booked this month</div>
        </div>
        <div class="bg-teal-50 rounded-2xl border border-teal-100 shadow-sm p-4">
          <div class="text-[11px] text-teal-600 font-semibold uppercase tracking-wider mb-1">Remaining</div>
          <div class="text-xl font-extrabold text-teal-700">₹${remainingBalance.toLocaleString('en-IN')}</div>
          <div class="text-[11px] text-teal-500 mt-0.5">Balance left</div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-6">
        <button data-tab="today" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'today' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          🍽️ Book Meals
        </button>
        <button data-tab="weekly" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'weekly' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Weekly Menu
        </button>
        <button data-tab="attendance" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'attendance' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          📅 Attendance
        </button>
        <button data-tab="mealhistory" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'mealhistory' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          🧾 Meal History
        </button>
        <button data-tab="payments" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'payments' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          💳 Payments
        </button>
        <button data-tab="leaves" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'leaves' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Mess Leaves &amp; Rebates
        </button>
        <button data-tab="bills" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'bills' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Bills &amp; Invoices
        </button>
        <button data-tab="feedback" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'feedback' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Food Feedback
        </button>
        <button data-tab="profile" class="tab-btn px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${this.activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          👤 Profile
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="student-tab-body">
        ${await this.renderTabContent()}
      </div>

      <!-- Meal QR Pass Modal Container -->
      <div id="qr-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          <button id="btn-close-qr" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
            ✕
          </button>
          <div class="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            ACTIVE MEAL TOKEN
          </div>
          <h3 class="text-xl font-bold text-gray-900">${this.currentStudent.displayName}</h3>
          <p class="text-xs text-gray-500 mb-3">Roll: <span class="font-bold text-gray-800">${this.currentStudent.rollNumber}</span> &bull; Room: ${this.currentStudent.roomNumber}</p>

          <!-- Meal Selector inside QR Modal -->
          <div class="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl mb-3 text-xs font-semibold" id="qr-meal-selector-bar">
            <button data-qr-meal="breakfast" class="qr-meal-btn py-1.5 rounded-lg transition text-gray-600 hover:bg-white">B'fast</button>
            <button data-qr-meal="lunch" class="qr-meal-btn py-1.5 rounded-lg transition text-gray-600 hover:bg-white">Lunch</button>
            <button data-qr-meal="snacks" class="qr-meal-btn py-1.5 rounded-lg transition text-gray-600 hover:bg-white">Snacks</button>
            <button data-qr-meal="dinner" class="qr-meal-btn py-1.5 rounded-lg transition text-gray-600 hover:bg-white">Dinner</button>
          </div>
          
          <div class="bg-gradient-to-b from-gray-50 to-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center mb-3">
            <div id="qrcode-canvas" class="bg-white p-3 rounded-xl shadow-inner mb-3"></div>
            <p id="qr-meal-slot-label" class="text-sm font-semibold text-emerald-800">Scan at Kitchen Counter</p>
            <p class="text-[11px] text-gray-500 mt-1 font-mono" id="qr-token-id"></p>
          </div>

          <!-- Meal verification status banner (shown after staff verifies) -->
          <div id="qr-verified-banner" class="hidden mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left">
            <div class="font-bold text-emerald-800 text-sm mb-1">🎉 Congratulations! Your meal has been successfully verified.</div>
            <div id="qr-verified-details" class="text-emerald-700"></div>
          </div>

          <button id="btn-copy-qr-token" class="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 mb-2">
            <span>📋 Copy Token / Roll Number</span>
          </button>

          <p class="text-[11px] text-gray-400 leading-relaxed">
            Present this QR code to the kitchen staff scanner or provide your Roll Number at the counter.
          </p>
        </div>
      </div>

      <!-- Meal Booking QR Modal (per-meal unique token) -->
      <div id="booking-qr-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center border border-gray-100">
          <button id="btn-close-booking-qr" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">✕</button>
          <div id="booking-qr-content"></div>
        </div>
      </div>
    `;

    this.attachEvents();
  },

  async renderTabContent() {
    if (this.activeTab === 'today') return await this.renderTodayTab();
    if (this.activeTab === 'weekly') return await this.renderWeeklyTab();
    if (this.activeTab === 'attendance') return await this.renderAttendanceTab();
    if (this.activeTab === 'mealhistory') return await this.renderMealHistoryTab();
    if (this.activeTab === 'payments') return await this.renderPaymentsTab();
    if (this.activeTab === 'leaves') return await this.renderLeavesTab();
    if (this.activeTab === 'bills') return await this.renderBillsTab();
    if (this.activeTab === 'feedback') return await this.renderFeedbackTab();
    if (this.activeTab === 'profile') return await this.renderProfileTab();
    return '';
  },

  // ── TODAY'S MEALS TAB (Book Meals + Wallet Deduction) ─────────────────────
  async renderTodayTab() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayDate = new Date().toISOString().split('T')[0];

    const menus = await dbService.getMenus();
    const todayMenus = menus.filter(m => m.dayOfWeek.toLowerCase() === todayName.toLowerCase());
    const attendanceRecords = await dbService.getAttendance(todayDate);
    const todayBookings = await dbService.getMealBookings(this.currentStudent.uid, todayDate);

    const mealTypes = [
      { key: 'breakfast', name: 'Breakfast', icon: '🍳', defaultTime: '07:30 - 09:30 AM', defaultCutoff: '06:30 AM' },
      { key: 'lunch', name: 'Lunch', icon: '🍲', defaultTime: '12:30 - 02:30 PM', defaultCutoff: '10:00 AM' },
      { key: 'snacks', name: 'Evening Snacks', icon: '☕', defaultTime: '05:00 - 06:30 PM', defaultCutoff: '03:30 PM' },
      { key: 'dinner', name: 'Dinner', icon: '🍛', defaultTime: '07:30 - 09:30 PM', defaultCutoff: '04:00 PM' }
    ];

    let cardsHtml = '';

    for (const meal of mealTypes) {
      const menuData = todayMenus.find(m => m.mealType === meal.key);
      const price = menuData ? menuData.price : { breakfast: 45, lunch: 85, snacks: 35, dinner: 90 }[meal.key];
      const studentAtt = attendanceRecords.find(a => a.studentId === this.currentStudent.uid && a.mealType === meal.key);
      const booking = todayBookings.find(b => b.mealType === meal.key);

      const isAttended = (studentAtt && studentAtt.status === 'attended') || (booking && booking.status === 'verified');
      const isBooked = !!booking;
      const isOptedOut = studentAtt && studentAtt.status === 'opted_out';

      const itemsList = menuData ? menuData.items.map(it => `
        <li class="flex items-center gap-2 text-sm text-gray-700 py-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>${it}</span>
        </li>
      `).join('') : '<li class="text-sm text-gray-400 italic">Menu items to be updated by admin.</li>';

      let statusBadge = '';
      let actionBtn = '';

      if (isAttended) {
        statusBadge = `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">✓ Verified &amp; Attended</span>`;
        actionBtn = `
          <div class="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2.5 rounded-xl text-sm font-semibold text-center">
            🎉 Meal Verified Successfully!
          </div>`;
      } else if (isBooked && booking.status === 'pending') {
        statusBadge = `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">✓ Booked – Pending Verification</span>`;
        actionBtn = `
          <div class="flex gap-2 w-full">
            <button data-action="show-booking-qr" data-booking-id="${booking.id}" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
              📱 Show QR Code
            </button>
            <div class="flex-1 bg-gray-50 border border-gray-200 rounded-xl text-center py-2.5 text-xs font-semibold text-gray-600">
              ₹${price} deducted
            </div>
          </div>`;
      } else if (isOptedOut) {
        statusBadge = `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">✕ Opted Out (Rebate Saved)</span>`;
        actionBtn = `<button data-action="toggle-opt" data-meal="${meal.key}" data-new-status="opted_in" class="w-full py-2.5 rounded-xl text-sm font-semibold transition bg-emerald-600 hover:bg-emerald-700 text-white">Re-join Meal (Opt In)</button>`;
      } else {
        // Not booked yet
        statusBadge = `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">Not Booked</span>`;
        const canAfford = (this.currentStudent.walletBalance || 0) >= price;
        actionBtn = `
          <div class="flex gap-2 w-full">
            <button data-action="book-meal" data-meal="${meal.key}" data-price="${price}"
              class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${canAfford ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}">
              ${canAfford ? `🍽️ Book Meal (₹${price})` : `⚠️ Insufficient Balance`}
            </button>
            <button data-action="toggle-opt" data-meal="${meal.key}" data-new-status="opted_out"
              class="px-3 py-2.5 rounded-xl text-xs font-semibold transition bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">
              Skip
            </button>
          </div>`;
      }

      cardsHtml += `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">${meal.icon}</span>
                <div>
                  <h3 class="font-bold text-gray-900 text-lg">${meal.name}</h3>
                  <p class="text-xs text-gray-500">${menuData ? menuData.timings : meal.defaultTime}</p>
                </div>
              </div>
              <div>${statusBadge}</div>
            </div>

            <div class="text-xs bg-amber-50 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200/60 mb-3 flex items-center justify-between">
              <span>Cutoff time to opt-out:</span>
              <span class="font-bold font-mono">${menuData ? menuData.cutoffTime : meal.defaultCutoff}</span>
            </div>

            <div class="flex items-center justify-between text-sm mb-3">
              <span class="text-gray-500">Meal Price:</span>
              <span class="font-extrabold text-gray-900">₹${price}</span>
            </div>

            <div class="mt-2 mb-4">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Today's Menu:</div>
              <ul class="divide-y divide-gray-50">
                ${itemsList}
              </ul>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 flex items-center gap-2">
            ${actionBtn}
          </div>
        </div>
      `;
    }

    return `
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Today's Meals (${todayName})</h2>
          <p class="text-xs text-gray-500">Book your meals to generate a unique QR code. Wallet balance is deducted on booking.</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${cardsHtml}
      </div>
    `;
  },

  // ── WEEKLY MENU TAB ────────────────────────────────────────────────────────
  async renderWeeklyTab() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menus = await dbService.getMenus();

    const dayBtns = days.map(d => `
      <button data-day="${d}" class="day-btn px-4 py-2 rounded-xl text-sm font-medium transition ${this.selectedDay.toLowerCase() === d.toLowerCase() ? 'bg-emerald-700 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}">
        ${d}
      </button>
    `).join('');

    const currentDayMenus = menus.filter(m => m.dayOfWeek.toLowerCase() === this.selectedDay.toLowerCase());
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];

    let mealsHtml = '';
    for (const mType of meals) {
      const item = currentDayMenus.find(m => m.mealType === mType);
      const title = mType.charAt(0).toUpperCase() + mType.slice(1);

      mealsHtml += `
        <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-800 capitalize text-lg">${title}</h3>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${item && item.dietaryTags.includes('non-veg') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
              ${item && item.dietaryTags.includes('non-veg') ? '🍗 Non-Veg / Veg' : '🥗 Pure Veg'}
            </span>
          </div>
          <p class="text-xs text-gray-500 mb-3 font-medium">Timings: ${item ? item.timings : 'TBD'}</p>
          <ul class="space-y-1.5 text-sm text-gray-700 mb-4">
            ${item ? item.items.map(it => `<li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>${it}</li>`).join('') : '<li class="text-gray-400">Not scheduled yet</li>'}
          </ul>
          <div class="pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span>Cutoff: <b class="text-gray-700">${item ? item.cutoffTime : 'N/A'}</b></span>
            <span class="font-bold text-gray-900">₹${item ? item.price : 0}</span>
          </div>
        </div>
      `;
    }

    return `
      <div>
        <div class="flex flex-wrap gap-2 mb-6">
          ${dayBtns}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${mealsHtml}
        </div>
      </div>
    `;
  },

  // ── MONTHLY ATTENDANCE TAB ─────────────────────────────────────────────────
  async renderAttendanceTab() {
    const ym = this.selectedMonth || new Date().toISOString().substring(0, 7);
    const data = await dbService.getMonthlyAttendance(this.currentStudent.uid, ym);
    const { totalWorkingDays, presentDays, absentDays, attendancePct, dailyMap } = data;

    const [year, month] = ym.split('-').map(Number);
    const monthName = new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    // Build table rows
    let tableRows = '';
    const today = new Date().toISOString().split('T')[0];
    for (let d = 1; d <= new Date(year, month, 0).getDate(); d++) {
      const dateStr = `${ym}-${String(d).padStart(2, '0')}`;
      const dayData = dailyMap[dateStr];
      const dayName = new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' });
      const isFuture = dateStr > today;

      if (isFuture) {
        tableRows += `
          <tr class="opacity-40">
            <td class="p-2.5 font-mono text-xs text-gray-400">${dateStr}</td>
            <td class="p-2.5 text-xs text-gray-400">${dayName}</td>
            <td class="p-2.5"><span class="text-xs text-gray-300">—</span></td>
            <td class="p-2.5 text-xs text-gray-300">—</td>
            <td class="p-2.5 text-xs text-gray-300">—</td>
          </tr>`;
        continue;
      }

      const statusBadge = dayData.attended
        ? `<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Present</span>`
        : `<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800">✗ Absent</span>`;

      tableRows += `
        <tr class="border-t border-gray-50 hover:bg-gray-50/50">
          <td class="p-2.5 font-mono text-xs text-gray-600">${dateStr}</td>
          <td class="p-2.5 text-xs text-gray-600 font-medium">${dayName}</td>
          <td class="p-2.5">${statusBadge}</td>
          <td class="p-2.5 text-xs text-gray-600">${dayData.bookedMeals.length ? dayData.bookedMeals.map(m => `<span class="capitalize bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1">${m}</span>`).join('') : '—'}</td>
          <td class="p-2.5 text-xs text-gray-600">${dayData.verifiedMeals.length ? dayData.verifiedMeals.map(m => `<span class="capitalize bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1">✓ ${m}</span>`).join('') : (dayData.attendedMeals.length ? dayData.attendedMeals.map(m => `<span class="capitalize bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1">✓ ${m}</span>`).join('') : '—')}</td>
        </tr>`;
    }

    return `
      <div class="space-y-5">
        <!-- Month Selector -->
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">Monthly Attendance — ${monthName}</h2>
          <input type="month" id="attendance-month-picker" value="${ym}"
            class="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div class="text-xs text-gray-500 font-semibold mb-1">Working Days</div>
            <div class="text-2xl font-extrabold text-gray-900">${totalWorkingDays}</div>
          </div>
          <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
            <div class="text-xs text-emerald-600 font-semibold mb-1">Present Days</div>
            <div class="text-2xl font-extrabold text-emerald-700">${presentDays}</div>
          </div>
          <div class="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm text-center">
            <div class="text-xs text-rose-600 font-semibold mb-1">Absent Days</div>
            <div class="text-2xl font-extrabold text-rose-700">${absentDays}</div>
          </div>
          <div class="bg-teal-50 p-4 rounded-2xl border border-teal-100 shadow-sm text-center">
            <div class="text-xs text-teal-600 font-semibold mb-1">Attendance %</div>
            <div class="text-2xl font-extrabold text-teal-700">${attendancePct}%</div>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th class="p-2.5">Date</th>
                  <th class="p-2.5">Day</th>
                  <th class="p-2.5">Status</th>
                  <th class="p-2.5">Meals Booked</th>
                  <th class="p-2.5">Meals Verified</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ── MEAL HISTORY TAB ───────────────────────────────────────────────────────
  async renderMealHistoryTab() {
    const bookings = await dbService.getMealBookings(this.currentStudent.uid);

    const mealIcons = { breakfast: '🍳', lunch: '🍲', snacks: '☕', dinner: '🍛' };

    const rows = bookings.length ? bookings.map(b => {
      const statusBadge = b.status === 'verified'
        ? `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">✓ Verified</span>`
        : b.status === 'expired'
        ? `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-500">Expired</span>`
        : `<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">⏳ Pending</span>`;

      return `
        <tr class="border-t border-gray-50 hover:bg-gray-50/50">
          <td class="p-3 font-mono text-xs text-gray-600">${b.id}</td>
          <td class="p-3 font-mono text-xs text-gray-600">${b.date}</td>
          <td class="p-3 font-semibold capitalize">${mealIcons[b.mealType] || ''} ${b.mealType}</td>
          <td class="p-3 font-bold text-gray-900">₹${b.price}</td>
          <td class="p-3">${statusBadge}</td>
          <td class="p-3 text-xs text-gray-500">${b.status === 'verified' ? `${b.verifiedAt} by ${b.verifiedBy}` : b.bookedAt ? new Date(b.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
        </tr>`;
    }).join('') : `<tr><td colspan="6" class="p-6 text-center text-gray-400">No meal bookings yet. Book your first meal from the "Book Meals" tab!</td></tr>`;

    return `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-gray-100">
          <h3 class="font-bold text-gray-900 text-lg">Meal Booking History</h3>
          <p class="text-xs text-gray-500 mt-0.5">All your meal bookings with booking IDs and verification status.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th class="p-3">Booking ID</th>
                <th class="p-3">Date</th>
                <th class="p-3">Meal</th>
                <th class="p-3">Price</th>
                <th class="p-3">Status</th>
                <th class="p-3">Verified At</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ── PAYMENTS TAB ───────────────────────────────────────────────────────────
  async renderPaymentsTab() {
    const payments = await dbService.getPayments(this.currentStudent.uid);

    const rows = payments.length ? payments.map(p => {
      const isCredit = p.type === 'credit';
      const typeBadge = isCredit
        ? `<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">+ Credit</span>`
        : `<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800">- Debit</span>`;

      return `
        <tr class="border-t border-gray-50 hover:bg-gray-50/50">
          <td class="p-3 font-mono text-xs text-gray-600">${p.id}</td>
          <td class="p-3 text-xs text-gray-600">${p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
          <td class="p-3">${typeBadge}</td>
          <td class="p-3 font-bold ${isCredit ? 'text-emerald-700' : 'text-rose-600'}">${isCredit ? '+' : '-'}₹${p.amount}</td>
          <td class="p-3 text-xs text-gray-600">${p.method}</td>
          <td class="p-3 text-xs text-gray-600">${p.description}</td>
          <td class="p-3"><span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ ${p.status}</span></td>
        </tr>`;
    }).join('') : `<tr><td colspan="7" class="p-6 text-center text-gray-400">No transactions yet.</td></tr>`;

    return `
      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Payments &amp; Transactions</h2>
            <p class="text-xs text-gray-500">Wallet top-ups, meal bookings, and payment history.</p>
          </div>
          <button id="btn-open-add-money-tab" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow transition flex items-center gap-2">
            + Add Money
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th class="p-3">Transaction ID</th>
                  <th class="p-3">Date &amp; Time</th>
                  <th class="p-3">Type</th>
                  <th class="p-3">Amount</th>
                  <th class="p-3">Method</th>
                  <th class="p-3">Description</th>
                  <th class="p-3">Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ── LEAVES TAB ─────────────────────────────────────────────────────────────
  async renderLeavesTab() {
    const leaves = await dbService.getLeaves();
    const myLeaves = leaves.filter(l => l.studentId === this.currentStudent.uid);

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Leave Form -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-gray-900 text-lg mb-2">Apply for Mess Leave</h3>
          <p class="text-xs text-gray-500 mb-4">Taking leaves for 3 or more consecutive days qualifies you for a mess fee rebate (₹120/day) in your next bill.</p>
          
          <form id="leave-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
              <input type="date" id="leave-start" required class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
              <input type="date" id="leave-end" required class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Reason for Leave</label>
              <textarea id="leave-reason" rows="3" required placeholder="e.g. Traveling home for festival / medical" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
            </div>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow transition">
              Submit Leave Request
            </button>
          </form>
        </div>

        <!-- Leave History -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-gray-900 text-lg mb-4">Your Leave History &amp; Rebates</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th class="p-3">Dates</th>
                  <th class="p-3">Duration</th>
                  <th class="p-3">Reason</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Rebate (₹)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${myLeaves.length ? myLeaves.map(l => {
                  let badge = 'bg-amber-100 text-amber-800';
                  if (l.status === 'approved') badge = 'bg-emerald-100 text-emerald-800';
                  if (l.status === 'rejected') badge = 'bg-rose-100 text-rose-800';
                  const rebateAmt = l.status === 'approved' ? (l.totalDays || 0) * 120 : 0;
                  return `
                    <tr>
                      <td class="p-3 font-medium text-gray-800">${l.startDate} to ${l.endDate}</td>
                      <td class="p-3 text-gray-600">${l.totalDays || '—'} days</td>
                      <td class="p-3 text-gray-600">${l.reason}</td>
                      <td class="p-3"><span class="px-2.5 py-1 text-xs font-bold rounded-full uppercase ${badge}">${l.status}</span></td>
                      <td class="p-3 font-semibold text-emerald-700">₹${rebateAmt}</td>
                    </tr>
                  `;
                }).join('') : '<tr><td colspan="5" class="p-4 text-center text-gray-400">No leave requests submitted yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ── BILLS TAB ──────────────────────────────────────────────────────────────
  async renderBillsTab() {
    const bills = await dbService.getBills();
    const myBills = bills.filter(b => b.studentId === this.currentStudent.uid);

    return `
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div class="text-xs text-gray-500 font-semibold mb-1">Standard Monthly Base Fee</div>
            <div class="text-2xl font-bold text-gray-900">₹3,200</div>
            <p class="text-xs text-gray-400 mt-1">Includes 4 meals/day</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div class="text-xs text-gray-500 font-semibold mb-1">Available Mess Credits / Rebates</div>
            <div class="text-2xl font-bold text-emerald-600">₹720</div>
            <p class="text-xs text-gray-400 mt-1">6 days approved leave deducted</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div class="text-xs text-gray-500 font-semibold mb-1">Prepaid Wallet Balance</div>
            <div class="text-2xl font-bold text-teal-700">₹${this.currentStudent.walletBalance || 0}</div>
            <p class="text-xs text-gray-400 mt-1">Used for guest meals &amp; canteen extras</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-gray-900 text-lg mb-4">Monthly Mess Invoices</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th class="p-3">Month</th>
                  <th class="p-3">Base Fee</th>
                  <th class="p-3">Rebates</th>
                  <th class="p-3">Extras</th>
                  <th class="p-3">Net Payable</th>
                  <th class="p-3">Due Date</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${myBills.length ? myBills.map(b => `
                  <tr>
                    <td class="p-3 font-bold text-gray-800">${b.month}</td>
                    <td class="p-3 text-gray-600">₹${b.baseFee}</td>
                    <td class="p-3 text-emerald-600 font-semibold">-₹${b.rebateAmount}</td>
                    <td class="p-3 text-gray-600">+₹${b.extraCharges}</td>
                    <td class="p-3 font-bold text-gray-900">₹${b.netPayable}</td>
                    <td class="p-3 text-gray-500 text-xs">${b.dueDate}</td>
                    <td class="p-3">
                      <span class="px-2.5 py-1 text-xs font-bold rounded-full uppercase ${b.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                        ${b.status}
                      </span>
                    </td>
                    <td class="p-3">
                      ${b.status === 'unpaid' ? `
                        <button data-action="pay-bill" data-bill-id="${b.id}" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-sm transition">
                          Pay Now
                        </button>
                      ` : `
                        <span class="text-xs text-gray-400 font-semibold">Receipt Paid</span>
                      `}
                    </td>
                  </tr>
                `).join('') : '<tr><td colspan="8" class="p-4 text-center text-gray-400">No bills generated yet.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // ── FEEDBACK TAB ───────────────────────────────────────────────────────────
  async renderFeedbackTab() {
    const feedbackList = await dbService.getFeedback();
    const myFeedback = feedbackList.filter(f => f.studentId === this.currentStudent.uid);

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Form -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-gray-900 text-lg mb-2">Rate Food &amp; Quality</h3>
          <p class="text-xs text-gray-500 mb-4">Your ratings help our mess warden and head chef improve meal taste and cleanliness.</p>
          
          <form id="feedback-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Select Meal</label>
              <select id="fb-meal" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="breakfast">Breakfast</option>
                <option value="snacks">Evening Snacks</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Rating (1 to 5 Stars)</label>
              <div class="flex gap-3 text-2xl cursor-pointer" id="star-selector">
                <span data-star="1" class="text-amber-400">★</span>
                <span data-star="2" class="text-amber-400">★</span>
                <span data-star="3" class="text-amber-400">★</span>
                <span data-star="4" class="text-amber-400">★</span>
                <span data-star="5" class="text-amber-400">★</span>
              </div>
              <input type="hidden" id="fb-rating" value="5">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Your Comments or Suggestions</label>
              <textarea id="fb-comment" rows="3" required placeholder="Tell us about food taste, temperature, quantity, or hygiene..." class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
            </div>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow transition">
              Submit Review
            </button>
          </form>
        </div>

        <!-- Review History -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-gray-900 text-lg mb-4">Your Recent Reviews</h3>
          <div class="space-y-4">
            ${myFeedback.length ? myFeedback.map(f => `
              <div class="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-800 capitalize text-sm">${f.mealType}</span>
                    <span class="text-amber-400 font-bold">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
                  </div>
                  <span class="text-xs text-gray-400">${f.date}</span>
                </div>
                <p class="text-sm text-gray-700">${f.comment}</p>
                ${f.adminReply ? `
                  <div class="mt-3 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                    <span class="font-bold">Mess Warden Reply:</span> ${f.adminReply}
                  </div>
                ` : `
                  <div class="mt-2 text-[11px] text-gray-400">Pending review by mess committee</div>
                `}
              </div>
            `).join('') : '<p class="text-gray-400 text-sm">You haven\'t submitted any feedback yet.</p>'}
          </div>
        </div>
      </div>
    `;
  },

  // ── PROFILE TAB (Change Password) ─────────────────────────────────────────
  async renderProfileTab() {
    const u = this.currentStudent;
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Info -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-gray-900 text-lg mb-4">Your Profile</h3>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500 font-medium">Name</span>
              <span class="font-semibold text-gray-900">${u.displayName}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500 font-medium">Email</span>
              <span class="font-semibold text-gray-900">${u.email}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500 font-medium">Roll Number</span>
              <span class="font-mono font-semibold text-gray-900">${u.rollNumber || 'N/A'}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500 font-medium">Room Number</span>
              <span class="font-semibold text-gray-900">${u.roomNumber || 'General'}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500 font-medium">Class / Program</span>
              <span class="font-semibold text-gray-900">${u.classStandard || '—'}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500 font-medium">Dietary Preference</span>
              <span class="font-semibold text-gray-900 capitalize">${u.dietaryPreference || 'Veg'}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-50 text-sm">
              <span class="text-gray-500 font-medium">Phone</span>
              <span class="font-semibold text-gray-900">${u.phone || '—'}</span>
            </div>
            <div class="flex justify-between py-2 text-sm">
              <span class="text-gray-500 font-medium">Member Since</span>
              <span class="font-semibold text-gray-900">${u.joinedDate || '—'}</span>
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-gray-900 text-lg mb-2">Change Password</h3>
          <p class="text-xs text-gray-500 mb-4">Update your account password. You'll need your current password to confirm.</p>

          <div id="change-pw-alert" class="hidden mb-3 p-3 rounded-xl text-xs font-medium border"></div>

          <form id="change-password-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
              <input type="password" id="current-password" required placeholder="••••••••"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
              <input type="password" id="new-password" required placeholder="••••••••" minlength="6"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" id="confirm-password" required placeholder="••••••••" minlength="6"
                class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            </div>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm shadow transition">
              Update Password
            </button>
          </form>
        </div>
      </div>
    `;
  },

  // ── EVENT ATTACHMENT ───────────────────────────────────────────────────────
  attachEvents() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.activeTab = tab;
        await this.render();
      });
    });

    // Day switching in weekly tab
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        this.selectedDay = e.currentTarget.dataset.day;
        await this.render();
      });
    });

    // Attendance month picker
    const monthPicker = document.getElementById('attendance-month-picker');
    if (monthPicker) {
      monthPicker.addEventListener('change', async (e) => {
        this.selectedMonth = e.target.value;
        await this.render();
      });
    }

    // Book Meal buttons
    document.querySelectorAll('[data-action="book-meal"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const meal = e.currentTarget.dataset.meal;
        const price = parseInt(e.currentTarget.dataset.price, 10);
        if (!confirm(`Book ${meal.charAt(0).toUpperCase() + meal.slice(1)} for ₹${price}? This will deduct from your wallet.`)) return;

        btn.disabled = true;
        btn.textContent = 'Booking...';
        const res = await dbService.createMealBooking({
          studentId: this.currentStudent.uid,
          mealType: meal,
          price
        });

        if (res.success) {
          // Refresh student data
          const freshUser = await dbService.getUserById(this.currentStudent.uid);
          if (freshUser) this.currentStudent = freshUser;
          // Show booking QR immediately
          this.showBookingQR(res.booking);
          await this.render();
        } else {
          alert(res.error || 'Booking failed.');
          btn.disabled = false;
        }
      });
    });

    // Show booking QR button (from card)
    document.querySelectorAll('[data-action="show-booking-qr"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const bookingId = e.currentTarget.dataset.bookingId;
        const bookings = await dbService.getMealBookings(this.currentStudent.uid);
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) this.showBookingQR(booking);
      });
    });

    // Opt-in / Opt-out toggle
    document.querySelectorAll('[data-action="toggle-opt"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const meal = e.currentTarget.dataset.meal;
        const newStatus = e.currentTarget.dataset.newStatus;
        await dbService.setMealOptStatus(this.currentStudent.uid, meal, null, newStatus);
        await this.render();
      });
    });

    // Pay bill
    document.querySelectorAll('[data-action="pay-bill"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const billId = e.currentTarget.dataset.billId;
        if (confirm('Confirm payment for this month\'s mess invoice?')) {
          await dbService.updateBillStatus(billId, 'paid');
          alert('Payment successful! Receipt generated.');
          await this.render();
        }
      });
    });

    // Open Add Money modal from top bar button
    const addMoneyTopBtn = document.getElementById('btn-open-add-money');
    if (addMoneyTopBtn) {
      addMoneyTopBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-add-money-modal', { detail: { student: this.currentStudent } }));
      });
    }

    // Open Add Money modal from Payments tab button
    const addMoneyTabBtn = document.getElementById('btn-open-add-money-tab');
    if (addMoneyTabBtn) {
      addMoneyTabBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-add-money-modal', { detail: { student: this.currentStudent } }));
      });
    }

    // QR Modal open (general pass QR)
    const qrBtn = document.getElementById('btn-show-qr-pass');
    const qrModal = document.getElementById('qr-modal');
    const qrClose = document.getElementById('btn-close-qr');

    if (qrBtn && qrModal) {
      qrBtn.addEventListener('click', () => {
        this.openQrModal();
      });
    }

    if (qrClose && qrModal) {
      qrClose.addEventListener('click', () => {
        qrModal.classList.add('hidden');
      });
    }

    // Close booking QR modal
    const bqrClose = document.getElementById('btn-close-booking-qr');
    if (bqrClose) {
      bqrClose.addEventListener('click', () => {
        const m = document.getElementById('booking-qr-modal');
        if (m) m.classList.add('hidden');
      });
    }

    // Leave Form submit
    const leaveForm = document.getElementById('leave-form');
    if (leaveForm) {
      leaveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const start = document.getElementById('leave-start').value;
        const end = document.getElementById('leave-end').value;
        const reason = document.getElementById('leave-reason').value;

        const diffTime = Math.abs(new Date(end) - new Date(start));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays < 1) {
          alert('End date must be after start date.');
          return;
        }

        await dbService.applyLeave({
          studentId: this.currentStudent.uid,
          studentName: this.currentStudent.displayName,
          rollNumber: this.currentStudent.rollNumber,
          startDate: start,
          endDate: end,
          totalDays: diffDays,
          reason
        });

        alert(`Leave request for ${diffDays} day(s) submitted successfully!`);
        await this.render();
      });
    }

    // Feedback Form submit & Star selection
    const fbForm = document.getElementById('feedback-form');
    if (fbForm) {
      const starContainer = document.getElementById('star-selector');
      if (starContainer) {
        starContainer.addEventListener('click', (e) => {
          if (e.target.dataset.star) {
            const val = parseInt(e.target.dataset.star, 10);
            document.getElementById('fb-rating').value = val;
            Array.from(starContainer.children).forEach((starEl, idx) => {
              starEl.classList.toggle('text-amber-400', idx < val);
              starEl.classList.toggle('text-gray-300', idx >= val);
            });
          }
        });
      }

      fbForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const meal = document.getElementById('fb-meal').value;
        const rating = parseInt(document.getElementById('fb-rating').value, 10);
        const comment = document.getElementById('fb-comment').value;

        await dbService.submitFeedback({
          studentId: this.currentStudent.uid,
          studentName: this.currentStudent.displayName,
          rollNumber: this.currentStudent.rollNumber,
          mealType: meal,
          rating,
          comment
        });

        alert('Thank you for rating today\'s meal!');
        await this.render();
      });
    }

    // Change Password form
    const changePwForm = document.getElementById('change-password-form');
    if (changePwForm) {
      changePwForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPw = document.getElementById('current-password').value;
        const newPw = document.getElementById('new-password').value;
        const confirmPw = document.getElementById('confirm-password').value;
        const alertEl = document.getElementById('change-pw-alert');

        const showAlert = (msg, ok) => {
          alertEl.classList.remove('hidden', 'bg-emerald-50', 'border-emerald-200', 'text-emerald-900', 'bg-rose-50', 'border-rose-200', 'text-rose-900');
          alertEl.classList.add(ok ? 'bg-emerald-50' : 'bg-rose-50', ok ? 'border-emerald-200' : 'border-rose-200', ok ? 'text-emerald-900' : 'text-rose-900');
          alertEl.textContent = msg;
        };

        if (currentPw !== (this.currentStudent.password || '')) {
          showAlert('Current password is incorrect.', false);
          return;
        }
        if (newPw !== confirmPw) {
          showAlert('New passwords do not match.', false);
          return;
        }
        if (newPw.length < 6) {
          showAlert('Password must be at least 6 characters.', false);
          return;
        }

        const res = await dbService.resetPassword(this.currentStudent.email, newPw);
        if (res.success) {
          this.currentStudent.password = newPw;
          showAlert('✅ Password updated successfully!', true);
          changePwForm.reset();
        } else {
          showAlert(res.error || 'Password update failed.', false);
        }
      });
    }
  },

  // ── BOOKING QR MODAL (unique per booking) ────────────────────────────────
  async showBookingQR(booking) {
    const modal = document.getElementById('booking-qr-modal');
    const content = document.getElementById('booking-qr-content');
    if (!modal || !content) return;

    // Check if verified
    const isVerified = booking.status === 'verified';
    const mealLabel = booking.mealType.charAt(0).toUpperCase() + booking.mealType.slice(1);

    content.innerHTML = `
      <div class="inline-flex items-center gap-2 ${isVerified ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'} text-xs font-bold px-3 py-1 rounded-full mb-3">
        <span class="w-2 h-2 rounded-full ${isVerified ? 'bg-blue-500' : 'bg-emerald-500 animate-ping'}"></span>
        ${isVerified ? 'MEAL VERIFIED' : 'ACTIVE BOOKING TOKEN'}
      </div>
      <h3 class="text-xl font-bold text-gray-900">${booking.studentName}</h3>
      <p class="text-xs text-gray-500 mb-1">Roll: <b>${booking.rollNumber}</b></p>
      <p class="text-xs text-gray-500 mb-3">Booking ID: <b class="font-mono">${booking.id}</b></p>

      ${isVerified ? `
        <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-3 text-left">
          <div class="font-bold text-emerald-800 text-base mb-1">🎉 Congratulations! Your meal has been successfully verified.</div>
          <div class="text-xs text-emerald-700 space-y-1">
            <div><b>Meal:</b> ${mealLabel}</div>
            <div><b>Date:</b> ${booking.date}</div>
            <div><b>Price:</b> ₹${booking.price}</div>
            <div><b>Verified at:</b> ${booking.verifiedAt} by ${booking.verifiedBy}</div>
          </div>
        </div>
      ` : `
        <div class="bg-gradient-to-b from-gray-50 to-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center mb-3">
          <div id="booking-qrcode-canvas" class="bg-white p-3 rounded-xl shadow-inner mb-2"></div>
          <p class="text-sm font-bold text-emerald-800">${mealLabel} — ${booking.date}</p>
          <p class="text-[11px] text-gray-500 font-mono mt-1">₹${booking.price} | ${booking.id}</p>
        </div>
      `}

      <div class="text-xs text-gray-400 mt-2">Show this QR to kitchen staff for verification.</div>
    `;

    modal.classList.remove('hidden');

    // Generate QR for pending bookings
    if (!isVerified) {
      const qrContainer = document.getElementById('booking-qrcode-canvas');
      if (qrContainer && window.QRCode) {
        const tokenPayload = JSON.stringify({
          bookingId: booking.id,
          qrToken: booking.qrToken,
          roll: booking.rollNumber,
          uid: booking.studentId,
          meal: booking.mealType,
          date: booking.date,
          ts: Date.now()
        });
        new window.QRCode(qrContainer, {
          text: tokenPayload,
          width: 180,
          height: 180,
          colorDark: '#047857',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H
        });
      }
    }

    // Auto-check if booking just got verified (poll once)
    if (!isVerified) {
      setTimeout(async () => {
        const freshBookings = await dbService.getMealBookings(this.currentStudent.uid);
        const freshBooking = freshBookings.find(b => b.id === booking.id);
        if (freshBooking && freshBooking.status === 'verified') {
          this.showBookingQR(freshBooking);
        }
      }, 3000);
    }
  },

  openQrModal(preferredMeal) {
    const modal = document.getElementById('qr-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const currentHour = new Date().getHours();
    let currentMeal = preferredMeal;
    if (!currentMeal) {
      if (currentHour < 10) currentMeal = 'breakfast';
      else if (currentHour < 15) currentMeal = 'lunch';
      else if (currentHour < 18) currentMeal = 'snacks';
      else currentMeal = 'dinner';
    }

    const renderMealQr = async (meal) => {
      const qrContainer = document.getElementById('qrcode-canvas');
      if (!qrContainer) return;
      qrContainer.innerHTML = '';

      // Update button highlights
      document.querySelectorAll('.qr-meal-btn').forEach(btn => {
        const isSelected = btn.dataset.qrMeal === meal;
        btn.className = `qr-meal-btn py-1.5 rounded-lg transition font-bold ${
          isSelected 
            ? 'bg-emerald-600 text-white shadow-xs' 
            : 'text-gray-600 hover:bg-white'
        }`;
      });

      const todayDate = new Date().toISOString().split('T')[0];

      // Check for verified booking for this meal
      const bookings = await dbService.getMealBookings(this.currentStudent.uid, todayDate);
      const booking = bookings.find(b => b.mealType === meal);

      const verifiedBanner = document.getElementById('qr-verified-banner');
      const verifiedDetails = document.getElementById('qr-verified-details');

      if (booking && booking.status === 'verified' && verifiedBanner && verifiedDetails) {
        verifiedBanner.classList.remove('hidden');
        verifiedDetails.innerHTML = `
          <b>Meal:</b> ${meal.charAt(0).toUpperCase() + meal.slice(1)} &bull;
          <b>Date:</b> ${booking.date} &bull;
          <b>Price:</b> ₹${booking.price} &bull;
          <b>Verified at:</b> ${booking.verifiedAt}`;
      } else if (verifiedBanner) {
        verifiedBanner.classList.add('hidden');
      }

      const tokenPayload = booking ? JSON.stringify({
        bookingId: booking.id,
        qrToken: booking.qrToken,
        roll: this.currentStudent.rollNumber,
        uid: this.currentStudent.uid,
        meal: meal,
        date: todayDate,
        ts: Date.now()
      }) : JSON.stringify({
        roll: this.currentStudent.rollNumber,
        uid: this.currentStudent.uid,
        name: this.currentStudent.displayName,
        meal: meal,
        date: todayDate,
        ts: Date.now()
      });

      const labelEl = document.getElementById('qr-meal-slot-label');
      if (labelEl) labelEl.innerText = `Token: ${meal.toUpperCase()} (${new Date().toLocaleDateString()})`;

      const idEl = document.getElementById('qr-token-id');
      if (idEl) idEl.innerText = booking ? `Booking ID: ${booking.id}` : `Pass ID: ${this.currentStudent.rollNumber} • ${meal.toUpperCase()}`;

      if (window.QRCode) {
        new window.QRCode(qrContainer, {
          text: tokenPayload,
          width: 180,
          height: 180,
          colorDark: '#047857',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H
        });
      } else {
        qrContainer.innerHTML = `<div class="p-6 text-xs text-gray-700 font-mono">Roll: ${this.currentStudent.rollNumber}<br>${meal.toUpperCase()}</div>`;
      }

      // Copy token / roll button
      const copyBtn = document.getElementById('btn-copy-qr-token');
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(this.currentStudent.rollNumber);
          const orig = copyBtn.innerHTML;
          copyBtn.innerHTML = '<span>✅ Roll Number Copied (' + this.currentStudent.rollNumber + ')</span>';
          setTimeout(() => { copyBtn.innerHTML = orig; }, 1800);
        };
      }
    };

    renderMealQr(currentMeal);

    // Attach meal selector buttons inside modal
    document.querySelectorAll('.qr-meal-btn').forEach(btn => {
      btn.onclick = (e) => {
        const chosenMeal = e.currentTarget.dataset.qrMeal;
        renderMealQr(chosenMeal);
      };
    });
  }
};
