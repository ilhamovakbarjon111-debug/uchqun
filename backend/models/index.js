import sequelize from '../config/database.js';
import User from './User.js';
import Document from './Document.js';
import ParentActivity from './ParentActivity.js';
import ParentMeal from './ParentMeal.js';
import ParentMedia from './ParentMedia.js';
import TeacherResponsibility from './TeacherResponsibility.js';
import TeacherTask from './TeacherTask.js';
import TeacherWorkHistory from './TeacherWorkHistory.js';
import Progress from './Progress.js';
import Group from './Group.js';
import Child from './Child.js';
import Activity from './Activity.js';
import Media from './Media.js';
import Meal from './Meal.js';
import Notification from './Notification.js';
import TeacherRating from './TeacherRating.js';
import ChatMessage from './ChatMessage.js';
import School from './School.js';
import SchoolRating from './SchoolRating.js';
import SuperAdminMessage from './SuperAdminMessage.js';
import AdminRegistrationRequest from './AdminRegistrationRequest.js';
import EmotionalMonitoring from './EmotionalMonitoring.js';

// Initialize all models
const models = {
  User,
  Document,
  ParentActivity,
  ParentMeal,
  ParentMedia,
  TeacherResponsibility,
  TeacherTask,
  TeacherWorkHistory,
  Progress,
  Group,
  Child,
  Activity,
  Media,
  Meal,
  Notification,
  TeacherRating,
  ChatMessage,
  School,
  SchoolRating,
  SuperAdminMessage,
  AdminRegistrationRequest,
  EmotionalMonitoring,
  sequelize,
};

// Define model relationships
// User -> Document (One-to-Many: Reception can have multiple documents)
User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> Document (reviewedBy relationship: Admin reviews documents)
User.hasMany(Document, { foreignKey: 'reviewedBy', as: 'reviewedDocuments' });
Document.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// User -> ParentActivity (One-to-Many: Parent has multiple activities)
User.hasMany(ParentActivity, { foreignKey: 'parentId', as: 'activities' });
ParentActivity.belongsTo(User, { foreignKey: 'parentId', as: 'parent' });

// User -> ParentMeal (One-to-Many: Parent has multiple meals)
User.hasMany(ParentMeal, { foreignKey: 'parentId', as: 'meals' });
ParentMeal.belongsTo(User, { foreignKey: 'parentId', as: 'parent' });

// User -> ParentMedia (One-to-Many: Parent has multiple media files)
User.hasMany(ParentMedia, { foreignKey: 'parentId', as: 'media' });
ParentMedia.belongsTo(User, { foreignKey: 'parentId', as: 'parent' });

// User -> TeacherResponsibility (One-to-Many: Teacher has multiple responsibilities)
User.hasMany(TeacherResponsibility, { foreignKey: 'teacherId', as: 'responsibilities' });
TeacherResponsibility.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// User -> TeacherTask (One-to-Many: Teacher has multiple tasks)
User.hasMany(TeacherTask, { foreignKey: 'teacherId', as: 'tasks' });
TeacherTask.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// User -> TeacherWorkHistory (One-to-Many: Teacher has multiple work history records)
User.hasMany(TeacherWorkHistory, { foreignKey: 'teacherId', as: 'workHistory' });
TeacherWorkHistory.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// User -> User (teacher relationship: Parent belongs to a Teacher)
User.belongsTo(User, { foreignKey: 'teacherId', as: 'assignedTeacher' });
User.hasMany(User, { foreignKey: 'teacherId', as: 'assignedParents' });

// User -> Group (parent belongs to a group)
User.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });
Group.hasMany(User, { foreignKey: 'groupId', as: 'parents' });

// User -> Notification (One-to-Many: User has multiple notifications)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> Child (One-to-Many: Parent has multiple children)
User.hasMany(Child, { foreignKey: 'parentId', as: 'children' });
Child.belongsTo(User, { foreignKey: 'parentId', as: 'parent' });

// Child -> Notification (One-to-Many: Child has multiple notifications)
Child.hasMany(Notification, { foreignKey: 'childId', as: 'notifications' });
Notification.belongsTo(Child, { foreignKey: 'childId', as: 'child' });

// Teacher ratings
User.hasMany(TeacherRating, { foreignKey: 'teacherId', as: 'receivedRatings' });
User.hasMany(TeacherRating, { foreignKey: 'parentId', as: 'givenRatings' });
TeacherRating.belongsTo(User, { foreignKey: 'teacherId', as: 'ratedTeacher' });
TeacherRating.belongsTo(User, { foreignKey: 'parentId', as: 'ratingParent' });

// Chat messages
User.hasMany(ChatMessage, { foreignKey: 'senderId', as: 'sentMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// School ratings
School.hasMany(SchoolRating, { foreignKey: 'schoolId', as: 'ratings' });
SchoolRating.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });
User.hasMany(SchoolRating, { foreignKey: 'parentId', as: 'schoolRatings' });
SchoolRating.belongsTo(User, { foreignKey: 'parentId', as: 'ratingParent' });

// Child -> School (child belongs to a school)
Child.belongsTo(School, { foreignKey: 'schoolId', as: 'childSchool' });
School.hasMany(Child, { foreignKey: 'schoolId', as: 'schoolChildren' });

// Child -> Group (child belongs to a group)
Child.belongsTo(Group, { foreignKey: 'groupId', as: 'childGroup' });
Group.hasMany(Child, { foreignKey: 'groupId', as: 'groupChildren' });

// Super Admin Messages
User.hasMany(SuperAdminMessage, { foreignKey: 'senderId', as: 'superAdminMessages' });
SuperAdminMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Admin Registration Requests
User.hasMany(AdminRegistrationRequest, { foreignKey: 'reviewedBy', as: 'reviewedAdminRequests' });
AdminRegistrationRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });
User.hasOne(AdminRegistrationRequest, { foreignKey: 'approvedUserId', as: 'adminRegistrationRequest' });
AdminRegistrationRequest.belongsTo(User, { foreignKey: 'approvedUserId', as: 'approvedUser' });

// Emotional Monitoring
Child.hasMany(EmotionalMonitoring, { foreignKey: 'childId', as: 'emotionalMonitoring' });
EmotionalMonitoring.belongsTo(Child, { foreignKey: 'childId', as: 'child' });
User.hasMany(EmotionalMonitoring, { foreignKey: 'teacherId', as: 'emotionalMonitoringRecords' });
EmotionalMonitoring.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// Sync database (use with caution in production)
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ force });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default models;

