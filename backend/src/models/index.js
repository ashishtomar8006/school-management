const sequelize = require('../config/database')

const SchoolSettings        = require('./SchoolSettings')
const Admin                 = require('./Admin')
const Principal             = require('./Principal')
const User                  = require('./User')
const Teacher               = require('./Teacher')
const Student               = require('./Student')
const Exam                  = require('./Exam')
const ExamSchedule          = require('./ExamSchedule')
const ExamResult            = require('./ExamResult')
const Certificate           = require('./Certificate')
const StudentCategory       = require('./StudentCategory')
const Parent                = require('./Parent')
const ParentStudent         = require('./ParentStudent')
const Section               = require('./Section')
const ClassSection          = require('./ClassSection')
const Subject               = require('./Subject')
const ClassRoom             = require('./ClassRoom')
const Attendance            = require('./Attendance')
const EmployeeAttendance    = require('./EmployeeAttendance')
const Complaint             = require('./Complaint')
const FeeStructure          = require('./FeeStructure')
const FeeRecord             = require('./FeeRecord')
const Homework              = require('./Homework')
const HomeworkSubmission    = require('./HomeworkSubmission')
const Notice                = require('./Notice')
const Conversation          = require('./Conversation')
const ConversationParticipant = require('./ConversationParticipant')
const Message               = require('./Message')
const SalaryRecord          = require('./SalaryRecord')
const Interview             = require('./Interview')
const BusRoute              = require('./BusRoute')
const RouteStop             = require('./RouteStop')
const Bus                   = require('./Bus')
const BusAssignment         = require('./BusAssignment')
const ClassSubject          = require('./ClassSubject')

// ── User ↔ Profile models ──────────────────────────────────────────────────────
User.hasOne(Teacher,  { foreignKey: 'userId', as: 'teacherProfile', onDelete: 'CASCADE' })
User.hasOne(Student,  { foreignKey: 'userId', as: 'studentProfile', onDelete: 'CASCADE' })
User.hasOne(Parent,   { foreignKey: 'userId', as: 'parentProfile',  onDelete: 'CASCADE' })
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Parent.belongsTo(User,  { foreignKey: 'userId', as: 'user' })

// ── Parent ↔ Student (many-to-many) ───────────────────────────────────────────
Parent.belongsToMany(Student, { through: ParentStudent, foreignKey: 'parentId', otherKey: 'studentId', as: 'children' })
Student.belongsToMany(Parent, { through: ParentStudent, foreignKey: 'studentId', otherKey: 'parentId', as: 'parents' })

// ── ClassSection ↔ Teacher ────────────────────────────────────────────────────
ClassSection.belongsTo(Teacher, { foreignKey: 'classTeacherId', as: 'classTeacher', constraints: false })
Teacher.hasMany(ClassSection,   { foreignKey: 'classTeacherId', as: 'classSections' })

// ── ClassSection ↔ Subject (many-to-many via ClassSubject) ───────────────────
ClassSection.belongsToMany(Subject, {
  through: ClassSubject, foreignKey: 'classSectionId', otherKey: 'subjectId', as: 'subjects',
})
Subject.belongsToMany(ClassSection, {
  through: ClassSubject, foreignKey: 'subjectId', otherKey: 'classSectionId', as: 'classSections',
})
ClassSubject.belongsTo(ClassSection, { foreignKey: 'classSectionId', as: 'classSection' })
ClassSubject.belongsTo(Subject,      { foreignKey: 'subjectId',      as: 'subject' })
ClassSubject.belongsTo(Teacher,      { foreignKey: 'teacherId',      as: 'teacher', constraints: false })

// ── Attendance ────────────────────────────────────────────────────────────────
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' })
Attendance.belongsTo(User,    { foreignKey: 'markedById', as: 'markedBy' })
Student.hasMany(Attendance,   { foreignKey: 'studentId', as: 'attendances' })

// ── EmployeeAttendance ────────────────────────────────────────────────────────
EmployeeAttendance.belongsTo(User, { foreignKey: 'employeeId', as: 'employee', constraints: false })

// ── Complaint ─────────────────────────────────────────────────────────────────
Complaint.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' })
Complaint.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedTo', constraints: false })

// ── FeeRecord ─────────────────────────────────────────────────────────────────
FeeRecord.belongsTo(Student,      { foreignKey: 'studentId',      as: 'student' })
FeeRecord.belongsTo(FeeStructure, { foreignKey: 'feeStructureId', as: 'feeStructure', constraints: false })
Student.hasMany(FeeRecord, { foreignKey: 'studentId', as: 'feeRecords' })

// ── Homework ──────────────────────────────────────────────────────────────────
Homework.belongsTo(User,    { foreignKey: 'assignedById', as: 'assignedBy' })
Homework.hasMany(HomeworkSubmission, { foreignKey: 'homeworkId', as: 'submissions', onDelete: 'CASCADE' })
HomeworkSubmission.belongsTo(Homework, { foreignKey: 'homeworkId', as: 'homework' })
HomeworkSubmission.belongsTo(Student,  { foreignKey: 'studentId',  as: 'student' })
Student.hasMany(HomeworkSubmission, { foreignKey: 'studentId', as: 'homeworkSubmissions' })

// ── Notice ────────────────────────────────────────────────────────────────────
Notice.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' })

// ── Messaging ─────────────────────────────────────────────────────────────────
Conversation.belongsToMany(User, { through: ConversationParticipant, foreignKey: 'conversationId', otherKey: 'userId', as: 'participants' })
User.belongsToMany(Conversation, { through: ConversationParticipant, foreignKey: 'userId', otherKey: 'conversationId', as: 'conversations' })
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' })
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' })
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })

// ── Salary ────────────────────────────────────────────────────────────────────
SalaryRecord.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' })
Teacher.hasMany(SalaryRecord,   { foreignKey: 'teacherId', as: 'salaryRecords' })

// ── Interview ─────────────────────────────────────────────────────────────────
Interview.belongsTo(User, { foreignKey: 'interviewerId', as: 'interviewer', constraints: false })

// ── Bus & Routes ──────────────────────────────────────────────────────────────
BusRoute.hasMany(RouteStop, { foreignKey: 'routeId', as: 'stops', onDelete: 'CASCADE' })
RouteStop.belongsTo(BusRoute, { foreignKey: 'routeId', as: 'route' })

BusRoute.hasMany(Bus, { foreignKey: 'routeId', as: 'buses' })
Bus.belongsTo(BusRoute, { foreignKey: 'routeId', as: 'route' })

Bus.hasMany(BusAssignment,    { foreignKey: 'busId', as: 'assignments' })
BusAssignment.belongsTo(Bus,  { foreignKey: 'busId', as: 'bus' })
BusAssignment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' })
Student.hasMany(BusAssignment, { foreignKey: 'studentId', as: 'busAssignments' })

// ── Exam ──────────────────────────────────────────────────────────────────────
Exam.hasMany(ExamSchedule, { foreignKey: 'examId', as: 'schedules', onDelete: 'CASCADE' })
ExamSchedule.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' })

Exam.hasMany(ExamResult, { foreignKey: 'examId', as: 'results', onDelete: 'CASCADE' })
ExamResult.belongsTo(Exam,    { foreignKey: 'examId',    as: 'exam' })
ExamResult.belongsTo(Student, { foreignKey: 'studentId', as: 'student', constraints: false })

// ── Certificate ───────────────────────────────────────────────────────────────
Certificate.belongsTo(Student, { foreignKey: 'studentId', as: 'student', constraints: false })
Student.hasMany(Certificate,   { foreignKey: 'studentId', as: 'certificates' })

// ── Principal ownership ────────────────────────────────────────────────────────
// Core user profiles
Student.belongsTo(Principal, { foreignKey: 'principalId', as: 'principal', constraints: false })
Teacher.belongsTo(Principal, { foreignKey: 'principalId', as: 'principal', constraints: false })
Parent.belongsTo(Principal,  { foreignKey: 'principalId', as: 'principal', constraints: false })
Principal.hasMany(Student, { foreignKey: 'principalId', as: 'students', constraints: false })
Principal.hasMany(Teacher, { foreignKey: 'principalId', as: 'teachers', constraints: false })
Principal.hasMany(Parent,  { foreignKey: 'principalId', as: 'parents',  constraints: false })

// School structure
Section.belongsTo(Principal,      { foreignKey: 'principalId', as: 'principal', constraints: false })
ClassSection.belongsTo(Principal, { foreignKey: 'principalId', as: 'principal', constraints: false })
ClassRoom.belongsTo(Principal,    { foreignKey: 'principalId', as: 'principal', constraints: false })
Subject.belongsTo(Principal,      { foreignKey: 'principalId', as: 'principal', constraints: false })
StudentCategory.belongsTo(Principal, { foreignKey: 'principalId', as: 'principal', constraints: false })
SchoolSettings.belongsTo(Principal,  { foreignKey: 'principalId', as: 'principal', constraints: false })
Principal.hasOne(SchoolSettings, { foreignKey: 'principalId', as: 'settings', constraints: false })

// Transport
BusRoute.belongsTo(Principal, { foreignKey: 'principalId', as: 'principal', constraints: false })
Bus.belongsTo(Principal,      { foreignKey: 'principalId', as: 'principal', constraints: false })

// Academic
Homework.belongsTo(Principal,  { foreignKey: 'principalId', as: 'principal', constraints: false })
Notice.belongsTo(Principal,    { foreignKey: 'principalId', as: 'principal', constraints: false })
Exam.belongsTo(Principal,      { foreignKey: 'principalId', as: 'principal', constraints: false })
ExamResult.belongsTo(Principal,{ foreignKey: 'principalId', as: 'principal', constraints: false })
Certificate.belongsTo(Principal,{ foreignKey: 'principalId', as: 'principal', constraints: false })
Attendance.belongsTo(Principal, { foreignKey: 'principalId', as: 'principal', constraints: false })

// Financial & HR
FeeStructure.belongsTo(Principal, { foreignKey: 'principalId', as: 'principal', constraints: false })
FeeRecord.belongsTo(Principal,    { foreignKey: 'principalId', as: 'principal', constraints: false })
SalaryRecord.belongsTo(Principal, { foreignKey: 'principalId', as: 'principal', constraints: false })
Interview.belongsTo(Principal,    { foreignKey: 'principalId', as: 'principal', constraints: false })
Complaint.belongsTo(Principal,    { foreignKey: 'principalId', as: 'principal', constraints: false })

module.exports = {
  sequelize,
  SchoolSettings,
  Admin,
  Principal,
  User,
  Teacher,
  Student,
  Parent,
  ParentStudent,
  ClassSection,
  Subject,
  ClassRoom,
  Attendance,
  EmployeeAttendance,
  Complaint,
  FeeStructure,
  FeeRecord,
  Homework,
  HomeworkSubmission,
  Notice,
  Conversation,
  ConversationParticipant,
  Message,
  SalaryRecord,
  Interview,
  BusRoute,
  RouteStop,
  Bus,
  BusAssignment,
  StudentCategory,
  ClassSubject,
  Section,
  Exam,
  ExamSchedule,
  ExamResult,
  Certificate,
}
