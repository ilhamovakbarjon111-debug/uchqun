import { useEffect, useState } from 'react';
import { 
  Calendar, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  FileX,
  Plus,
  Save,
  Trash2,
  User,
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
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    parentId: '',
    childId: '',
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
    services: [],
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
      services: [],
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
      services: Array.isArray(activity.services) ? activity.services : [],
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
        if (!formData.skill || !formData.goal || !formData.startDate || !formData.endDate) {
          showError(t('activitiesPage.requiredFieldsError') || 'Ko\'nikma, maqsad, boshlanish va tugash sanalari to\'ldirilishi shart');
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

  const filteredActivities = activities; // Individual plans don't use type filter
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (activityId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedRows(newExpanded);
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


      {/* Activities Cards Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => {
            const isExpanded = expandedRows.has(activity.id);
            return (
              <div
                key={activity.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {activity.skill || t('activitiesPage.formSkill') || 'Ko\'nikma'}
                      </h3>
                      {activity.goal && (
                        <p className="text-sm text-orange-50 line-clamp-2">
                          {activity.goal.length > 80 ? `${activity.goal.substring(0, 80)}...` : activity.goal}
                        </p>
                      )}
                    </div>
                    {isTeacher && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(activity);
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
                          title={t('activitiesPage.edit') || 'Tahrirlash'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(activity.id);
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
                          title={t('activitiesPage.delete') || 'O\'chirish'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    {activity.startDate && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-blue-600 font-semibold mb-0.5">{t('activitiesPage.formStartDate') || 'Boshlanish'}</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {new Date(activity.startDate).toLocaleDateString(locale)}
                          </p>
                        </div>
                      </div>
                    )}
                    {activity.endDate && (
                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-purple-600 font-semibold mb-0.5">{t('activitiesPage.formEndDate') || 'Tugash'}</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {new Date(activity.endDate).toLocaleDateString(locale)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Teacher */}
                  {activity.teacher && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-200">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">{t('activitiesPage.teacher') || 'O\'qituvchi'}</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{activity.teacher}</p>
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {activity.services && Array.isArray(activity.services) && activity.services.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">{t('activitiesPage.formServices') || 'Xizmatlar'}</p>
                      <div className="flex flex-wrap gap-2">
                        {activity.services.slice(0, 3).map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-200/50"
                          >
                            {t(`activitiesPage.services.${service.replace(/\s+/g, '')}`) || service}
                          </span>
                        ))}
                        {activity.services.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200">
                            +{activity.services.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleRow(activity.id)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-orange-100 rounded-xl text-gray-700 hover:text-orange-600 transition-all duration-200 font-semibold text-sm"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        {t('activitiesPage.hideDetails') || 'Yashirish'}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        {t('activitiesPage.showDetails') || 'Batafsil'}
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-orange-50/30 p-5 space-y-4 animate-in fade-in duration-300">
                    {activity.tasks && Array.isArray(activity.tasks) && activity.tasks.length > 0 && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          {t('activitiesPage.formTasks') || 'Vazifalar'}
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-700">
                          {activity.tasks.map((task, idx) => task && (
                            <li key={idx} className="leading-relaxed">{task}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {activity.methods && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          {t('activitiesPage.formMethods') || 'Usullar'}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{activity.methods}</p>
                      </div>
                    )}
                    {activity.progress && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          {t('activitiesPage.formProgress') || 'Jarayon/Taraqqiyot'}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{activity.progress}</p>
                      </div>
                    )}
                    {activity.observation && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <p className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          {t('activitiesPage.formObservation') || 'Kuzatish'}
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{activity.observation}</p>
                      </div>
                    )}
                    {activity.services && Array.isArray(activity.services) && activity.services.length > 0 && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          {t('activitiesPage.formServices') || 'Barcha xizmatlar'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activity.services.map((service, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-200/50"
                            >
                              {t(`activitiesPage.services.${service.replace(/\s+/g, '')}`) || service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
          <FileX className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">{t('activitiesPage.empty')}</p>
        </div>
      )}


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

              {/* Individual Plan Fields */}
              <div>
                
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('activitiesPage.formServices') || 'Xizmatlar'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Logoped',
                      'Defektolog',
                      'SurdoPedagok',
                      'AbA teropiya',
                      'Ergoteropiya',
                      'Izo',
                      'SBO',
                      'Musiqa',
                      'Ipoteropiya',
                      'Umumiy Massaj',
                      'GidroVanna',
                      'LogoMassaj',
                      'CME',
                      'Issiq ovqat',
                      'Transport xizmati',
                    ].map((service) => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                services: [...formData.services, service],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                services: formData.services.filter((s) => s !== service),
                              });
                            }
                          }}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">
                          {t(`activitiesPage.services.${service.replace(/\s+/g, '')}`) || service}
                        </span>
                      </label>
                    ))}
                  </div>
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

