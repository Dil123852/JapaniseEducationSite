export type Language = 'en';

export interface Translations {
  // Auth
  login: string;
  signup: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  accountType: string;
  student: string;
  teacher: string;
  logout: string;
  
  // Common
  loading: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  create: string;
  back: string;
  submit: string;
  
  // Dashboard
  teacherDashboard: string;
  studentDashboard: string;
  courseManagement: string;
  analytics: string;
  myCourses: string;
  enrollCourse: string;
  
  // Courses
  courses: string;
  course: string;
  createCourse: string;
  courseTitle: string;
  description: string;
  enrollmentKey: string;
  generateKey: string;
  students: string;
  groups: string;
  enrolledStudents: string;
  active: string;
  blocked: string;
  restricted: string;
  reactivate: string;
  block: string;
  restrict: string;
  remove: string;
  
  // Tests
  tests: string;
  test: string;
  createTest: string;
  testTitle: string;
  duration: string;
  minutes: string;
  takeTest: string;
  submitTest: string;
  testSubmitted: string;
  score: string;
  points: string;
  
  // Videos
  videos: string;
  video: string;
  listeningVideos: string;
  watchVideo: string;
  
  // PDFs
  materials: string;
  pdfs: string;
  download: string;
  downloading: string;
  
  // Notifications
  notifications: string;
  notification: string;
  createNotification: string;
  
  // Work Plan
  workPlan: string;
  learningPlan: string;
  
  // Analytics
  totalStudents: string;
  activeStudents: string;
  totalTests: string;
  averageScore: string;
  totalVideos: string;
  totalWatchTime: string;
  totalDownloads: string;
  
  // Messages
  noCourses: string;
  noStudents: string;
  noTests: string;
  noVideos: string;
  noPDFs: string;
  noNotifications: string;
  noWorkPlan: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    accountType: 'Account Type',
    student: 'Student',
    teacher: 'Teacher',
    logout: 'Logout',
    
    // Common
    loading: 'Loading...',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    back: 'Back',
    submit: 'Submit',
    
    // Dashboard
    teacherDashboard: 'Teacher Dashboard',
    studentDashboard: 'Student Dashboard',
    courseManagement: 'Course Management',
    analytics: 'Analytics',
    myCourses: 'My Courses',
    enrollCourse: 'Enroll in Course',
    
    // Courses
    courses: 'Courses',
    course: 'Course',
    createCourse: 'Create Course',
    courseTitle: 'Course Title',
    description: 'Description',
    enrollmentKey: 'Enrollment Key',
    generateKey: 'Generate',
    students: 'Students',
    groups: 'Groups',
    enrolledStudents: 'Enrolled Students',
    active: 'Active',
    blocked: 'Blocked',
    restricted: 'Restricted',
    reactivate: 'Reactivate',
    block: 'Block',
    restrict: 'Restrict',
    remove: 'Remove',
    
    // Tests
    tests: 'Tests',
    test: 'Test',
    createTest: 'Create Test',
    testTitle: 'Test Title',
    duration: 'Duration',
    minutes: 'minutes',
    takeTest: 'Take Test',
    submitTest: 'Submit Test',
    testSubmitted: 'Test Submitted',
    score: 'Score',
    points: 'points',
    
    // Videos
    videos: 'Videos',
    video: 'Video',
    listeningVideos: 'Listening Videos',
    watchVideo: 'Watch Video',
    
    // PDFs
    materials: 'Materials',
    pdfs: 'PDFs',
    download: 'Download',
    downloading: 'Downloading...',
    
    // Notifications
    notifications: 'Notifications',
    notification: 'Notification',
    createNotification: 'Create Notification',
    
    // Work Plan
    workPlan: 'Work Plan',
    learningPlan: 'Learning Plan',
    
    // Analytics
    totalStudents: 'Total Students',
    activeStudents: 'Active Students',
    totalTests: 'Total Tests',
    averageScore: 'Average Score',
    totalVideos: 'Total Videos',
    totalWatchTime: 'Total Watch Time',
    totalDownloads: 'Total Downloads',
    
    // Messages
    noCourses: 'No courses yet',
    noStudents: 'No students enrolled yet',
    noTests: 'No tests yet',
    noVideos: 'No videos yet',
    noPDFs: 'No materials yet',
    noNotifications: 'No notifications yet',
    noWorkPlan: 'No work plan yet',
  },
};

