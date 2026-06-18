// User Roles
export type UserRole = 'principal' | 'teacher' | 'student' | 'parent'

// User Types
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  joinDate?: string
}

export interface Teacher extends User {
  department: string
  qualification: string
  experience: number
  classes: string[]
  subjects: string[]
}

export interface Student extends User {
  rollNumber: string
  class: string
  section: string
  fatherName: string
  motherName?: string
  dob: string
  enrollmentDate: string
}

export interface Parent extends User {
  childrenIds: string[]
  occupation?: string
  emergencyContact?: string
}

// Attendance
export interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks?: string
}

export interface AttendanceReport {
  studentId: string
  studentName: string
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  percentage: number
}

// Complaints
export interface Complaint {
  id: string
  complaintId: string
  title: string
  description: string
  category: 'academic' | 'discipline' | 'bullying' | 'facilities' | 'other'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdBy: string
  createdByName: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  resolution?: string
}

// Fees
export interface FeeStructure {
  id: string
  class: string
  section: string
  feeType: string
  amount: number
  dueDate: string
  frequency: 'monthly' | 'quarterly' | 'half-yearly' | 'annual'
}

export interface FeeRecord {
  id: string
  studentId: string
  studentName: string
  feeType: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'paid' | 'pending' | 'overdue'
  paymentMethod?: string
}

// Homework
export interface Homework {
  id: string
  title: string
  description: string
  subject: string
  class: string
  section: string
  dueDate: string
  assignedBy: string
  createdAt: string
  attachments?: string[]
  submissions?: HomeworkSubmission[]
}

export interface HomeworkSubmission {
  id: string
  homeworkId: string
  studentId: string
  studentName: string
  submittedAt: string
  marks?: number
  feedback?: string
  attachments?: string[]
}

// Notices
export interface Notice {
  id: string
  title: string
  content: string
  category: 'general' | 'academic' | 'event' | 'urgent'
  audience: 'all' | 'teachers' | 'students' | 'parents' | 'staff'
  createdBy: string
  createdAt: string
  expiryDate?: string
  attachments?: string[]
}

// Communication
export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  attachments?: string[]
  read: boolean
}

export interface Conversation {
  id: string
  participants: User[]
  lastMessage?: Message
  updatedAt: string
}

// Reports & Analytics
export interface AnalyticsData {
  totalStudents: number
  totalTeachers: number
  averageAttendance: number
  pendingComplaints: number
  overdueFees: number
  noticeCount: number
}

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

// Salary Management
export interface SalaryRecord {
  id: string
  teacherId: string
  teacherName: string
  month: string
  year: number
  baseSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: 'pending' | 'processed' | 'paid'
  paymentDate?: string
  paymentMethod?: string
  remarks?: string
}

export interface SalaryStructure {
  id: string
  baseSalary: number
  da: number // Dearness Allowance
  hra: number // House Rent Allowance
  conveyance: number
  medicalAllowance: number
  otherAllowances: number
  pf: number // Provident Fund
  tax: number
  otherDeductions: number
}

// Interview Management
export interface InterviewCandidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  qualifications: string
  experience: number
  resume?: string
  appliedDate: string
  status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'offered' | 'rejected' | 'selected'
  interviewDate?: string
  interviewTime?: string
  interviewer?: string
  feedback?: string
  rating?: number
}

// Access Control & Permissions
export interface RolePermission {
  roleId: string
  roleName: UserRole
  permissions: PermissionSet
}

export interface PermissionSet {
  attendance: {
    view: boolean
    mark: boolean
    editRecords: boolean
    viewReports: boolean
  }
  teachers: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    manageSalary: boolean
  }
  students: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
  }
  complaints: {
    view: boolean
    create: boolean
    resolve: boolean
    assignTo: boolean
  }
  fees: {
    view: boolean
    manageFees: boolean
    processPayments: boolean
    generateReports: boolean
  }
  notices: {
    view: boolean
    create: boolean
    publish: boolean
    delete: boolean
  }
  homework: {
    view: boolean
    create: boolean
    grade: boolean
    viewSubmissions: boolean
  }
  reports: {
    view: boolean
    generate: boolean
    export: boolean
  }
  messages: {
    send: boolean
    receive: boolean
    viewAll: boolean
  }
  salaries: {
    view: boolean
    manage: boolean
    process: boolean
    viewReports: boolean
  }
  interviews: {
    view: boolean
    create: boolean
    schedule: boolean
    feedback: boolean
  }
}

// Classes Module
export interface ClassSection {
  id: string
  className: string
  sectionName: string
  classTeacher: string
  totalStudents: number
  academicYear: string
  capacity: number
}

export interface Subject {
  id: string
  subjectCode: string
  subjectName: string
  subjectType: 'theoretical' | 'practical' | 'both'
  credits: number
  department: string
  description?: string
}

export interface ClassRoom {
  id: string
  roomNumber: string
  capacity: number
  floor: number
  facilities: string[]
  assignedClass?: string
  maintenanceStatus: 'good' | 'fair' | 'needs_repair'
}

export interface ClassListItem {
  id: string
  classId: string
  studentId: string
  studentName: string
  rollNumber: number
  fatherName: string
  email: string
  phone: string
  section: string
  joinedDate: string
  currentStatus: 'active' | 'inactive' | 'graduated'
}

// Teacher Extended
export interface TeacherTimetable {
  id: string
  teacherId: string
  teacherName: string
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  startTime: string
  endTime: string
  classSection: string
  subject: string
  roomNumber: string
}

// Attendance Extended
export interface EmployeeAttendance {
  id: string
  employeeId: string
  employeeName: string
  employeeType: 'teacher' | 'admin' | 'support'
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave'
  leaveType?: string
  remarks?: string
}

// Bus Routes Module
export interface RouteStop {
  id: string
  stopName: string
  pickupTime: string
  dropTime: string
  order: number
  landmark?: string
}

export interface BusRoute {
  id: string
  routeName: string
  startPoint: string
  endPoint: string
  stops: RouteStop[]
  totalDistance: string
  estimatedTime: string
  status: 'active' | 'inactive'
}

export interface Bus {
  id: string
  busNumber: string
  registrationNumber: string
  driverName: string
  driverPhone: string
  conductorName?: string
  conductorPhone?: string
  capacity: number
  routeId: string
  status: 'active' | 'maintenance' | 'inactive'
  yearOfManufacture?: string
}

export interface BusStudentAssignment {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  studentSection: string
  busId: string
  pickupStop: string
  assignedDate: string
  status: 'active' | 'inactive'
}
