// Admin Portal Logic (Mess Warden / Administrator)
import { dbService } from './db.js';
import { isConnected } from './firebase-config.js';

export const adminModule = {
  currentAdmin: null,
  activeTab: 'overview',
  editingMenuId: null,

  async init(user) {
    this.currentAdmin = user;
    await this.render();
  },

  async render() {
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    const users = await dbService.getUsers();
    const students = users.filter(u => u.role === 'student');
    const leaves = await dbService.getLeaves();
    const pendingLeaves = leaves.filter(l => l.status === 'pending');
    const bills = await dbService.getBills();
    const unpaidBills = bills.filter(b => b.status === 'unpaid');
    const feedbackList = await dbService.getFeedback();
    const unrepliedFb = feedbackList.filter(f => !f.resolved);

    container.innerHTML = `
      <!-- Admin Top Banner -->
      <div class="bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="inline-flex items-center gap-2 bg-indigo-900/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Hostel Mess Administration Center
          </div>
          <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <span>Welcome, ${this.currentAdmin.displayName}</span>
            <span class="text-xs bg-white/20 px-3 py-1 rounded-full font-normal">Warden / System Admin</span>
          </h1>
          <p class="text-indigo-200 text-sm mt-1">
            Complete institutional control over student admissions, kitchen operations, menus & finances
          </p>
        </div>

        <!-- Live Clock Display -->
        <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 shadow-inner">
          <div class="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-lg">
            🕒
          </div>
          <div>
            <div class="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Current Time</div>
            <div class="text-sm font-bold font-mono text-white live-clock-text">
              ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • ${new Date().toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Enrolled Students</div>
          <div class="text-3xl font-extrabold text-gray-900">${students.filter(s => s.status === 'active').length}</div>
          <div class="mt-2 text-xs text-indigo-600 font-medium">${users.length} total system accounts</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border ${students.filter(s => s.status === 'pending').length ? 'border-amber-200 bg-amber-50/40' : 'border-gray-100'} shadow-sm">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pending Student Approvals</div>
          <div class="text-3xl font-extrabold text-amber-600">${students.filter(s => s.status === 'pending').length}</div>
          <div class="mt-2 text-xs text-amber-700 font-medium">New registrations awaiting review</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Pending Leave Requests</div>
          <div class="text-3xl font-extrabold text-purple-600">${pendingLeaves.length}</div>
          <div class="mt-2 text-xs text-gray-500 font-medium">Requiring rebate approval</div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Unpaid Mess Invoices</div>
          <div class="text-3xl font-extrabold text-rose-600">${unpaidBills.length}</div>
          <div class="mt-2 text-xs text-gray-500 font-medium">Pending collection</div>
        </div>
      </div>

      <!-- Admin Navigation Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-6">
        <button data-tab="overview" class="admin-tab-btn px-4 py-2 rounded-lg font-medium text-sm transition ${this.activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Overview & Quick Actions
        </button>
        <button data-tab="users" class="admin-tab-btn px-4 py-2 rounded-lg font-medium text-sm transition ${this.activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Users & Roles (${users.length})
        </button>
        <button data-tab="menu" class="admin-tab-btn px-4 py-2 rounded-lg font-medium text-sm transition ${this.activeTab === 'menu' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Weekly Menu Scheduler
        </button>
        <button data-tab="leaves" class="admin-tab-btn px-4 py-2 rounded-lg font-medium text-sm transition ${this.activeTab === 'leaves' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Leave Approvals (${pendingLeaves.length})
        </button>
        <button data-tab="billing" class="admin-tab-btn px-4 py-2 rounded-lg font-medium text-sm transition ${this.activeTab === 'billing' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Billing & Invoices
        </button>
        <button data-tab="feedback" class="admin-tab-btn px-4 py-2 rounded-lg font-medium text-sm transition ${this.activeTab === 'feedback' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}">
          Grievances & Reviews
        </button>
      </div>

      <!-- Tab Content -->
      <div id="admin-tab-body">
        ${await this.renderTabContent()}
      </div>
    `;

    this.attachEvents();
  },

  async renderTabContent() {
    if (this.activeTab === 'overview') return await this.renderOverviewTab();
    if (this.activeTab === 'users') return await this.renderUsersTab();
    if (this.activeTab === 'menu') return await this.renderMenuTab();
    if (this.activeTab === 'leaves') return await this.renderLeavesTab();
    if (this.activeTab === 'billing') return await this.renderBillingTab();
    if (this.activeTab === 'feedback') return await this.renderFeedbackTab();
    return '';
  },

  async renderOverviewTab() {
    const today = new Date().toISOString().split('T')[0];
    const users = await dbService.getUsers();
    const pendingStudents = users.filter(u => u.role === 'student' && u.status === 'pending');
    const attendance = await dbService.getAttendance(today);
    const attended = attendance.filter(a => a.status === 'attended');
    const optedOut = attendance.filter(a => a.status === 'opted_out');

    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Quick Operations -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 class="font-bold text-gray-900 text-lg mb-2">Today's Meal Consumption Overview</h3>
            <p class="text-xs text-gray-500 mb-6">Real-time attendance logs for all 4 mess meal windows today</p>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="text-xs text-gray-500 font-semibold">Breakfast</div>
                <div class="text-2xl font-bold text-gray-800 my-1">${attendance.filter(a => a.mealType === 'breakfast' && a.status === 'attended').length}</div>
                <div class="text-[11px] text-gray-400">Scanned</div>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="text-xs text-gray-500 font-semibold">Lunch</div>
                <div class="text-2xl font-bold text-emerald-600 my-1">${attendance.filter(a => a.mealType === 'lunch' && a.status === 'attended').length}</div>
                <div class="text-[11px] text-gray-400">Scanned</div>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="text-xs text-gray-500 font-semibold">Snacks</div>
                <div class="text-2xl font-bold text-gray-800 my-1">${attendance.filter(a => a.mealType === 'snacks' && a.status === 'attended').length}</div>
                <div class="text-[11px] text-gray-400">Scanned</div>
              </div>
              <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div class="text-xs text-gray-500 font-semibold">Dinner</div>
                <div class="text-2xl font-bold text-gray-800 my-1">${attendance.filter(a => a.mealType === 'dinner' && a.status === 'attended').length}</div>
                <div class="text-[11px] text-gray-400">Scanned</div>
              </div>
            </div>

            <div class="mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <h4 class="font-bold text-indigo-950 text-sm">Automated Rebate Engine</h4>
                <p class="text-xs text-indigo-800">${optedOut.length} meals opted out today. Rebates will be deducted automatically from monthly billing.</p>
              </div>
              <span class="text-xl font-bold text-indigo-900">₹${optedOut.length * 40} saved</span>
            </div>
          </div>

          <!-- Quick Actions Bar -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 class="font-bold text-gray-900 text-lg mb-4">Warden Quick Actions</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button id="btn-quick-bill-gen" class="p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left transition font-semibold text-sm">
                <div class="text-lg mb-1">📑</div>
                <div>Generate Monthly Bills</div>
                <div class="text-[11px] font-normal text-emerald-700 mt-0.5">Calculate rebates & dues</div>
              </button>
              <button id="btn-quick-add-user" class="p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-left transition font-semibold text-sm">
                <div class="text-lg mb-1">👤</div>
                <div>Register New Member</div>
                <div class="text-[11px] font-normal text-indigo-700 mt-0.5">Add student or staff</div>
              </button>
              <button id="btn-quick-manage-users" class="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-left transition font-semibold text-sm">
                <div class="text-lg mb-1">📋</div>
                <div>Pending Approvals (${pendingStudents.length})</div>
                <div class="text-[11px] font-normal text-purple-700 mt-0.5">Review student applicants</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Pending Approvals & Institutional Policies -->
        <div class="space-y-6">
          <!-- Pending Student Approvals Card -->
          <div class="bg-white p-6 rounded-2xl border ${pendingStudents.length ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-100'} shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-gray-900 text-base flex items-center gap-2">
                <span>🎓 Pending Student Approvals</span>
                ${pendingStudents.length ? `<span class="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">${pendingStudents.length} Pending</span>` : ''}
              </h3>
            </div>
            
            ${pendingStudents.length === 0 ? `
              <div class="text-center py-6 text-gray-400">
                <div class="text-2xl mb-1">✅</div>
                <p class="text-xs font-semibold text-gray-600">All student registrations approved</p>
                <p class="text-[11px] text-gray-400 mt-0.5">New applications will appear here for verification</p>
              </div>
            ` : `
              <p class="text-xs text-gray-500 mb-3">Review student identity before activating mess dining access:</p>
              <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
                ${pendingStudents.map(s => `
                  <div class="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
                    <div class="flex justify-between items-start">
                      <div class="font-bold text-gray-900">${s.displayName}</div>
                      <span class="text-[10px] uppercase font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">Pending</span>
                    </div>
                    <div class="text-gray-600 font-mono text-[11px]">Roll: ${s.rollNumber || 'N/A'} &bull; Room: ${s.roomNumber || 'N/A'}</div>
                    <div class="text-gray-500 text-[11px]">${s.email}</div>
                    <div class="pt-2 flex gap-2">
                      <button data-action="approve-student" data-uid="${s.uid}" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs shadow-xs transition">
                        ✓ Approve
                      </button>
                      <button data-action="reject-student" data-uid="${s.uid}" class="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold py-1.5 px-3 rounded-lg text-xs transition">
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Cutoff Timings Policy -->
          <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 class="font-bold text-gray-900 text-sm mb-3">Institutional Meal Policies</h4>
            <ul class="text-xs space-y-2.5 text-gray-600">
              <li class="flex justify-between border-b border-gray-50 pb-1.5">
                <span>Breakfast Cutoff:</span>
                <b class="text-gray-900">06:30 AM</b>
              </li>
              <li class="flex justify-between border-b border-gray-50 pb-1.5">
                <span>Lunch Cutoff:</span>
                <b class="text-gray-900">10:00 AM</b>
              </li>
              <li class="flex justify-between border-b border-gray-50 pb-1.5">
                <span>Snacks Cutoff:</span>
                <b class="text-gray-900">03:30 PM</b>
              </li>
              <li class="flex justify-between border-b border-gray-50 pb-1.5">
                <span>Dinner Cutoff:</span>
                <b class="text-gray-900">04:00 PM</b>
              </li>
              <li class="flex justify-between pt-1">
                <span>Daily Leave Rebate:</span>
                <b class="text-emerald-700">₹120 / day</b>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  async renderUsersTab() {
    const users = await dbService.getUsers();
    const pendingStudents = users.filter(u => u.role === 'student' && u.status === 'pending');

    return `
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 class="font-bold text-gray-900 text-lg">System Users & Roles Directory</h3>
            <p class="text-xs text-gray-500">Manage students, mess cooks, and administrators</p>
          </div>
          <button id="btn-show-add-user-modal" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition">
            + Add New User
          </button>
        </div>

        ${pendingStudents.length > 0 ? `
          <div class="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <h4 class="font-bold text-amber-900 text-sm mb-1 flex items-center gap-2">
              <span>⚠️ Action Required: ${pendingStudents.length} Pending Student Registration(s)</span>
            </h4>
            <p class="text-xs text-amber-800 mb-3">These students registered online and cannot log in until approved by the Warden.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              ${pendingStudents.map(s => `
                <div class="bg-white p-3 rounded-xl border border-amber-200 text-xs flex flex-col justify-between">
                  <div>
                    <div class="font-bold text-gray-900 text-sm">${s.displayName}</div>
                    <div class="text-gray-500">${s.email}</div>
                    <div class="text-gray-700 font-mono mt-1">Roll: ${s.rollNumber || 'N/A'} &bull; Room: ${s.roomNumber || 'N/A'}</div>
                    <div class="text-[11px] text-gray-500">Diet: <span class="capitalize font-semibold">${s.dietaryPreference || 'veg'}</span></div>
                  </div>
                  <div class="pt-3 mt-2 border-t border-gray-100 flex gap-2">
                    <button data-action="approve-student" data-uid="${s.uid}" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs transition">
                      Approve
                    </button>
                    <button data-action="reject-student" data-uid="${s.uid}" class="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 px-3 rounded-lg text-xs transition">
                      Reject
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th class="p-3">User</th>
                <th class="p-3">Role</th>
                <th class="p-3">Roll / Staff ID</th>
                <th class="p-3">Room / Dept</th>
                <th class="p-3">Wallet Balance</th>
                <th class="p-3">Status</th>
                <th class="p-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${users.map(u => `
                <tr class="${u.status === 'pending' ? 'bg-amber-50/50' : ''}">
                  <td class="p-3">
                    <div class="font-bold text-gray-900">${u.displayName}</div>
                    <div class="text-xs text-gray-400">${u.email}</div>
                  </td>
                  <td class="p-3">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'staff' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }">
                      ${u.role}
                    </span>
                  </td>
                  <td class="p-3 font-mono text-xs text-gray-700">${u.rollNumber || '—'}</td>
                  <td class="p-3 text-gray-600 text-xs">${u.roomNumber || u.department || '—'}</td>
                  <td class="p-3 font-bold text-gray-800">₹${u.walletBalance || 0}</td>
                  <td class="p-3">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      (u.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                    }">
                      ● ${u.status === 'pending' ? 'Pending Approval' : (u.status || 'active')}
                    </span>
                  </td>
                  <td class="p-3">
                    <div class="flex items-center gap-2">
                      ${u.status === 'pending' ? `
                        <button data-action="approve-student" data-uid="${u.uid}" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-xs transition">
                          Approve
                        </button>
                        <button data-action="reject-student" data-uid="${u.uid}" class="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-2 py-1 rounded-lg transition">
                          Reject
                        </button>
                      ` : ''}
                      <button data-action="delete-user" data-uid="${u.uid}" class="text-rose-600 hover:text-rose-800 text-xs font-semibold">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderMenuTab() {
    const menus = await dbService.getMenus();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return `
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="font-bold text-gray-900 text-lg mb-2">Weekly Mess Menu Manager</h3>
          <p class="text-xs text-gray-500 mb-6">Configure meal schedules, dish items, cut-off hours and per-plate pricing</p>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th class="p-3">Day & Meal</th>
                  <th class="p-3">Timings</th>
                  <th class="p-3">Cut-off</th>
                  <th class="p-3">Food Items</th>
                  <th class="p-3">Tags</th>
                  <th class="p-3">Price</th>
                  <th class="p-3">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${menus.map(m => `
                  <tr>
                    <td class="p-3">
                      <div class="font-bold text-gray-900">${m.dayOfWeek}</div>
                      <div class="text-xs text-indigo-600 uppercase font-semibold">${m.mealType}</div>
                    </td>
                    <td class="p-3 text-xs text-gray-600">${m.timings}</td>
                    <td class="p-3 text-xs font-mono font-bold text-amber-700">${m.cutoffTime}</td>
                    <td class="p-3 text-xs text-gray-700 max-w-xs">${m.items.join(', ')}</td>
                    <td class="p-3">
                      <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.dietaryTags.includes('non-veg') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                        ${m.dietaryTags.includes('non-veg') ? 'Non-Veg' : 'Veg'}
                      </span>
                    </td>
                    <td class="p-3 font-bold text-gray-900">₹${m.price}</td>
                    <td class="p-3">
                      <button data-action="edit-menu" data-menu-id="${m.id}" class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-1.5 rounded-lg font-semibold transition">
                        Edit
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async renderLeavesTab() {
    const leaves = await dbService.getLeaves();

    return `
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 class="font-bold text-gray-900 text-lg mb-2">Student Mess Leave Approvals</h3>
        <p class="text-xs text-gray-500 mb-6">Approved leaves automatically deduct ₹120/day rebate from the student's next monthly invoice.</p>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th class="p-3">Student</th>
                <th class="p-3">Roll No</th>
                <th class="p-3">Dates</th>
                <th class="p-3">Duration</th>
                <th class="p-3">Reason</th>
                <th class="p-3">Status</th>
                <th class="p-3">Rebate</th>
                <th class="p-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${leaves.map(l => `
                <tr>
                  <td class="p-3 font-bold text-gray-900">${l.studentName}</td>
                  <td class="p-3 font-mono text-xs text-gray-600">${l.rollNumber}</td>
                  <td class="p-3 text-xs text-gray-700">${l.startDate} &rarr; ${l.endDate}</td>
                  <td class="p-3 text-xs font-semibold">${l.totalDays || '—'} days</td>
                  <td class="p-3 text-xs text-gray-600 max-w-xs">${l.reason}</td>
                  <td class="p-3">
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                      l.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      l.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }">
                      ${l.status}
                    </span>
                  </td>
                  <td class="p-3 font-bold text-emerald-700">₹${(l.totalDays || 0) * 120}</td>
                  <td class="p-3">
                    ${l.status === 'pending' ? `
                      <div class="flex gap-2">
                        <button data-action="approve-leave" data-id="${l.id}" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded-lg font-semibold">
                          Approve
                        </button>
                        <button data-action="reject-leave" data-id="${l.id}" class="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-rose-200">
                          Reject
                        </button>
                      </div>
                    ` : `
                      <span class="text-xs text-gray-400">Processed</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderBillingTab() {
    const bills = await dbService.getBills();

    return `
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="font-bold text-gray-900 text-lg">Institutional Billing & Ledger</h3>
            <p class="text-xs text-gray-500">Generate end-of-month fee statements with automatic leave rebate deduction</p>
          </div>
          <button id="btn-generate-month-bill" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2">
            <span>⚡ Generate Bills for All Students</span>
          </button>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th class="p-3">Invoice ID</th>
                  <th class="p-3">Student Name</th>
                  <th class="p-3">Roll No</th>
                  <th class="p-3">Month</th>
                  <th class="p-3">Base Fee</th>
                  <th class="p-3">Rebate</th>
                  <th class="p-3">Net Payable</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${bills.map(b => `
                  <tr>
                    <td class="p-3 font-mono text-xs text-gray-500">${b.id}</td>
                    <td class="p-3 font-bold text-gray-900">${b.studentName}</td>
                    <td class="p-3 font-mono text-xs text-gray-600">${b.rollNumber}</td>
                    <td class="p-3 text-xs text-gray-700">${b.month}</td>
                    <td class="p-3 text-gray-600">₹${b.baseFee}</td>
                    <td class="p-3 text-emerald-600 font-semibold">-₹${b.rebateAmount}</td>
                    <td class="p-3 font-bold text-gray-900">₹${b.netPayable}</td>
                    <td class="p-3">
                      <span class="px-2.5 py-1 text-xs font-bold rounded-full uppercase ${b.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                        ${b.status}
                      </span>
                    </td>
                    <td class="p-3">
                      ${b.status === 'unpaid' ? `
                        <button data-action="admin-mark-paid" data-id="${b.id}" class="bg-gray-900 hover:bg-gray-800 text-white text-xs px-2.5 py-1 rounded-lg font-semibold">
                          Mark Paid
                        </button>
                      ` : `
                        <span class="text-xs text-gray-400">Paid on ${b.paidAt || 'N/A'}</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async renderFeedbackTab() {
    const feedbackList = await dbService.getFeedback();

    return `
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 class="font-bold text-gray-900 text-lg mb-2">Student Grievances & Food Quality Reviews</h3>
        <p class="text-xs text-gray-500 mb-6">Review student complaints and respond with corrective kitchen actions</p>

        <div class="space-y-4">
          ${feedbackList.map(f => `
            <div class="p-5 rounded-xl border border-gray-100 bg-gray-50/60">
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                <div class="flex items-center gap-3">
                  <span class="font-bold text-gray-900">${f.studentName} (${f.rollNumber})</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 capitalize">${f.mealType}</span>
                  <span class="text-amber-500 font-bold">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span>
                </div>
                <span class="text-xs text-gray-400">${f.date}</span>
              </div>
              <p class="text-sm text-gray-700 mb-3">${f.comment}</p>
              
              ${f.adminReply ? `
                <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-950">
                  <div class="font-bold mb-0.5">Warden's Official Reply:</div>
                  ${f.adminReply}
                </div>
              ` : `
                <form data-action="reply-feedback" data-id="${f.id}" class="flex gap-2 mt-3">
                  <input type="text" placeholder="Write response to student (e.g. Cook instructed to check sambar heating temperature)..." required
                    class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition">
                    Send Reply
                  </button>
                </form>
              `}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  attachEvents() {
    // Admin Tab switching
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        this.activeTab = e.currentTarget.dataset.tab;
        await this.render();
      });
    });

    // Delete user
    document.querySelectorAll('[data-action="delete-user"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const uid = e.currentTarget.dataset.uid;
        if (confirm(`Are you sure you want to remove user ${uid}?`)) {
          await dbService.deleteUser(uid);
          await this.render();
        }
      });
    });

    // Approve / Reject Leave
    document.querySelectorAll('[data-action="approve-leave"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        await dbService.updateLeaveStatus(id, 'approved');
        alert('Leave approved! Daily rebate will be added to the student\'s monthly bill.');
        await this.render();
      });
    });

    document.querySelectorAll('[data-action="reject-leave"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        await dbService.updateLeaveStatus(id, 'rejected');
        await this.render();
      });
    });

    // Generate monthly bill
    const billGenBtn = document.getElementById('btn-generate-month-bill');
    if (billGenBtn) {
      billGenBtn.addEventListener('click', async () => {
        const monthName = prompt('Enter billing month name:', 'October 2026');
        if (monthName) {
          await dbService.generateMonthlyBills(monthName, 3200, 120);
          alert(`Generated bills for all students for ${monthName}!`);
          this.activeTab = 'billing';
          await this.render();
        }
      });
    }

    const quickBillBtn = document.getElementById('btn-quick-bill-gen');
    if (quickBillBtn) {
      quickBillBtn.addEventListener('click', async () => {
        await dbService.generateMonthlyBills('October 2026', 3200, 120);
        alert('Generated bills for all students for October 2026 with leave rebates applied!');
        this.activeTab = 'billing';
        await this.render();
      });
    }

    // Mark paid
    document.querySelectorAll('[data-action="admin-mark-paid"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        await dbService.updateBillStatus(id, 'paid');
        await this.render();
      });
    });

    // Quick manage users / approvals button
    const quickUsersBtn = document.getElementById('btn-quick-manage-users');
    if (quickUsersBtn) {
      quickUsersBtn.addEventListener('click', async () => {
        this.activeTab = 'users';
        await this.render();
      });
    }

    // Approve Student Registration
    document.querySelectorAll('[data-action="approve-student"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const uid = e.currentTarget.dataset.uid;
        await dbService.approveStudent(uid);
        alert('Student account approved successfully! The student can now log in and access hostel meals.');
        await this.render();
      });
    });

    // Reject Student Registration
    document.querySelectorAll('[data-action="reject-student"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const uid = e.currentTarget.dataset.uid;
        if (confirm('Reject this student registration application?')) {
          await dbService.rejectStudent(uid);
          alert('Student registration application rejected.');
          await this.render();
        }
      });
    });

    // Add user button
    const addUserBtn = document.getElementById('btn-show-add-user-modal');
    const quickAddUser = document.getElementById('btn-quick-add-user');
    const openAddUser = () => {
      const name = prompt('Enter Full Name:');
      if (!name) return;
      const email = prompt('Enter Email address:');
      if (!email) return;
      const role = prompt('Enter Role (student / staff / admin):', 'student');
      if (!role) return;
      const roll = prompt('Enter Roll Number or Staff ID:', 'CS2026-' + Math.floor(100 + Math.random() * 900));

      dbService.saveUser({
        uid: 'usr-' + Date.now(),
        displayName: name,
        email,
        role: role.toLowerCase().trim(),
        rollNumber: roll,
        roomNumber: 'A-101',
        walletBalance: role === 'student' ? 1000 : 0,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0]
      }).then(() => {
        alert(`User ${name} added successfully!`);
        this.render();
      });
    };

    if (addUserBtn) addUserBtn.addEventListener('click', openAddUser);
    if (quickAddUser) quickAddUser.addEventListener('click', openAddUser);

    // Reply feedback
    document.querySelectorAll('[data-action="reply-feedback"]').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = e.currentTarget.dataset.id;
        const text = e.currentTarget.querySelector('input').value;
        await dbService.replyFeedback(id, text);
        alert('Reply posted to student!');
        await this.render();
      });
    });

    // Edit Menu
    document.querySelectorAll('[data-action="edit-menu"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.menuId;
        const menus = await dbService.getMenus();
        const item = menus.find(m => m.id === id);
        if (!item) return;

        const newItemsStr = prompt(`Update dishes for ${item.dayOfWeek} ${item.mealType} (comma separated):`, item.items.join(', '));
        if (newItemsStr !== null) {
          const newItems = newItemsStr.split(',').map(s => s.trim()).filter(Boolean);
          const newPrice = prompt('Update price (₹):', item.price);
          const newCutoff = prompt('Update Cutoff time:', item.cutoffTime);

          await dbService.updateMenu(id, {
            items: newItems,
            price: Number(newPrice) || item.price,
            cutoffTime: newCutoff || item.cutoffTime
          });

          alert('Menu updated successfully!');
          await this.render();
        }
      });
    });
  }
};
