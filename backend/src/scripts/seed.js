require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })

const { sequelize, User, Teacher, Student, Parent, ParentStudent, ClassSection, Subject, ClassRoom, Attendance, Complaint, FeeStructure, FeeRecord, Homework, Notice, BusRoute, RouteStop, Bus, BusAssignment } = require('../models')

const seed = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ force: true })
    console.log('🗄️  Database reset.')

    // ── Users ──────────────────────────────────────────────────────────────────
    const principalUser = await User.create({
      name: 'Dr. Ramesh Verma', email: 'principal@school.com', password: 'principal123',
      role: 'principal', phone: '+91-9876543200', joinDate: '2010-01-15',
    })

    const teacherUsers = await User.bulkCreate([
      { name: 'Mr. Rajesh Kumar',  email: 'teacher1@school.com', password: 'teacher123', role: 'teacher', phone: '+91-9876543210', joinDate: '2016-06-15' },
      { name: 'Mrs. Priya Sharma', email: 'teacher2@school.com', password: 'teacher123', role: 'teacher', phone: '+91-9876543211', joinDate: '2018-07-20' },
      { name: 'Mr. Arun Singh',    email: 'arun@school.com',     password: 'teacher123', role: 'teacher', phone: '+91-9876543212', joinDate: '2014-08-10' },
      { name: 'Ms. Neha Patel',    email: 'neha@school.com',     password: 'teacher123', role: 'teacher', phone: '+91-9876543213', joinDate: '2019-09-01' },
    ])

    const studentUsers = await User.bulkCreate([
      { name: 'Aarav Patel',   email: 'student1@student.com', password: 'student123', role: 'student', phone: '+91-9876543220' },
      { name: 'Diya Gupta',    email: 'student2@student.com', password: 'student123', role: 'student', phone: '+91-9876543221' },
      { name: 'Rohan Verma',   email: 'rohan@student.com',    password: 'student123', role: 'student', phone: '+91-9876543222' },
      { name: 'Shreya Singh',  email: 'shreya@student.com',   password: 'student123', role: 'student', phone: '+91-9876543223' },
      { name: 'Arjun Kumar',   email: 'arjun@student.com',    password: 'student123', role: 'student', phone: '+91-9876543224' },
    ])

    const parentUsers = await User.bulkCreate([
      { name: 'Vikram Patel',   email: 'parent1@parent.com', password: 'parent123', role: 'parent', phone: '+91-9876543230' },
      { name: 'Rajesh Gupta',   email: 'parent2@parent.com', password: 'parent123', role: 'parent', phone: '+91-9876543231' },
    ])

    // ── Teacher Profiles ───────────────────────────────────────────────────────
    const teachers = await Teacher.bulkCreate([
      { userId: teacherUsers[0].id, department: 'Mathematics', qualification: 'B.Tech, M.Sc', experience: 8,  subjects: ['Mathematics', 'Statistics'], classes: ['10A', '10B', '11A'], employeeCode: 'EMP001' },
      { userId: teacherUsers[1].id, department: 'English',     qualification: 'B.A, M.A',     experience: 6,  subjects: ['English', 'Literature'],     classes: ['9A', '9B', '10A'],  employeeCode: 'EMP002' },
      { userId: teacherUsers[2].id, department: 'Science',     qualification: 'B.Sc, M.Sc',   experience: 10, subjects: ['Physics', 'Chemistry'],       classes: ['8A', '8B', '9A'],   employeeCode: 'EMP003' },
      { userId: teacherUsers[3].id, department: 'Social Studies', qualification: 'B.A, B.Ed', experience: 5,  subjects: ['History', 'Geography'],       classes: ['7A', '7B', '8A'],   employeeCode: 'EMP004' },
    ])

    // ── Student Profiles ───────────────────────────────────────────────────────
    const students = await Student.bulkCreate([
      { userId: studentUsers[0].id, rollNumber: '001', class: '10', section: 'A', fatherName: 'Vikram Patel',  motherName: 'Anjali Patel',  dob: '2008-05-15', enrollmentDate: '2020-04-01' },
      { userId: studentUsers[1].id, rollNumber: '002', class: '10', section: 'A', fatherName: 'Rajesh Gupta',  motherName: 'Meena Gupta',   dob: '2008-08-22', enrollmentDate: '2020-04-01' },
      { userId: studentUsers[2].id, rollNumber: '003', class: '9',  section: 'B', fatherName: 'Amit Verma',    motherName: 'Kavya Verma',   dob: '2009-03-10', enrollmentDate: '2021-04-01' },
      { userId: studentUsers[3].id, rollNumber: '004', class: '9',  section: 'A', fatherName: 'Rahul Singh',   motherName: 'Priya Singh',   dob: '2009-07-18', enrollmentDate: '2021-04-01' },
      { userId: studentUsers[4].id, rollNumber: '005', class: '8',  section: 'A', fatherName: 'Suresh Kumar',                               dob: '2010-12-05', enrollmentDate: '2022-04-01' },
    ])

    // ── Parent Profiles ────────────────────────────────────────────────────────
    const parents = await Parent.bulkCreate([
      { userId: parentUsers[0].id, occupation: 'Business' },
      { userId: parentUsers[1].id, occupation: 'Engineer' },
    ])
    await ParentStudent.bulkCreate([
      { parentId: parents[0].id, studentId: students[0].id },
      { parentId: parents[1].id, studentId: students[1].id },
    ])

    // ── Class Sections ─────────────────────────────────────────────────────────
    await ClassSection.bulkCreate([
      { className: '10', sectionName: 'A', classTeacherId: teachers[0].id, capacity: 40, academicYear: '2024-25' },
      { className: '9',  sectionName: 'A', classTeacherId: teachers[1].id, capacity: 40, academicYear: '2024-25' },
      { className: '9',  sectionName: 'B', classTeacherId: teachers[2].id, capacity: 40, academicYear: '2024-25' },
      { className: '8',  sectionName: 'A', classTeacherId: teachers[3].id, capacity: 40, academicYear: '2024-25' },
    ])

    // ── Subjects ───────────────────────────────────────────────────────────────
    await Subject.bulkCreate([
      { subjectCode: 'MATH10', subjectName: 'Mathematics',   subjectType: 'theoretical', credits: 5, department: 'Mathematics' },
      { subjectCode: 'ENG10',  subjectName: 'English',       subjectType: 'theoretical', credits: 4, department: 'Languages' },
      { subjectCode: 'PHY10',  subjectName: 'Physics',       subjectType: 'both',        credits: 4, department: 'Science' },
      { subjectCode: 'CHEM10', subjectName: 'Chemistry',     subjectType: 'both',        credits: 4, department: 'Science' },
      { subjectCode: 'HIST10', subjectName: 'History',       subjectType: 'theoretical', credits: 3, department: 'Social Studies' },
      { subjectCode: 'GEO10',  subjectName: 'Geography',     subjectType: 'theoretical', credits: 3, department: 'Social Studies' },
    ])

    // ── Classrooms ─────────────────────────────────────────────────────────────
    await ClassRoom.bulkCreate([
      { roomNumber: '101', capacity: 45, floor: 1, facilities: ['projector', 'whiteboard'], assignedClass: '10-A', maintenanceStatus: 'good' },
      { roomNumber: '102', capacity: 40, floor: 1, facilities: ['whiteboard'],              assignedClass: '9-A',  maintenanceStatus: 'good' },
      { roomNumber: '201', capacity: 40, floor: 2, facilities: ['projector', 'ac'],         assignedClass: '9-B',  maintenanceStatus: 'fair' },
      { roomNumber: '202', capacity: 35, floor: 2, facilities: ['whiteboard'],              maintenanceStatus: 'needs_repair' },
    ])

    // ── Attendance ─────────────────────────────────────────────────────────────
    const dates = ['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19']
    const statuses = ['present', 'present', 'present', 'absent', 'present']
    const attendanceRows = []
    for (const student of students) {
      dates.forEach((date, i) => {
        attendanceRows.push({ studentId: student.id, date, status: statuses[i], markedById: principalUser.id })
      })
    }
    await Attendance.bulkCreate(attendanceRows, { ignoreDuplicates: true })

    // ── Complaints ─────────────────────────────────────────────────────────────
    await Complaint.bulkCreate([
      { title: 'Classroom Temperature Issue', description: 'AC not working in room 102', category: 'facilities', status: 'open',        priority: 'medium', createdById: studentUsers[0].id },
      { title: 'Bullying Incident',            description: 'Incident reported on Jan 15', category: 'bullying',   status: 'in-progress', priority: 'high',   createdById: parentUsers[0].id, assignedToId: principalUser.id },
      { title: 'Books Not Available',          description: 'Library books out of stock',  category: 'academic',   status: 'resolved',    priority: 'low',    createdById: studentUsers[1].id },
    ])

    // ── Fee Structure ──────────────────────────────────────────────────────────
    const feeStructures = await FeeStructure.bulkCreate([
      { class: '10', feeType: 'Tuition Fee',  amount: 5000, dueDate: '2024-01-31', frequency: 'monthly',   academicYear: '2024-25' },
      { class: '10', feeType: 'Lab Fee',      amount: 1000, dueDate: '2024-04-30', frequency: 'quarterly', academicYear: '2024-25' },
      { class: '9',  feeType: 'Tuition Fee',  amount: 4500, dueDate: '2024-01-31', frequency: 'monthly',   academicYear: '2024-25' },
    ])

    await FeeRecord.bulkCreate([
      { studentId: students[0].id, feeType: 'Tuition Fee', amount: 5000, dueDate: '2024-01-31', status: 'paid',    paidDate: '2024-01-10', paymentMethod: 'online' },
      { studentId: students[0].id, feeType: 'Lab Fee',     amount: 1000, dueDate: '2024-04-30', status: 'pending' },
      { studentId: students[1].id, feeType: 'Tuition Fee', amount: 5000, dueDate: '2024-01-31', status: 'overdue' },
      { studentId: students[2].id, feeType: 'Tuition Fee', amount: 4500, dueDate: '2024-01-31', status: 'paid',    paidDate: '2024-01-08', paymentMethod: 'cash' },
    ])

    // ── Homework ───────────────────────────────────────────────────────────────
    await Homework.bulkCreate([
      { title: 'Chapter 5: Quadratic Equations', description: 'Solve exercises 1-20', subject: 'Mathematics', class: '10', section: 'A', dueDate: '2024-01-22', assignedById: teacherUsers[0].id, maxMarks: 20 },
      { title: 'Essay: The French Revolution',   description: 'Write a 500-word essay', subject: 'History',   class: '9',  section: 'A', dueDate: '2024-01-24', assignedById: teacherUsers[3].id, maxMarks: 25 },
    ])

    // ── Notices ────────────────────────────────────────────────────────────────
    await Notice.bulkCreate([
      { title: 'Parent-Teacher Meeting',   content: 'PTM scheduled for Jan 20, 2024 at 10 AM.', category: 'event',   audience: 'all',     createdById: principalUser.id },
      { title: 'Annual Sports Day',        content: 'Sports Day on Feb 5. All students must participate.', category: 'event',   audience: 'all',     createdById: principalUser.id },
      { title: 'Staff Meeting',            content: 'Mandatory staff meeting on Jan 18 at 4 PM.',           category: 'general', audience: 'teachers', createdById: principalUser.id },
    ])

    // ── Bus Routes ─────────────────────────────────────────────────────────────
    const routes = await BusRoute.bulkCreate([
      { routeName: 'North Route', startPoint: 'Andheri West', totalDistance: '14 km', estimatedTime: '45 min', status: 'active' },
      { routeName: 'South Route', startPoint: 'Dadar',        totalDistance: '18 km', estimatedTime: '55 min', status: 'active' },
    ])

    await RouteStop.bulkCreate([
      { routeId: routes[0].id, stopName: 'Andheri West Station', pickupTime: '06:45', dropTime: '15:30', order: 1, landmark: 'Near McDonalds' },
      { routeId: routes[0].id, stopName: 'Jogeshwari Market',    pickupTime: '07:00', dropTime: '15:15', order: 2 },
      { routeId: routes[0].id, stopName: 'Goregaon Station',     pickupTime: '07:15', dropTime: '15:00', order: 3 },
      { routeId: routes[1].id, stopName: 'Dadar TT Circle',      pickupTime: '06:30', dropTime: '15:45', order: 1 },
      { routeId: routes[1].id, stopName: 'Bandra Station',       pickupTime: '07:05', dropTime: '15:10', order: 2, landmark: 'West Exit' },
    ])

    const buses = await Bus.bulkCreate([
      { busNumber: 'Bus-01', registrationNumber: 'MH-04-AB-1234', driverName: 'Ramesh Yadav',  driverPhone: '+91-9811223344', conductorName: 'Sunil Mishra', capacity: 40, routeId: routes[0].id, status: 'active' },
      { busNumber: 'Bus-02', registrationNumber: 'MH-04-CD-5678', driverName: 'Mahesh Patil',  driverPhone: '+91-9822334455', conductorName: 'Ganesh More',  capacity: 45, routeId: routes[1].id, status: 'active' },
    ])

    await BusAssignment.bulkCreate([
      { studentId: students[0].id, busId: buses[0].id, pickupStop: 'Andheri West Station', assignedDate: '2024-04-01', status: 'active' },
      { studentId: students[1].id, busId: buses[0].id, pickupStop: 'Jogeshwari Market',    assignedDate: '2024-04-01', status: 'active' },
      { studentId: students[2].id, busId: buses[1].id, pickupStop: 'Dadar TT Circle',      assignedDate: '2024-04-01', status: 'active' },
    ])

    console.log('✅  Seed completed successfully.')
    console.log('\nDemo credentials:')
    console.log('  Principal : principal@school.com / principal123')
    console.log('  Teacher   : teacher1@school.com  / teacher123')
    console.log('  Student   : student1@student.com / student123')
    console.log('  Parent    : parent1@parent.com   / parent123')
    process.exit(0)
  } catch (err) {
    console.error('❌  Seed failed:', err)
    process.exit(1)
  }
}

seed()
