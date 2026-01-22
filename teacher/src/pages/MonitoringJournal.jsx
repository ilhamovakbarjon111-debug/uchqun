import { useEffect, useState } from 'react';
import { 
  Calendar, 
  CheckCircle2,
  ChevronDown,
  Edit2,
  FileX,
  Plus,
  Save,
  Trash2,
  User,
  X,
  Baby,
  Heart,
} from 'lucide-react';
import Card from '../shared/components/Card';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import { useAuth } from '../shared/context/AuthContext';
import { useToast } from '../shared/context/ToastContext';
import api from '../shared/services/api';
import { useTranslation } from 'react-i18next';

const MonitoringJournal = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const { t } = useTranslation();
  const [monitoringRecords, setMonitoringRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState({
    childId: '',
    date: new Date().toISOString().split('T')[0],
    emotionalState: {
      stable: false,
      positiveEmotions: false,
      noAnxiety: false,
      noHostility: false,
      calmResponse: false,
      showsEmpathy: false,
      quickRecovery: false,
      stableMood: false,
      trustingRelationship: false,
    },
    notes: '',
    teacherSignature: '',
  });
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState('');

  useEffect(() => {
    loadMonitoringRecords();
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const response = await api.get('/teacher/parents');
      const parentsList = Array.isArray(response.data.parents) ? response.data.parents : [];
      setParents(parentsList);
<<<<<<< HEAD
      
=======

>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
      // Collect all children
      const allChildren = [];
      parentsList.forEach(parent => {
        if (parent.children && Array.isArray(parent.children)) {
          parent.children.forEach(child => {
            allChildren.push({ ...child, parentName: `${parent.firstName} ${parent.lastName}` });
          });
        }
      });
      setChildren(allChildren);
    } catch (error) {
      console.error('Error loading parents:', error);
<<<<<<< HEAD
      showError('Failed to load parents');
=======
      showError(t('monitoring.toastLoadParentsError'));
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
    }
  };

  const loadMonitoringRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/emotional-monitoring');
      const records = Array.isArray(response.data.data) ? response.data.data : [];
      setMonitoringRecords(records);
    } catch (error) {
      console.error('Error loading monitoring records:', error);
<<<<<<< HEAD
      showError('Failed to load monitoring records');
=======
      showError(t('monitoring.toastLoadError'));
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (child = null, record = null) => {
    if (record) {
      // Editing existing record
      setEditingRecord(record);
      setSelectedChild(child || children.find(c => c.id === record.childId));
      setFormData({
        childId: record.childId,
        date: record.date,
        emotionalState: record.emotionalState || formData.emotionalState,
        notes: record.notes || '',
        teacherSignature: record.teacherSignature || user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      });
    } else {
      // Creating new record
      setEditingRecord(null);
      setSelectedChild(child);
      setFormData({
        childId: child?.id || '',
        date: new Date().toISOString().split('T')[0],
        emotionalState: {
          stable: false,
          positiveEmotions: false,
          noAnxiety: false,
          noHostility: false,
          calmResponse: false,
          showsEmpathy: false,
          quickRecovery: false,
          stableMood: false,
          trustingRelationship: false,
        },
        notes: '',
        teacherSignature: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setSelectedChild(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    
    if (!formData.childId || !formData.date) {
      showError('Please select a child and date');
=======

    if (!formData.childId || !formData.date) {
      showError(t('monitoring.selectChildError'));
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
      return;
    }

    try {
      if (editingRecord) {
        await api.put(`/teacher/emotional-monitoring/${editingRecord.id}`, formData);
<<<<<<< HEAD
        success('Monitoring record updated successfully');
      } else {
        await api.post('/teacher/emotional-monitoring', formData);
        success('Monitoring record created successfully');
=======
        success(t('monitoring.toastUpdate'));
      } else {
        await api.post('/teacher/emotional-monitoring', formData);
        success(t('monitoring.toastCreate'));
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
      }
      handleCloseModal();
      loadMonitoringRecords();
    } catch (error) {
      console.error('Error saving monitoring record:', error);
<<<<<<< HEAD
      showError(error.response?.data?.error || 'Failed to save monitoring record');
=======
      showError(error.response?.data?.error || t('monitoring.toastError'));
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
    }
  };

  const handleDelete = async (id) => {
<<<<<<< HEAD
    if (!confirm('Are you sure you want to delete this monitoring record?')) {
=======
    if (!confirm(t('monitoring.confirmDelete'))) {
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
      return;
    }

    try {
      await api.delete(`/teacher/emotional-monitoring/${id}`);
<<<<<<< HEAD
      success('Monitoring record deleted successfully');
      loadMonitoringRecords();
    } catch (error) {
      console.error('Error deleting monitoring record:', error);
      showError('Failed to delete monitoring record');
=======
      success(t('monitoring.toastDelete'));
      loadMonitoringRecords();
    } catch (error) {
      console.error('Error deleting monitoring record:', error);
      showError(t('monitoring.toastError'));
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
    }
  };

  const toggleEmotionalState = (key) => {
    setFormData(prev => ({
      ...prev,
      emotionalState: {
        ...prev.emotionalState,
        [key]: !prev.emotionalState[key],
      },
    }));
  };

<<<<<<< HEAD
  const emotionalStateLabels = {
    stable: 'Боланинг ҳиссий ҳолати барқарор',
    positiveEmotions: 'Бола ижобий ҳис-туйғуларни намоён этади (табассум, қувонч, қизиқиш)',
    noAnxiety: 'Хавотирланиш белгилари йўқ (тортинчоқлик, йиғлоқилик, ўзини четга олиш)',
    noHostility: 'Болалар ва катталарга нисбатан душманлик муносабати кузатилмайди',
    calmResponse: 'Танбеҳ ва илтимосларга хотиржам муносабат билдиради',
    showsEmpathy: 'Бошқа болаларга ҳамдардлик кўрсатади',
    quickRecovery: 'Стрессли вазиятдан кейин тезда ўзини ўнглаб олади',
    stableMood: 'Кайфияти кун давомида барқарор туради',
    trustingRelationship: 'Тарбиячи билан муносабати ишончли ва мустаҳкам',
  };
=======
  const emotionalStateKeys = [
    'stable',
    'positiveEmotions',
    'noAnxiety',
    'noHostility',
    'calmResponse',
    'showsEmpathy',
    'quickRecovery',
    'stableMood',
    'trustingRelationship',
  ];
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e

  const getRecordForChild = (childId, date) => {
    return monitoringRecords.find(r => r.childId === childId && r.date === date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">
<<<<<<< HEAD
            Ҳафталик мониторинг журнали
          </h1>
          <p className="text-white/90 font-medium mt-1 drop-shadow-sm">
            Болаларнинг эмоционал ҳолатини мониторинг қилиш
=======
            {t('monitoring.title')}
          </h1>
          <p className="text-white/90 font-medium mt-1 drop-shadow-sm">
            {t('monitoring.subtitle')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
          </p>
        </div>
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => {
          const todayRecord = getRecordForChild(child.id, new Date().toISOString().split('T')[0]);
          return (
            <Card key={child.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    <Baby className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{child.parentName}</p>
                    <p className="text-xs text-gray-400">{child.school}, {child.class}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {todayRecord ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
<<<<<<< HEAD
                    <span>Бугун учун баҳоланди</span>
=======
                    <span>{t('monitoring.assessedToday')}</span>
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FileX className="w-4 h-4" />
<<<<<<< HEAD
                    <span>Бугун учун баҳоланмади</span>
=======
                    <span>{t('monitoring.notAssessedToday')}</span>
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(child, todayRecord)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {todayRecord ? (
                      <>
                        <Edit2 className="w-4 h-4" />
<<<<<<< HEAD
                        Тахрирлаш
=======
                        {t('monitoring.edit')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
<<<<<<< HEAD
                        Баҳолаш
=======
                        {t('monitoring.assess')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
<<<<<<< HEAD
                {editingRecord ? 'Мониторинг журналини тахрирлаш' : 'Янги мониторинг жумласи'}
=======
                {editingRecord ? t('monitoring.editModal') : t('monitoring.createModal')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {selectedChild && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Baby className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedChild.firstName} {selectedChild.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{selectedChild.parentName}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  Сана
=======
                  {t('monitoring.date')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
<<<<<<< HEAD
                  Болаларнинг эмоционал ҳолати
                </label>
                <div className="space-y-3">
                  {Object.entries(emotionalStateLabels).map(([key, label]) => (
=======
                  {t('monitoring.emotionalState')}
                </label>
                <div className="space-y-3">
                  {emotionalStateKeys.map((key) => (
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                    <label
                      key={key}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.emotionalState[key] || false}
                        onChange={() => toggleEmotionalState(key)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
<<<<<<< HEAD
                      <span className="text-sm text-gray-700 flex-1">{label}</span>
=======
                      <span className="text-sm text-gray-700 flex-1">{t(`monitoring.emotionalStates.${key}`)}</span>
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  Изоҳ / бошқа
=======
                  {t('monitoring.notes')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
<<<<<<< HEAD
                  placeholder="Қўшимча изоҳлар..."
=======
                  placeholder={t('monitoring.notesPlaceholder')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
<<<<<<< HEAD
                  Масъул тарбиячи ФИШ ва имзоси
=======
                  {t('monitoring.teacherSignature')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                </label>
                <input
                  type="text"
                  value={formData.teacherSignature}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacherSignature: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
<<<<<<< HEAD
                  placeholder="ФИШ ва имзо"
=======
                  placeholder={t('monitoring.teacherSignaturePlaceholder')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
<<<<<<< HEAD
                  Сақлаш
=======
                  {t('monitoring.save')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
<<<<<<< HEAD
                  Бекор қилиш
=======
                  {t('monitoring.cancel')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                </button>
                {editingRecord && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingRecord.id)}
                    className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
<<<<<<< HEAD
                    Ўчириш
=======
                    {t('monitoring.delete')}
>>>>>>> 5963708c97ac0e677e2213d4c11535b5b13ef28e
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringJournal;
