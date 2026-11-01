// Mock and initial seed data for the Mess Management System
export const initialMockData = {
  users: [
    {
      uid: 'student-101',
      email: 'rahul.sharma@hostel.edu',
      password: 'password123',
      displayName: 'Rahul Sharma',
      role: 'student',
      rollNumber: 'CS2024-042',
      roomNumber: 'B-204',
      phone: '+91 98765 43210',
      dietaryPreference: 'veg',
      walletBalance: 1450,
      monthlyFee: 3000,
      amountUsed: 1550,
      classStandard: 'B.Tech CS 3rd Year',
      status: 'active',
      joinedDate: '2026-01-15'
    },
    {
      uid: 'student-102',
      email: 'priya.patel@hostel.edu',
      password: 'password123',
      displayName: 'Priya Patel',
      role: 'student',
      rollNumber: 'EC2024-019',
      roomNumber: 'A-108',
      phone: '+91 98112 23344',
      dietaryPreference: 'veg',
      walletBalance: 2100,
      monthlyFee: 3000,
      amountUsed: 900,
      classStandard: 'B.Tech ECE 2nd Year',
      status: 'active',
      joinedDate: '2026-01-16'
    },
    {
      uid: 'student-103',
      email: 'amit.verma@hostel.edu',
      password: 'password123',
      displayName: 'Amit Verma',
      role: 'student',
      rollNumber: 'ME2024-088',
      roomNumber: 'C-312',
      phone: '+91 97766 55443',
      dietaryPreference: 'non-veg',
      walletBalance: 820,
      monthlyFee: 3000,
      amountUsed: 2180,
      classStandard: 'B.Tech ME 3rd Year',
      status: 'active',
      joinedDate: '2026-02-01'
    },
    {
      uid: 'staff-201',
      email: 'chef.ramesh@mess.hostel.edu',
      password: 'password123',
      displayName: 'Ramesh Kumar (Head Cook)',
      role: 'staff',
      rollNumber: 'STAFF-01',
      roomNumber: 'Mess Kitchen A',
      phone: '+91 91234 56789',
      status: 'active',
      shift: 'Morning & Evening'
    },
    {
      uid: 'admin-001',
      email: 'admin.rajan@hostel.edu',
      password: 'password123',
      displayName: 'Rajan (Mess Warden / Admin)',
      role: 'admin',
      rollNumber: 'ADMIN-01',
      roomNumber: 'Warden Office 101',
      phone: '+91 99887 76655',
      status: 'active',
      department: 'Hostel Administration'
    }
  ],

  menus: [
    // Monday
    {
      id: 'menu-mon-bf',
      dayOfWeek: 'Monday',
      mealType: 'breakfast',
      timings: '07:30 AM - 09:30 AM',
      cutoffTime: '06:30 AM',
      items: ['Aloo Paratha (2 pcs)', 'Fresh Curd & Pickle', 'Boiled Eggs / Fruit Bowl', 'Masala Chai / Coffee'],
      dietaryTags: ['veg', 'non-veg'],
      price: 45
    },
    {
      id: 'menu-mon-lu',
      dayOfWeek: 'Monday',
      mealType: 'lunch',
      timings: '12:30 PM - 02:30 PM',
      cutoffTime: '10:00 AM',
      items: ['Paneer Butter Masala', 'Yellow Dal Tadka', 'Jeera Rice', 'Tawa Phulka (4 pcs)', 'Green Salad & Papad'],
      dietaryTags: ['veg'],
      price: 85
    },
    {
      id: 'menu-mon-sn',
      dayOfWeek: 'Monday',
      mealType: 'snacks',
      timings: '05:00 PM - 06:30 PM',
      cutoffTime: '03:30 PM',
      items: ['Crispy Veg Pakora (4 pcs)', 'Mint Chutney', 'Hot Ginger Tea'],
      dietaryTags: ['veg'],
      price: 35
    },
    {
      id: 'menu-mon-di',
      dayOfWeek: 'Monday',
      mealType: 'dinner',
      timings: '07:30 PM - 09:30 PM',
      cutoffTime: '04:00 PM',
      items: ['Kadhai Veg / Egg Curry', 'Dal Makhani', 'Steamed Basmati Rice', 'Butter Roti', 'Gulab Jamun (1 pc)'],
      dietaryTags: ['veg', 'non-veg'],
      price: 90
    },

    // Tuesday
    {
      id: 'menu-tue-bf',
      dayOfWeek: 'Tuesday',
      mealType: 'breakfast',
      timings: '07:30 AM - 09:30 AM',
      cutoffTime: '06:30 AM',
      items: ['Idli Sambar (4 pcs)', 'Coconut Chutney & Podi', 'Omelette / Banana', 'Filter Coffee'],
      dietaryTags: ['veg', 'non-veg'],
      price: 45
    },
    {
      id: 'menu-tue-lu',
      dayOfWeek: 'Tuesday',
      mealType: 'lunch',
      timings: '12:30 PM - 02:30 PM',
      cutoffTime: '10:00 AM',
      items: ['Chole Masala', 'Bhature (2 pcs) / Poori', 'Veg Pulao', 'Boondi Raita', 'Pickle & Onion Rings'],
      dietaryTags: ['veg'],
      price: 85
    },
    {
      id: 'menu-tue-sn',
      dayOfWeek: 'Tuesday',
      mealType: 'snacks',
      timings: '05:00 PM - 06:30 PM',
      cutoffTime: '03:30 PM',
      items: ['Spicy Veg Samosa (2 pcs)', 'Tamarind Chutney', 'Adrak Chai'],
      dietaryTags: ['veg'],
      price: 35
    },
    {
      id: 'menu-tue-di',
      dayOfWeek: 'Tuesday',
      mealType: 'dinner',
      timings: '07:30 PM - 09:30 PM',
      cutoffTime: '04:00 PM',
      items: ['Mix Vegetable Curry', 'Moong Dal Fry', 'Steamed Rice', 'Phulka', 'Rasgulla (1 pc)'],
      dietaryTags: ['veg'],
      price: 90
    },

    // Wednesday
    {
      id: 'menu-wed-bf',
      dayOfWeek: 'Wednesday',
      mealType: 'breakfast',
      timings: '07:30 AM - 09:30 AM',
      cutoffTime: '06:30 AM',
      items: ['Poha with Sev & Peanuts', 'Upma', 'Boiled Eggs / Sprouts', 'Tea / Milk'],
      dietaryTags: ['veg', 'non-veg'],
      price: 45
    },
    {
      id: 'menu-wed-lu',
      dayOfWeek: 'Wednesday',
      mealType: 'lunch',
      timings: '12:30 PM - 02:30 PM',
      cutoffTime: '10:00 AM',
      items: ['Rajma Masala', 'Kashmiri Dum Aloo', 'Steamed Rice', 'Chapati', 'Cucumber Raita'],
      dietaryTags: ['veg'],
      price: 85
    },
    {
      id: 'menu-wed-sn',
      dayOfWeek: 'Wednesday',
      mealType: 'snacks',
      timings: '05:00 PM - 06:30 PM',
      cutoffTime: '03:30 PM',
      items: ['Grilled Veg Sandwich (2 pcs)', 'Ketchup', 'Lemon Tea / Coffee'],
      dietaryTags: ['veg'],
      price: 40
    },
    {
      id: 'menu-wed-di',
      dayOfWeek: 'Wednesday',
      mealType: 'dinner',
      timings: '07:30 PM - 09:30 PM',
      cutoffTime: '04:00 PM',
      items: ['Butter Chicken / Shahi Paneer (Special)', 'Dal Tadka', 'Jeera Pulao', 'Naan / Roti', 'Ice Cream Cup'],
      dietaryTags: ['veg', 'non-veg'],
      price: 110
    },

    // Thursday
    {
      id: 'menu-thu-bf',
      dayOfWeek: 'Thursday',
      mealType: 'breakfast',
      timings: '07:30 AM - 09:30 AM',
      cutoffTime: '06:30 AM',
      items: ['Medu Vada (3 pcs) & Sambar', 'Coconut & Tomato Chutneys', 'Tea / Coffee'],
      dietaryTags: ['veg'],
      price: 45
    },
    {
      id: 'menu-thu-lu',
      dayOfWeek: 'Thursday',
      mealType: 'lunch',
      timings: '12:30 PM - 02:30 PM',
      cutoffTime: '10:00 AM',
      items: ['Aloo Gobi Matar', 'Gujarati Kadi / Sambar', 'Khichdi / Steamed Rice', 'Phulka', 'Roasted Papad'],
      dietaryTags: ['veg'],
      price: 80
    },
    {
      id: 'menu-thu-sn',
      dayOfWeek: 'Thursday',
      mealType: 'snacks',
      timings: '05:00 PM - 06:30 PM',
      cutoffTime: '03:30 PM',
      items: ['Crispy Onion Bhaji', 'Chai'],
      dietaryTags: ['veg'],
      price: 35
    },
    {
      id: 'menu-thu-di',
      dayOfWeek: 'Thursday',
      mealType: 'dinner',
      timings: '07:30 PM - 09:30 PM',
      cutoffTime: '04:00 PM',
      items: ['Palak Paneer / Veg Kofta', 'Chana Dal', 'Steamed Rice', 'Tawa Roti', 'Suji Halwa'],
      dietaryTags: ['veg'],
      price: 90
    },

    // Friday
    {
      id: 'menu-fri-bf',
      dayOfWeek: 'Friday',
      mealType: 'breakfast',
      timings: '07:30 AM - 09:30 AM',
      cutoffTime: '06:30 AM',
      items: ['Poori Bhaji (4 pcs)', 'Pickle', 'Boiled Eggs / Fruit Salad', 'Masala Tea'],
      dietaryTags: ['veg', 'non-veg'],
      price: 50
    },
    {
      id: 'menu-fri-lu',
      dayOfWeek: 'Friday',
      mealType: 'lunch',
      timings: '12:30 PM - 02:30 PM',
      cutoffTime: '10:00 AM',
      items: ['Veg / Chicken Biryani (Special Friday)', 'Mirchi Ka Salan', 'Veg Raita', 'Boiled Egg (Optional)'],
      dietaryTags: ['veg', 'non-veg'],
      price: 100
    },
    {
      id: 'menu-fri-sn',
      dayOfWeek: 'Friday',
      mealType: 'snacks',
      timings: '05:00 PM - 06:30 PM',
      cutoffTime: '03:30 PM',
      items: ['Veg Cutlet (2 pcs)', 'Green Mint Chutney', 'Cardamom Tea'],
      dietaryTags: ['veg'],
      price: 35
    },
    {
      id: 'menu-fri-di',
      dayOfWeek: 'Friday',
      mealType: 'dinner',
      timings: '07:30 PM - 09:30 PM',
      cutoffTime: '04:00 PM',
      items: ['Matar Paneer', 'Dal Fry', 'Jeera Rice', 'Phulka', 'Kheer / Payasam'],
      dietaryTags: ['veg'],
      price: 90
    },

    // Saturday
    {
      id: 'menu-sat-bf',
      dayOfWeek: 'Saturday',
      mealType: 'breakfast',
      timings: '08:00 AM - 10:00 AM',
      cutoffTime: '07:00 AM',
      items: ['Masala Dosa / Plain Dosa', 'Sambar & Chutney', 'Filter Coffee'],
      dietaryTags: ['veg'],
      price: 50
    },
    {
      id: 'menu-sat-lu',
      dayOfWeek: 'Saturday',
      mealType: 'lunch',
      timings: '12:30 PM - 02:30 PM',
      cutoffTime: '10:00 AM',
      items: ['Kadhi Pakora', 'Jeera Aloo Fry', 'Steamed Rice', 'Roti', 'Salad & Fryums'],
      dietaryTags: ['veg'],
      price: 80
    },
    {
      id: 'menu-sat-sn',
      dayOfWeek: 'Saturday',
      mealType: 'snacks',
      timings: '05:00 PM - 06:30 PM',
      cutoffTime: '03:30 PM',
      items: ['Bread Roll (2 pcs)', 'Tomato Sauce', 'Hot Tea'],
      dietaryTags: ['veg'],
      price: 35
    },
    {
      id: 'menu-sat-di',
      dayOfWeek: 'Saturday',
      mealType: 'dinner',
      timings: '07:30 PM - 09:30 PM',
      cutoffTime: '04:00 PM',
      items: ['Pav Bhaji (3 pavs)', 'Chopped Onions & Lemon', 'Pulao', 'Fruit Custard'],
      dietaryTags: ['veg'],
      price: 90
    },

    // Sunday
    {
      id: 'menu-sun-bf',
      dayOfWeek: 'Sunday',
      mealType: 'breakfast',
      timings: '08:00 AM - 10:30 AM',
      cutoffTime: '07:00 AM',
      items: ['Paneer Paratha (2 pcs)', 'Butter & Curd', 'Omelette / Boiled Eggs', 'Special Masala Chai'],
      dietaryTags: ['veg', 'non-veg'],
      price: 55
    },
    {
      id: 'menu-sun-lu',
      dayOfWeek: 'Sunday',
      mealType: 'lunch',
      timings: '12:30 PM - 03:00 PM',
      cutoffTime: '10:30 AM',
      items: ['Grand Sunday Feast: Mutton Curry / Shahi Malai Kofta', 'Dal Makhani', 'Peas Pulao', 'Butter Naan', 'Gulab Jamun (2 pcs)'],
      dietaryTags: ['veg', 'non-veg'],
      price: 130
    },
    {
      id: 'menu-sun-sn',
      dayOfWeek: 'Sunday',
      mealType: 'snacks',
      timings: '05:00 PM - 06:30 PM',
      cutoffTime: '03:30 PM',
      items: ['Corn Chaat / Bhel Puri', 'Cold Drink / Coffee'],
      dietaryTags: ['veg'],
      price: 40
    },
    {
      id: 'menu-sun-di',
      dayOfWeek: 'Sunday',
      mealType: 'dinner',
      timings: '07:30 PM - 09:30 PM',
      cutoffTime: '04:00 PM',
      items: ['Light Dinner: Khichdi & Kadi', 'Aloo Chokha', 'Papad', 'Fruit Salad'],
      dietaryTags: ['veg'],
      price: 75
    }
  ],

  attendance: [
    {
      id: 'att-101-lunch',
      studentId: 'student-101',
      studentName: 'Rahul Sharma',
      rollNumber: 'CS2024-042',
      date: new Date().toISOString().split('T')[0],
      mealType: 'lunch',
      status: 'attended',
      scannedAt: '13:05 PM',
      scannedBy: 'Ramesh Kumar (Head Cook)'
    },
    {
      id: 'att-101-dinner',
      studentId: 'student-101',
      studentName: 'Rahul Sharma',
      rollNumber: 'CS2024-042',
      date: new Date().toISOString().split('T')[0],
      mealType: 'dinner',
      status: 'opted_in',
      scannedAt: null,
      scannedBy: null
    },
    {
      id: 'att-102-dinner',
      studentId: 'student-102',
      studentName: 'Priya Patel',
      rollNumber: 'EC2024-019',
      date: new Date().toISOString().split('T')[0],
      mealType: 'dinner',
      status: 'opted_in',
      scannedAt: null,
      scannedBy: null
    },
    {
      id: 'att-103-dinner',
      studentId: 'student-103',
      studentName: 'Amit Verma',
      rollNumber: 'ME2024-088',
      date: new Date().toISOString().split('T')[0],
      mealType: 'dinner',
      status: 'opted_out',
      scannedAt: null,
      scannedBy: null
    }
  ],

  // ── NEW: Meal Bookings ──────────────────────────────────────────
  mealBookings: [
    {
      id: 'BK-DEMO-001',
      studentId: 'student-101',
      studentName: 'Rahul Sharma',
      rollNumber: 'CS2024-042',
      mealType: 'lunch',
      date: new Date().toISOString().split('T')[0],
      price: 85,
      qrToken: 'QRT-student-101-lunch-' + new Date().toISOString().split('T')[0] + '-DEMO',
      status: 'verified',
      bookedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      verifiedAt: '13:05',
      verifiedBy: 'Ramesh Kumar (Head Cook)'
    }
  ],

  // ── NEW: Wallet Payment Transactions ───────────────────────────
  payments: [
    {
      id: 'TXN-DEMO-001',
      studentId: 'student-101',
      type: 'credit',
      amount: 3000,
      method: 'Monthly Fee Credit',
      description: 'Standard Monthly Meal Fee – September 2026',
      status: 'completed',
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 'TXN-DEMO-002',
      studentId: 'student-101',
      type: 'debit',
      amount: 85,
      method: 'Meal Booking',
      description: 'Lunch booked – ' + new Date().toISOString().split('T')[0],
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
    },
    {
      id: 'TXN-DEMO-003',
      studentId: 'student-102',
      type: 'credit',
      amount: 3000,
      method: 'Monthly Fee Credit',
      description: 'Standard Monthly Meal Fee – September 2026',
      status: 'completed',
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 'TXN-DEMO-004',
      studentId: 'student-103',
      type: 'credit',
      amount: 3000,
      method: 'Monthly Fee Credit',
      description: 'Standard Monthly Meal Fee – September 2026',
      status: 'completed',
      createdAt: '2026-09-01T10:00:00.000Z'
    }
  ],

  leaves: [
    {
      id: 'leave-001',
      studentId: 'student-101',
      studentName: 'Rahul Sharma',
      rollNumber: 'CS2024-042',
      startDate: '2026-09-20',
      endDate: '2026-09-25',
      totalDays: 6,
      reason: 'Attending IEEE Hackathon in Bengaluru',
      status: 'approved',
      appliedAt: '2026-09-10'
    },
    {
      id: 'leave-002',
      studentId: 'student-103',
      studentName: 'Amit Verma',
      rollNumber: 'ME2024-088',
      startDate: '2026-09-15',
      endDate: '2026-09-18',
      totalDays: 4,
      reason: 'Sister wedding in Jaipur',
      status: 'pending',
      appliedAt: '2026-09-11'
    }
  ],

  bills: [
    {
      id: 'bill-2026-08-101',
      studentId: 'student-101',
      studentName: 'Rahul Sharma',
      rollNumber: 'CS2024-042',
      month: 'August 2026',
      baseFee: 3200,
      rebateAmount: 480,
      extraCharges: 150,
      netPayable: 2870,
      status: 'paid',
      paidAt: '2026-09-02',
      dueDate: '2026-09-10'
    },
    {
      id: 'bill-2026-09-101',
      studentId: 'student-101',
      studentName: 'Rahul Sharma',
      rollNumber: 'CS2024-042',
      month: 'September 2026',
      baseFee: 3200,
      rebateAmount: 720,
      extraCharges: 0,
      netPayable: 2480,
      status: 'unpaid',
      dueDate: '2026-10-05'
    },
    {
      id: 'bill-2026-09-102',
      studentId: 'student-102',
      studentName: 'Priya Patel',
      rollNumber: 'EC2024-019',
      month: 'September 2026',
      baseFee: 3200,
      rebateAmount: 0,
      extraCharges: 200,
      netPayable: 3400,
      status: 'unpaid',
      dueDate: '2026-10-05'
    }
  ],

  feedback: [
    {
      id: 'fb-001',
      studentId: 'student-101',
      studentName: 'Rahul Sharma',
      rollNumber: 'CS2024-042',
      mealType: 'lunch',
      date: '2026-09-10',
      rating: 5,
      comment: 'Paneer Butter Masala was very fresh and flavorful! Please keep it regular on Mondays.',
      resolved: true,
      adminReply: 'Thank you Rahul, glad you enjoyed it!'
    },
    {
      id: 'fb-002',
      studentId: 'student-103',
      studentName: 'Amit Verma',
      rollNumber: 'ME2024-088',
      mealType: 'breakfast',
      date: '2026-09-11',
      rating: 2,
      comment: 'Sambar was slightly cold when I arrived around 9:00 AM.',
      resolved: false,
      adminReply: null
    }
  ],

  wastageLogs: [
    {
      id: 'waste-001',
      date: '2026-09-10',
      mealType: 'dinner',
      leftoverKg: 4.5,
      notes: 'Rice and dal leftover. 8 students skipped dinner without opting out.',
      loggedBy: 'Ramesh Kumar'
    },
    {
      id: 'waste-002',
      date: '2026-09-11',
      mealType: 'lunch',
      leftoverKg: 2.1,
      notes: 'Minimal wastage, accurate turnout.',
      loggedBy: 'Ramesh Kumar'
    }
  ],

  settings: {
    messName: 'Apex Central Mess & Dining Hall',
    monthlyBaseFee: 3200,
    standardMonthlyMealFee: 3000,
    dailyRebateRate: 120,
    timings: {
      breakfast: { start: '07:30', end: '09:30', cutoff: '06:30' },
      lunch: { start: '12:30', end: '14:30', cutoff: '10:00' },
      snacks: { start: '17:00', end: '18:30', cutoff: '15:30' },
      dinner: { start: '19:30', end: '21:30', cutoff: '16:00' }
    }
  }
};
