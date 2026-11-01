<<<<<<< HEAD
# Apex Mess Management System 🍽️

A complete, role-based Mess Management System built with **HTML5, Tailwind CSS, JavaScript (ES Modules)**, and backed by **Google Cloud Firestore**.

---

## 🚀 Quick Start (Running the App)

You can launch the web application in your browser in either of two ways:

### Option 1: Using the Included PowerShell Server (Recommended)
Open PowerShell in this directory and run:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
This automatically starts a local server on `http://localhost:3000` and opens it in your default browser.

### Option 2: Direct Browser Launch
You can also directly open `index.html` in **Google Chrome** or **Microsoft Edge**.

---

## 👥 Three Main Logins & Roles

The system comes pre-configured with **1-Click Quick Demo Logins** on the home screen as well as custom email/password authentication:

| Role | Default Name | Roll / ID | Email | Password | Key Responsibilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Student** | Rahul Sharma | `CS2024-042` | `rahul.sharma@hostel.edu` | `password123` | View daily & weekly menus, meal opt-in/opt-out, digital QR meal pass, mess leave rebate applications, fee invoices, meal ratings. |
| **2. Mess Staff** | Ramesh Kumar | `STAFF-01` | `chef.ramesh@mess.hostel.edu` | `password123` | Live headcount forecast (Veg vs Non-Veg plates), camera QR scanner & roll search, food serving status, daily food waste/leftover logging. |
| **3. Admin (Warden)** | Rajan | `ADMIN-01` | `admin.rajan@hostel.edu` | `password123` | Institutional oversight, user management, weekly menu editor, monthly billing generator with rebates, leave approvals, student grievance redressal. |

> [!TIP]
> Once logged in, use the **Switch Role** bar at the top right of the navigation bar to instantly jump between Student, Staff, and Admin views without having to log out.

---

## 🔥 Connecting Google Cloud Firestore

The app includes **Dual-Mode Support**:
1. **Interactive Demo Mode (Active by default)**: Runs immediately out of the box with sample menus, attendance records, and student accounts stored locally in the browser.
2. **Cloud Firestore Mode**: Syncs all data in real-time with your Google Firebase project.

### Connecting your Firebase Project in 3 Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Under **Build**:
   - Enable **Firestore Database** in Test Mode or Production Mode.
   - (Optional) Enable **Authentication** with Email/Password.
3. In Project Settings $\rightarrow$ **General** $\rightarrow$ **Your apps** $\rightarrow$ Select **Web (`</>`)**:
   - Copy your config values (`apiKey`, `projectId`, etc.).
   - In the Mess Management app, click the **Firestore / Demo** badge in the top right.
   - Paste the keys into the form and click **Save & Connect Firestore**.
   - Under Admin Portal $\rightarrow$ Quick Actions, click **Sync Seed to Firestore** to populate your new database with standard weekly menus!

### Firestore Security Rules
Copy the rules from `firestore.rules` in this repo and paste them into **Firestore Database $\rightarrow$ Rules** in the Firebase Console.

---

## 📂 Project Architecture

```
mess-management-system/
├── index.html              # Main single-page application & modal templates
├── css/
│   └── styles.css          # Custom styling, typography & print stylesheet
├── js/
│   ├── app.js              # Central orchestrator & role routing
│   ├── auth.js             # Authentication service & quick switcher
│   ├── db.js               # Cloud Firestore service with local fallback
│   ├── student.js          # Student portal (QR pass, opt-out, leaves, billing)
│   ├── staff.js            # Mess staff portal (Headcount, scanner, wastage)
│   ├── admin.js            # Admin portal (User directory, menu editor, billing)
│   ├── mock-data.js        # Starter seed dataset
│   └── firebase-config.js  # Firebase v10 Modular SDK connection manager
├── firestore.rules         # Cloud Firestore security rules
├── serve.ps1               # Lightweight PowerShell web server
└── README.md               # Documentation
```
=======
# Network_clone
This is my website
>>>>>>> fc89929650aee144298eec660ee0980b90dcdddf
