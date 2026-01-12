import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Calendar, 
  CheckCircle2,
  Clock, 
  Dumbbell, 
  Edit2,
  Filter,
  MessageCircle,
  Plus,
  Save,
  Trash2,
  User, 
  Users,
  X
} from 'lucide-react';
import Card from '../shared/components/Card';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import { useAuth } from '../shared/context/AuthContext';
import { useToast } from '../shared/context/ToastContext';
import api from '../shared/services/api';
import { useTranslation } from 'react-i18next';

const Activities = () => {
  const { isTeacher, user } = useAuth();
  const { success, error: showError } = useToast();
  const { t, i18n } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    parentId: '',
    childId: '',
    title: '',
    description: '',
    type: 'Learning',
    duration: 30,
    date: new Date().toISOString().split('T')[0],
    studentEngagement: 'Medium',
    teacher: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Teacher',
    // Individual Plan fields
    skill: '',
    goal: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tasks: [''],
    methods: '',
    progress: '',
    observation: '',
  });
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);

  const locale = (() => {
    if (i18n.language === 'uz') return 'uz-UZ';
    if (i18n.language === 'ru') return 'ru-RU';
    return 'en-US';
  })();

  useEffect(() => {
    loadActivities();
    if (isTeacher) {
      loadParents();
    }
  }, [isTeacher]);

  const loadParents = async () => {
    try {
      const parentsRes = await api.get('/teacher/parents');
      const parentsList = Array.isArray(parentsRes.data.parents) ? parentsRes.data.parents : [];
      setParents(parentsList);
      
      // If only one parent, auto-select them
      if (parentsList.length === 1 && !formData.parentId) {
        const parentId = parentsList[0].id;
        setFormData(prev => ({ ...prev, parentId }));
        await loadChildrenForParent(parentId);
      }
    } catch (error) {
      console.error('Error loading parents:', error);
    }
  };

  const loadChildrenForParent = async (parentId) => {
    try {
      // Reload parents to ensure we have latest data
      const parentsRes = await api.get('/teacher/parents');
      const parentsList = Array.isArray(parentsRes.data.parents) ? parentsRes.data.parents : [];
      setParents(parentsList);
      
      const selectedParent = parentsList.find(p => p.id === parentId);
      if (selectedParent && selectedParent.children && Array.isArray(selectedParent.children)) {
        setChildren(selectedParent.children);
        if (selectedParent.children.length > 0) {
          setFormData(prev => ({ ...prev, childId: prev.childId || selectedParent.children[0].id }));
        } else {
          setFormData(prev => ({ ...prev, childId: '' }));
        }
      } else {
        setChildren([]);
        setFormData(prev => ({ ...prev, childId: '' }));
      }
    } catch (error) {
      console.error('Error loading children for parent:', error);
      setChildren([]);
      setFormData(prev => ({ ...prev, childId: '' }));
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activities');
      setActivities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading activities:', error);
      showError(error.response?.data?.error || t('activitiesPage.toastLoadError'));
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setEditingActivity(null);
    
    // Ensure parents are loaded
    if (parents.length === 0) {
      await loadParents();
    }
    
    const firstParent = parents.length > 0 ? parents[0] : null;
    const firstChild = firstParent && firstParent.children && firstParent.children.length > 0 
      ? firstParent.children[0].id : '';
    
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    const endDateDefault = threeMonthsLater.toISOString().split('T')[0];
    
    setFormData({
      parentId: firstParent ? firstParent.id : '',
      childId: firstChild,
      title: '',
      description: '',
      type: 'Learning',
      duration: 30,
      date: today,
      studentEngagement: 'Medium',
      teacher: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Teacher',
      // Individual Plan fields
      skill: '',
      goal: '',
      startDate: today,
      endDate: endDateDefault,
      tasks: [''],
      methods: '',
      progress: '',
      observation: '',
    });
    
    if (firstParent) {
      await loadChildrenForParent(firstParent.id);
    }
    
    setShowModal(true);
  };

  const handleEdit = async (activity) => {
    setEditingActivity(activity);
    
    // Find parent for this child
    let parentId = '';
    if (activity.child && activity.child.id) {
      const parent = parents.find(p => 
        p.children && p.children.some(c => c.id === activity.child.id)
      );
      if (parent) {
        parentId = parent.id;
        loadChildrenForParent(parent.id);
      }
    }
    
    setFormData({
      parentId: parentId,
      childId: activity.childId || '',
      title: activity.title || '',
      description: activity.description || '',
      type: activity.type || 'Learning',
      duration: activity.duration || 30,
      date: activity.date ? activity.date.split('T')[0] : new Date().toISOString().split('T')[0],
      studentEngagement: activity.studentEngagement || 'Medium',
      notes: activity.notes || '',
      teacher: activity.teacher || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Teacher'),
      // Individual Plan fields
      skill: activity.skill || '',
      goal: activity.goal || '',
      startDate: activity.startDate ? activity.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: activity.endDate ? activity.endDate.split('T')[0] : '',
      tasks: Array.isArray(activity.tasks) && activity.tasks.length > 0 ? activity.tasks : [''],
      methods: activity.methods || '',
      progress: activity.progress || '',
      observation: activity.observation || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (activityId) => {
    if (!window.confirm(t('activitiesPage.confirmDelete'))) {
      return;
    }

    try {
      await api.delete(`/activities/${activityId}`);
      success(t('activitiesPage.toastDelete'));
      loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      showError(error.response?.data?.error || t('activitiesPage.toastError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingActivity) {
        await api.put(`/activities/${editingActivity.id}`, formData);
        success(t('activitiesPage.toastUpdate'));
      } else {
        if (!formData.childId) {
          showError(t('activitiesPage.selectChildError'));
          return;
        }
        await api.post('/activities', formData);
        success(t('activitiesPage.toastCreate'));

      }
      
      setShowModal(false);
      loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      showError(error.response?.data?.error || t('activitiesPage.toastError'));
    }
  };

  const filteredActivities =
    filter === 'all'
      ? activities
      : activities.filter((activity) => activity.type.toLowerCase() === filter.toLowerCase());

  const activityTypes = [
    { id: 'all', label: t('activitiesPage.filterAll'), icon: Filter },
    { id: 'learning', label: t('activitiesPage.filterLearning'), icon: BookOpen },
    { id: 'therapy', label: t('activitiesPage.filterTherapy'), icon: Brain },
    { id: 'social', label: t('activitiesPage.filterSocial'), icon: Users },
    { id: 'physical', label: t('activitiesPage.filterPhysical'), icon: Dumbbell },
  ];

  const getEngagementStyles = (level) => {
    switch (level) {
      case 'High': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{t('activitiesPage.title')}</h1>
          <p className="text-gray-500 text-lg">{t('activitiesPage.subtitle')}</p>
        </div>

        {/* Add Button (Teachers only) */}
        {isTeacher && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">{t('activitiesPage.add')}</span>
          </button>
        )}
      </div>

      {/* Modern Filter Chips */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-3 p-2 bg-gray-100/50 rounded-2xl w-fit">
          {activityTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                filter === type.id
                  ? 'bg-white text-orange-600 shadow-sm scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              
              {/* Timeline Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-orange-600 text-white shadow absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 group-hover:scale-125 transition-transform duration-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>

              {/* Activity Card */}
              <div className="w-[calc(100%-4rem)] md:w-[45%] bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ml-auto md:ml-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                    {activity.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {t('activitiesPage.duration', { count: activity.duration })}
                    </div>
                    {/* Action Buttons (Teachers only) */}
                    {isTeacher && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(activity)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {activity.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {activity.description}
                </p>

                {/* Tags & Meta */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-tight ${getEngagementStyles(activity.studentEngagement)}`}>
                    {t('activitiesPage.engagement')}: {activity.studentEngagement}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                    <User className="w-3 h-3" /> {activity.teacher}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(activity.date).toLocaleDateString(locale)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
            <Filter className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium text-lg">{t('activitiesPage.empty')}</p>
          </div>
        )}
      </div>


      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingActivity ? t('activitiesPage.editTitle') : t('activitiesPage.createTitle')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {isTeacher && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('activitiesPage.parent') || 'Ota-ona'}
                    </label>
                    <select
                      required
                      value={formData.parentId}
                      onChange={(e) => {
                        const selectedParentId = e.target.value;
                        setFormData(prev => ({ ...prev, parentId: selectedParentId, childId: '' }));
                        if (selectedParentId) {
                          loadChildrenForParent(selectedParentId);
                        } else {
                          setChildren([]);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">{t('activitiesPage.selectParent') || 'Ota-onani tanlang'}</option>
                      {parents.map(parent => (
                        <option key={parent.id} value={parent.id}>
                          {parent.firstName} {parent.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('activitiesPage.child')}
                    </label>
                    <select
                      required
                      value={formData.childId}
                      onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                      disabled={!formData.parentId || children.length === 0}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">{t('activitiesPage.selectChild')}</option>
                      {children.map(child => (
                        <option key={child.id} value={child.id}>
                          {child.firstName} {child.lastName}
                        </option>
                      ))}
                    </select>
                    {formData.parentId && children.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">{t('activitiesPage.noChildren') || 'Bu ota-onada bolalar yo\'q'}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('activitiesPage.formTitle')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('activitiesPage.formDescription')}
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formType')}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Learning">{t('activitiesPage.filterLearning')}</option>
                    <option value="Therapy">{t('activitiesPage.filterTherapy')}</option>
                    <option value="Social">{t('activitiesPage.filterSocial')}</option>
                    <option value="Physical">{t('activitiesPage.filterPhysical')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formDuration')}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formDate')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formEngagement')}
                  </label>
                  <select
                    value={formData.studentEngagement}
                    onChange={(e) => setFormData({ ...formData, studentEngagement: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Individual Plan Fields */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('activitiesPage.individualPlan') || 'Individual reja'}</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formSkill') || 'Ko\'nikma'}
                  </label>
                  <input
                    type="text"
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={t('activitiesPage.formSkillPlaceholder') || 'Masalan: O\'z-o\'ziga xizmat ko\'rsatish ko\'nikmalari'}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formGoal') || 'Maqsad'}
                  </label>
                  <textarea
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={t('activitiesPage.formGoalPlaceholder') || 'Maqsadni batafsil yozing'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('activitiesPage.formStartDate') || 'Vazifalar tuzilgan sana'}
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('activitiesPage.formEndDate') || 'Maqsadlarga erishish muddati'}
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formTasks') || 'Vazifalar'}
                  </label>
                  {formData.tasks.map((task, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => {
                          const newTasks = [...formData.tasks];
                          newTasks[index] = e.target.value;
                          setFormData({ ...formData, tasks: newTasks });
                        }}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder={`${t('activitiesPage.formTask') || 'Vazifa'} ${index + 1}`}
                      />
                      {formData.tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newTasks = formData.tasks.filter((_, i) => i !== index);
                            setFormData({ ...formData, tasks: newTasks });
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tasks: [...formData.tasks, ''] })}
                    className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + {t('activitiesPage.addTask') || 'Vazifa qo\'shish'}
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formMethods') || 'Usullar'}
                  </label>
                  <textarea
                    value={formData.methods}
                    onChange={(e) => setFormData({ ...formData, methods: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={t('activitiesPage.formMethodsPlaceholder') || 'Qo\'llaniladigan usullarni yozing'}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formProgress') || 'Jarayon/Taraqqiyot'}
                  </label>
                  <textarea
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={t('activitiesPage.formProgressPlaceholder') || 'Jarayon va taraqqiyotni yozing'}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formObservation') || 'Kuzatish'}
                  </label>
                  <textarea
                    value={formData.observation}
                    onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={t('activitiesPage.formObservationPlaceholder') || 'Kuzatuvlarni yozing'}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('activitiesPage.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingActivity ? t('activitiesPage.update') : t('activitiesPage.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;

