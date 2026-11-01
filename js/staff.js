// Mess Staff & Kitchen Operations Portal Logic
import { dbService } from './db.js';

export const staffModule = {
  currentStaff: null,
  activeMeal: 'lunch',
  scannerInstance: null,
  isProcessingScan: false,

  async init(user) {
    this.currentStaff = user;
    // Set default active meal based on time of day
    const hour = new Date().getHours();
    if (hour < 10) this.activeMeal = 'breakfast';
    else if (hour < 15) this.activeMeal = 'lunch';
    else if (hour < 18) this.activeMeal = 'snacks';
    else this.activeMeal = 'dinner';

    await this.render();
  },

  async render() {
    // If scanner was running from previous view, stop it cleanly
    if (this.scannerInstance) {
      await this.stopQrCamera();
    }

    const container = document.getElementById('dashboard-content');
    if (!container) return;

    const todayDate = new Date().toISOString().split('T')[0];
    const users = await dbService.getUsers();
    const students = users.filter(u => u.role === 'student');
    const attendance = await dbService.getAttendance(todayDate);

    // Calculate Headcount for active meal
    const mealAtt = attendance.filter(a => a.mealType === this.activeMeal);
    const optedOutCount = mealAtt.filter(a => a.status === 'opted_out').length;
    const attendedCount = mealAtt.filter(a => a.status === 'attended').length;
    // Those not explicitly opted out are expected
    const totalStudents = students.length;
    const expectedEaters = totalStudents - optedOutCount;

    // Veg / Non-Veg breakdown of expected students
    const optedOutStudentIds = new Set(mealAtt.filter(a => a.status === 'opted_out').map(a => a.studentId));
    const activeEaters = students.filter(s => !optedOutStudentIds.has(s.uid));
    const vegCount = activeEaters.filter(s => s.dietaryPreference !== 'non-veg').length;
    const nonVegCount = activeEaters.filter(s => s.dietaryPreference === 'non-veg').length;

    const wastageLogs = await dbService.getWastageLogs();

    container.innerHTML = `
      <!-- Staff Top Banner -->
      <div class="bg-gradient-to-r from-amber-600 to-orange-700 rounded-2xl p-6 text-white shadow-lg mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="inline-flex items-center gap-2 bg-amber-800/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <span class="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
            Kitchen Staff & Counter Station
          </div>
          <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <span>${this.currentStaff.displayName}</span>
            <span class="text-xs bg-white/20 px-3 py-1 rounded-full font-normal">Mess Kitchen A</span>
          </h1>
          <p class="text-amber-100 text-sm mt-1">
            Real-time Headcount Forecast & QR Meal Scanner Terminal
          </p>
        </div>

        <!-- Meal Selector -->
        <div class="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
          <span class="text-xs text-amber-100 font-semibold px-2">Active Meal:</span>
          <select id="staff-meal-selector" class="bg-white text-gray-800 font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer">
            <option value="breakfast" ${this.activeMeal === 'breakfast' ? 'selected' : ''}>Breakfast (07:30 - 09:30)</option>
            <option value="lunch" ${this.activeMeal === 'lunch' ? 'selected' : ''}>Lunch (12:30 - 02:30)</option>
            <option value="snacks" ${this.activeMeal === 'snacks' ? 'selected' : ''}>Snacks (05:00 - 06:30)</option>
            <option value="dinner" ${this.activeMeal === 'dinner' ? 'selected' : ''}>Dinner (07:30 - 09:30)</option>
          </select>
        </div>
      </div>

      <!-- Live Headcount Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Expected Headcount</div>
          <div id="stat-expected-count" class="text-3xl font-extrabold text-gray-900">${expectedEaters} <span class="text-xs text-gray-500 font-normal">/ ${totalStudents} students</span></div>
          <div class="mt-2 text-xs text-emerald-600 font-medium">Cooking target for this meal</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Plates Checked In</div>
          <div id="stat-attended-count" class="text-3xl font-extrabold text-blue-600">${attendedCount} <span class="text-xs text-gray-500 font-normal">served</span></div>
          <div id="stat-remaining-count" class="mt-2 text-xs text-gray-500 font-medium">${expectedEaters - attendedCount} remaining to dine</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Dietary Split</div>
          <div id="stat-diet-split" class="flex items-center gap-3 text-lg font-bold text-gray-800 mt-1">
            <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-sm font-semibold">🥦 Veg: ${vegCount}</span>
            <span class="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg text-sm font-semibold">🍗 Non-Veg: ${nonVegCount}</span>
          </div>
          <div class="mt-2 text-xs text-gray-400">Based on opted-in profiles</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Skipped / Opted Out</div>
          <div id="stat-optedout-count" class="text-3xl font-extrabold text-amber-600">${optedOutCount}</div>
          <div class="mt-2 text-xs text-amber-700 font-medium">Food wastage saved!</div>
        </div>
      </div>

      <!-- Main Counter Grid: Scanner on Left, Serving & Wastage on Right -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: QR Code Scanner & Manual Check-In -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-gray-900 text-lg">Meal Scanner & Roll Entry</h3>
                <p class="text-xs text-gray-500">Scan student QR code or type student roll number to validate entry</p>
              </div>
              <span id="staff-active-meal-badge" class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
                ${this.activeMeal}
              </span>
            </div>

            <!-- Scan Alert Box -->
            <div id="scan-alert-box" class="hidden mb-4 p-4 rounded-xl text-sm font-medium border animate-in fade-in duration-150"></div>

            <!-- Camera Scanner Placeholder & Controls -->
            <div class="bg-gray-900 rounded-2xl p-4 text-white text-center mb-5 relative overflow-hidden">
              <div id="scanner-reader" class="mx-auto max-w-sm rounded-xl overflow-hidden min-h-[160px] flex flex-col items-center justify-center">
                <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                <p class="text-xs text-gray-300">Ready to scan student meal pass tokens</p>
              </div>
              <div class="flex flex-wrap justify-center gap-2 mt-3">
                <button id="btn-toggle-camera" class="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  <span>Start Camera Scanner</span>
                </button>
                <label for="qr-image-upload" class="bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span>Upload QR Image</span>
                </label>
                <input type="file" id="qr-image-upload" accept="image/*" class="hidden">
              </div>
            </div>

            <!-- Manual Roll Number Check-In Form (QR JSON or Roll) -->
            <div class="mb-3">
              <div class="text-xs font-semibold text-gray-700 mb-1">Quick QR Scan / Manual Entry</div>
              <form id="manual-checkin-form" class="flex gap-2">
                <input type="text" id="manual-roll-input" placeholder="Paste QR JSON or Roll Number to check in immediately" required
                  class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium">
                <button type="submit" class="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition">
                  Check In
                </button>
              </form>
            </div>

            <!-- Manual Roll Number Verify with Confirm step -->
            <div class="border border-dashed border-amber-200 rounded-xl p-4 bg-amber-50/30">
              <div class="text-xs font-semibold text-amber-800 mb-2">🔍 Manual Roll Number Verification</div>
              <p class="text-[11px] text-amber-700 mb-3">Lookup student by roll number, preview details, then confirm &amp; verify meal.</p>
              <div class="flex gap-2 mb-3">
                <input type="text" id="manual-roll-lookup-input" placeholder="Enter Roll Number e.g. CS2024-042"
                  class="flex-1 border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium bg-white">
                <button id="btn-lookup-roll" type="button" class="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition">
                  Lookup
                </button>
              </div>
              <!-- Student preview card (shown after lookup) -->
              <div id="roll-lookup-result" class="hidden"></div>
            </div>

            <div class="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
              <span>Quick test rolls:</span>
              <button type="button" class="quick-roll-btn font-mono bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded">CS2024-042</button>
              <button type="button" class="quick-roll-btn font-mono bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded">EC2024-019</button>
              <button type="button" class="quick-roll-btn font-mono bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded">ME2024-088</button>
            </div>
          </div>

          <!-- Recently Served Students Table -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 class="font-bold text-gray-900 text-lg mb-3">Recently Checked-In Students</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold">
                  <tr>
                    <th class="p-2.5">Time</th>
                    <th class="p-2.5">Student Name</th>
                    <th class="p-2.5">Roll No</th>
                    <th class="p-2.5">Diet</th>
                    <th class="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody id="recent-served-tbody" class="divide-y divide-gray-100">
                  ${mealAtt.filter(a => a.status === 'attended').length ? mealAtt.filter(a => a.status === 'attended').slice(-5).reverse().map(a => {
                    const st = students.find(s => s.uid === a.studentId);
                    return `
                      <tr>
                        <td class="p-2.5 font-mono text-xs text-gray-500">${a.scannedAt || 'Just now'}</td>
                        <td class="p-2.5 font-bold text-gray-800">${a.studentName}</td>
                        <td class="p-2.5 font-mono text-xs text-gray-600">${a.rollNumber}</td>
                        <td class="p-2.5">
                          <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold ${st && st.dietaryPreference === 'non-veg' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                            ${st ? (st.dietaryPreference || 'VEG').toUpperCase() : 'VEG'}
                          </span>
                        </td>
                        <td class="p-2.5"><span class="text-xs font-bold text-emerald-700">✓ Served</span></td>
                      </tr>
                    `;
                  }).join('') : '<tr><td colspan="5" class="p-4 text-center text-gray-400">No students scanned for this meal yet.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Wastage Logger & Food Status -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Food Serving Status Card -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 class="font-bold text-gray-900 text-lg mb-2">Kitchen Food Status</h3>
            <p class="text-xs text-gray-500 mb-4">Broadcast hot food readiness to student notification board</p>

            <div class="space-y-2">
              <button data-status="cooking" class="status-btn w-full p-3 rounded-xl border text-left font-medium text-sm flex items-center justify-between hover:bg-gray-50 transition border-amber-300 bg-amber-50 text-amber-900">
                <span class="flex items-center gap-2">👨‍🍳 <b>Cooking In Progress</b></span>
                <span class="text-xs">Preparing meals</span>
              </button>
              <button data-status="ready" class="status-btn w-full p-3 rounded-xl border text-left font-medium text-sm flex items-center justify-between hover:bg-gray-50 transition border-gray-200 text-gray-700">
                <span class="flex items-center gap-2">🍽️ <b>Food Hot & Ready (Serving)</b></span>
                <span class="text-xs">Counter Open</span>
              </button>
              <button data-status="closed" class="status-btn w-full p-3 rounded-xl border text-left font-medium text-sm flex items-center justify-between hover:bg-gray-50 transition border-gray-200 text-gray-700">
                <span class="flex items-center gap-2">🔒 <b>Meal Service Closed</b></span>
                <span class="text-xs">Counter Finished</span>
              </button>
            </div>
          </div>

          <!-- Log Food Wastage -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 class="font-bold text-gray-900 text-lg mb-2">Log Meal Leftovers / Wastage</h3>
            <p class="text-xs text-gray-500 mb-4">Record unconsumed food after the meal counter closes to train the AI demand forecast.</p>

            <form id="wastage-form" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Leftover Amount (kg)</label>
                <input type="number" step="0.1" id="waste-kg" required placeholder="e.g. 3.5" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Notes / Main Leftover Items</label>
                <textarea id="waste-notes" rows="2" placeholder="e.g. Extra rice and dal remain, salad consumed fully" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"></textarea>
              </div>
              <button type="submit" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow transition">
                Record Wastage Log
              </button>
            </form>
          </div>

          <!-- Recent Wastage History -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 class="font-bold text-gray-900 text-sm mb-3">Recent Wastage Logs</h4>
            <div class="space-y-3">
              ${wastageLogs.slice(0, 3).map(w => `
                <div class="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div class="flex justify-between font-bold text-gray-800 mb-1">
                    <span class="capitalize">${w.mealType} &bull; ${w.date}</span>
                    <span class="text-rose-600 font-extrabold">${w.leftoverKg} kg</span>
                  </div>
                  <p class="text-gray-500">${w.notes || 'No notes'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  },

  attachEvents() {
    // Meal selector change
    const mealSelect = document.getElementById('staff-meal-selector');
    if (mealSelect) {
      mealSelect.addEventListener('change', async (e) => {
        await this.stopQrCamera();
        this.activeMeal = e.target.value;
        await this.render();
      });
    }

    // Manual checkin form submit
    const manualForm = document.getElementById('manual-checkin-form');
    if (manualForm) {
      manualForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputEl = document.getElementById('manual-roll-input');
        const roll = inputEl.value.trim();
        await this.handleCheckIn(roll);
        inputEl.value = '';
      });
    }

    // Quick roll buttons
    document.querySelectorAll('.quick-roll-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const inputEl = document.getElementById('manual-roll-input');
        if (inputEl) inputEl.value = e.target.innerText;
        // Also fill the lookup input
        const lookupEl = document.getElementById('manual-roll-lookup-input');
        if (lookupEl) lookupEl.value = e.target.innerText;
      });
    });

    // Manual Roll Lookup (preview + confirm verify)
    const lookupBtn = document.getElementById('btn-lookup-roll');
    if (lookupBtn) {
      lookupBtn.addEventListener('click', async () => {
        const rollInput = document.getElementById('manual-roll-lookup-input');
        const resultBox = document.getElementById('roll-lookup-result');
        if (!rollInput || !resultBox) return;

        const roll = rollInput.value.trim();
        if (!roll) return;

        lookupBtn.textContent = 'Looking up...';
        lookupBtn.disabled = true;

        const res = await dbService.lookupPendingBooking(roll, this.activeMeal);

        lookupBtn.textContent = 'Lookup';
        lookupBtn.disabled = false;
        resultBox.classList.remove('hidden');

        if (!res.found) {
          resultBox.innerHTML = `
            <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              <b>⛔ ${res.error}</b>
              ${res.student ? `<div class="mt-1 font-mono text-rose-700">${res.student.displayName} (${res.student.rollNumber})</div>` : ''}
            </div>`;
          return;
        }

        const { student, booking } = res;
        const dietBadge = student.dietaryPreference === 'non-veg'
          ? 'bg-rose-100 text-rose-800'
          : 'bg-emerald-100 text-emerald-800';

        resultBox.innerHTML = `
          <div class="p-4 rounded-xl bg-white border border-emerald-200 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div>
                <div class="font-bold text-gray-900 text-base">${student.displayName}</div>
                <div class="text-xs font-mono text-gray-500">${student.rollNumber} &bull; Room: ${student.roomNumber || 'General'}</div>
              </div>
              <span class="text-[11px] font-bold px-2 py-1 rounded-full ${dietBadge}">${(student.dietaryPreference || 'veg').toUpperCase()}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs mb-3">
              <div class="bg-gray-50 rounded-lg p-2 text-center">
                <div class="text-gray-400 font-semibold">Meal</div>
                <div class="font-bold text-gray-900 capitalize">${booking.mealType}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-2 text-center">
                <div class="text-gray-400 font-semibold">Price</div>
                <div class="font-bold text-gray-900">₹${booking.price}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-2 text-center">
                <div class="text-gray-400 font-semibold">Booking ID</div>
                <div class="font-bold text-gray-700 text-[10px] font-mono truncate">${booking.id}</div>
              </div>
            </div>
            <button id="btn-confirm-verify-meal" data-booking-id="${booking.id}" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm shadow transition">
              ✅ Confirm &amp; Verify Meal
            </button>
          </div>`;

        // Attach confirm button
        const confirmBtn = document.getElementById('btn-confirm-verify-meal');
        if (confirmBtn) {
          confirmBtn.addEventListener('click', async () => {
            confirmBtn.textContent = 'Verifying...';
            confirmBtn.disabled = true;
            const vRes = await dbService.verifyMealBooking(booking.id, this.currentStaff.displayName, booking.mealType);
            if (vRes.success) {
              resultBox.innerHTML = `
                <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <b>✅ ${vRes.message}</b>
                  <div class="mt-1 text-emerald-700">${student.displayName} (${student.rollNumber}) — ${booking.mealType.toUpperCase()} verified successfully.</div>
                </div>`;
              this.playBeep(true);
              await this.updateStatsAndTable();
              rollInput.value = '';
            } else {
              resultBox.innerHTML = `
                <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <b>⚠️ ${vRes.message}</b>
                </div>`;
              this.playBeep(false);
            }
          });
        }
      });
    }

    // Camera scanner toggle
    const toggleCamBtn = document.getElementById('btn-toggle-camera');
    if (toggleCamBtn) {
      toggleCamBtn.addEventListener('click', () => {
        this.startQrCamera();
      });
    }

    // QR Image Upload file listener
    const fileInput = document.getElementById('qr-image-upload');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
          await this.handleFileScan(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    // Food serving status buttons
    document.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.status-btn').forEach(b => {
          b.className = 'status-btn w-full p-3 rounded-xl border text-left font-medium text-sm flex items-center justify-between hover:bg-gray-50 transition border-gray-200 text-gray-700';
        });
        const clicked = e.currentTarget;
        clicked.className = 'status-btn w-full p-3 rounded-xl border text-left font-medium text-sm flex items-center justify-between hover:bg-gray-50 transition border-emerald-300 bg-emerald-50 text-emerald-900';
        alert(`Status updated: ${clicked.innerText.trim()}`);
      });
    });

    // Wastage Form
    const wasteForm = document.getElementById('wastage-form');
    if (wasteForm) {
      wasteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const kg = parseFloat(document.getElementById('waste-kg').value);
        const notes = document.getElementById('waste-notes').value;

        await dbService.logWastage({
          mealType: this.activeMeal,
          leftoverKg: kg,
          notes,
          loggedBy: this.currentStaff.displayName
        });

        alert('Wastage logged successfully!');
        await this.render();
      });
    }
  },

  async handleCheckIn(inputData) {
    let targetMeal = this.activeMeal;

    if (typeof inputData === 'string' && inputData.trim().startsWith('{') && inputData.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(inputData.trim());
        if (parsed.meal) targetMeal = parsed.meal;
      } catch (e) {}
    } else if (typeof inputData === 'object' && inputData !== null && inputData.meal) {
      targetMeal = inputData.meal;
    }

    const res = await dbService.markMealScanned(inputData, targetMeal, this.currentStaff.displayName);
    const alertBox = document.getElementById('scan-alert-box');
    if (!alertBox) return;

    alertBox.classList.remove('hidden', 'bg-emerald-50', 'border-emerald-200', 'text-emerald-900', 'bg-rose-50', 'border-rose-200', 'text-rose-900', 'bg-amber-50', 'border-amber-200', 'text-amber-900', 'bg-blue-50', 'border-blue-200', 'text-blue-900');

    if (res.success) {
      const verifiedMeal = (res.record && res.record.mealType) ? res.record.mealType : targetMeal;
      alertBox.classList.add('bg-emerald-50', 'border-emerald-200', 'text-emerald-900');
      alertBox.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-3xl">✅</span>
          <div class="flex-1">
            <div class="font-bold text-base text-emerald-950">${res.message}</div>
            <div class="text-xs text-emerald-800 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span><b>Meal:</b> <span class="uppercase font-bold">${verifiedMeal}</span></span>
              <span><b>Roll:</b> ${res.student.rollNumber || res.student.uid}</span>
              <span><b>Room:</b> ${res.student.roomNumber || 'General'}</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${res.student.dietaryPreference === 'non-veg' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                ${(res.student.dietaryPreference || 'VEG').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      `;
      this.playBeep(true);

      // Auto-sync staff active meal dropdown if meal scanned was for another meal
      if (verifiedMeal !== this.activeMeal) {
        this.activeMeal = verifiedMeal;
        const selector = document.getElementById('staff-meal-selector');
        if (selector) selector.value = this.activeMeal;
      }

      // Update live counter badges and recent served table in-place (without destroying the camera!)
      await this.updateStatsAndTable();

    } else if (res.alreadyScanned) {
      alertBox.classList.add('bg-amber-50', 'border-amber-200', 'text-amber-900');
      alertBox.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-3xl">⚠️</span>
          <div>
            <div class="font-bold text-base text-amber-950">ALREADY CHECKED IN!</div>
            <div class="text-xs text-amber-800">${res.message}</div>
            ${res.student ? `<div class="text-[11px] text-amber-700 mt-1 font-mono">Student: ${res.student.displayName} (${res.student.rollNumber})</div>` : ''}
          </div>
        </div>
      `;
      this.playBeep(false);
    } else {
      alertBox.classList.add('bg-rose-50', 'border-rose-200', 'text-rose-900');
      alertBox.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-3xl">⛔</span>
          <div>
            <div class="font-bold text-base text-rose-950">ENTRY DENIED</div>
            <div class="text-xs text-rose-800">${res.message}</div>
          </div>
        </div>
      `;
      this.playBeep(false);
    }
  },

  async updateStatsAndTable() {
    const todayDate = new Date().toISOString().split('T')[0];
    const users = await dbService.getUsers();
    const students = users.filter(u => u.role === 'student');
    const attendance = await dbService.getAttendance(todayDate);

    const mealAtt = attendance.filter(a => a.mealType === this.activeMeal);
    const optedOutCount = mealAtt.filter(a => a.status === 'opted_out').length;
    const attendedCount = mealAtt.filter(a => a.status === 'attended').length;
    const totalStudents = students.length;
    const expectedEaters = totalStudents - optedOutCount;

    const optedOutStudentIds = new Set(mealAtt.filter(a => a.status === 'opted_out').map(a => a.studentId));
    const activeEaters = students.filter(s => !optedOutStudentIds.has(s.uid));
    const vegCount = activeEaters.filter(s => s.dietaryPreference !== 'non-veg').length;
    const nonVegCount = activeEaters.filter(s => s.dietaryPreference === 'non-veg').length;

    const elExpected = document.getElementById('stat-expected-count');
    if (elExpected) elExpected.innerHTML = `${expectedEaters} <span class="text-xs text-gray-500 font-normal">/ ${totalStudents} students</span>`;

    const elAttended = document.getElementById('stat-attended-count');
    if (elAttended) elAttended.innerHTML = `${attendedCount} <span class="text-xs text-gray-500 font-normal">served</span>`;

    const elRemaining = document.getElementById('stat-remaining-count');
    if (elRemaining) elRemaining.innerText = `${expectedEaters - attendedCount} remaining to dine`;

    const elDiet = document.getElementById('stat-diet-split');
    if (elDiet) {
      elDiet.innerHTML = `
        <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-sm font-semibold">🥦 Veg: ${vegCount}</span>
        <span class="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg text-sm font-semibold">🍗 Non-Veg: ${nonVegCount}</span>
      `;
    }

    const elOptedOut = document.getElementById('stat-optedout-count');
    if (elOptedOut) elOptedOut.innerText = optedOutCount;

    const elBadge = document.getElementById('staff-active-meal-badge');
    if (elBadge) elBadge.innerText = this.activeMeal;

    const tbody = document.getElementById('recent-served-tbody');
    if (tbody) {
      const attendedList = mealAtt.filter(a => a.status === 'attended');
      if (attendedList.length > 0) {
        tbody.innerHTML = attendedList.slice(-5).reverse().map(a => {
          const st = students.find(s => s.uid === a.studentId);
          return `
            <tr class="animate-in fade-in duration-300">
              <td class="p-2.5 font-mono text-xs text-gray-500">${a.scannedAt || 'Just now'}</td>
              <td class="p-2.5 font-bold text-gray-800">${a.studentName}</td>
              <td class="p-2.5 font-mono text-xs text-gray-600">${a.rollNumber}</td>
              <td class="p-2.5">
                <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold ${st && st.dietaryPreference === 'non-veg' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                  ${st ? (st.dietaryPreference || 'VEG').toUpperCase() : 'VEG'}
                </span>
              </td>
              <td class="p-2.5"><span class="text-xs font-bold text-emerald-700">✓ Served</span></td>
            </tr>
          `;
        }).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-400">No students scanned for this meal yet.</td></tr>';
      }
    }
  },

  async startQrCamera() {
    const readerEl = document.getElementById('scanner-reader');
    const toggleBtn = document.getElementById('btn-toggle-camera');
    if (!readerEl) return;

    if (!window.Html5Qrcode) {
      alert('QR camera scanner library is still loading. Please wait a moment or use manual Roll Number entry.');
      return;
    }

    // If scanner is already active, toggle it off
    if (this.scannerInstance) {
      await this.stopQrCamera();
      return;
    }

    readerEl.innerHTML = `
      <div class="flex flex-col items-center justify-center p-4">
        <div class="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p class="text-xs text-amber-300 font-medium">Starting camera...</p>
      </div>
    `;

    try {
      const html5QrCode = new window.Html5Qrcode('scanner-reader');
      this.scannerInstance = html5QrCode;

      const onScanSuccess = async (decodedText) => {
        // Cooldown lock prevents multi-frame double check-ins
        if (this.isProcessingScan) return;
        this.isProcessingScan = true;

        try {
          await this.handleCheckIn(decodedText);
        } catch (err) {
          console.error('Scan check-in error:', err);
        } finally {
          setTimeout(() => {
            this.isProcessingScan = false;
          }, 2500);
        }
      };

      const onScanError = (errorMessage) => {
        // Frame parse errors are normal while searching for QR
      };

      const scanConfig = { 
        fps: 10, 
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.75);
          return { width: Math.max(qrboxSize, 180), height: Math.max(qrboxSize, 180) };
        }
      };

      let started = false;

      // Strategy 1: Detect available video devices via getCameras()
      try {
        const devices = await window.Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const backCam = devices.find(d => 
            d.label && (
              d.label.toLowerCase().includes('back') || 
              d.label.toLowerCase().includes('rear') || 
              d.label.toLowerCase().includes('environment')
            )
          );
          const chosenId = backCam ? backCam.id : devices[0].id;
          await html5QrCode.start(chosenId, scanConfig, onScanSuccess, onScanError);
          started = true;
        }
      } catch (camErr) {
        console.warn('getCameras() failed, trying constraint fallback:', camErr);
      }

      // Strategy 2: Fallback to facingMode 'environment' then 'user'
      if (!started) {
        try {
          await html5QrCode.start({ facingMode: 'environment' }, scanConfig, onScanSuccess, onScanError);
          started = true;
        } catch (envErr) {
          console.warn('facingMode environment failed, trying user camera constraint:', envErr);
          await html5QrCode.start({ facingMode: 'user' }, scanConfig, onScanSuccess, onScanError);
          started = true;
        }
      }

      if (toggleBtn) {
        toggleBtn.className = 'bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow';
        toggleBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
          <span>Stop Camera Scanner</span>
        `;
      }
    } catch (err) {
      console.error('Camera startup failed:', err);
      this.scannerInstance = null;
      readerEl.innerHTML = `
        <div class="p-4 text-center">
          <svg class="w-10 h-10 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <p class="text-xs text-amber-300 font-bold mb-1">Camera Access Notice</p>
          <p class="text-[11px] text-gray-300 mb-2">No camera detected or permission denied. You can scan by uploading a QR image below or typing the roll number.</p>
        </div>
      `;
      if (toggleBtn) {
        toggleBtn.className = 'bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow';
        toggleBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <span>Retry Camera Scanner</span>
        `;
      }
    }
  },

  async stopQrCamera() {
    const readerEl = document.getElementById('scanner-reader');
    const toggleBtn = document.getElementById('btn-toggle-camera');

    if (this.scannerInstance) {
      try {
        if (this.scannerInstance.isScanning) {
          await this.scannerInstance.stop();
        }
        this.scannerInstance.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      this.scannerInstance = null;
    }

    if (readerEl) {
      readerEl.innerHTML = `
        <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
        <p class="text-xs text-gray-300">Ready to scan student meal pass tokens</p>
      `;
    }

    if (toggleBtn) {
      toggleBtn.className = 'bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow';
      toggleBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        <span>Start Camera Scanner</span>
      `;
    }
  },

  async handleFileScan(file) {
    if (!file) return;
    if (!window.Html5Qrcode) {
      alert('QR scanner library is loading. Please try again in a moment.');
      return;
    }

    const alertBox = document.getElementById('scan-alert-box');
    if (alertBox) {
      alertBox.classList.remove('hidden', 'bg-emerald-50', 'border-emerald-200', 'text-emerald-900', 'bg-rose-50', 'border-rose-200', 'text-rose-900', 'bg-amber-50', 'border-amber-200', 'text-amber-900');
      alertBox.classList.add('bg-blue-50', 'border-blue-200', 'text-blue-900');
      alertBox.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Decoding QR code image (${file.name})...</span>
        </div>
      `;
    }

    try {
      // Create dedicated scanner element or use container
      let tempDiv = document.getElementById('qr-temp-file-scanner');
      if (!tempDiv) {
        tempDiv = document.createElement('div');
        tempDiv.id = 'qr-temp-file-scanner';
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
      }

      const fileScanner = new window.Html5Qrcode('qr-temp-file-scanner');
      const decodedText = await fileScanner.scanFile(file, false);
      try { fileScanner.clear(); } catch (e) {}

      await this.handleCheckIn(decodedText);
    } catch (err) {
      console.error('File scan failed:', err);
      if (alertBox) {
        alertBox.classList.remove('hidden', 'bg-blue-50', 'border-blue-200', 'text-blue-900');
        alertBox.classList.add('bg-rose-50', 'border-rose-200', 'text-rose-900');
        alertBox.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚠️</span>
            <div>
              <div class="font-bold text-sm">No QR Code Found in Image</div>
              <div class="text-xs text-rose-800">Could not read a valid QR code from this image. Please upload a clear screenshot or photo of the Meal Pass QR.</div>
            </div>
          </div>
        `;
      }
      this.playBeep(false);
    }
  },

  playBeep(success) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = success ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(success ? 880 : 300, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // AudioContext not available, safe to ignore
    }
  }
};
