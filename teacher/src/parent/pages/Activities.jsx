import { useEffect, useState } from 'react';
import { useChild } from '../context/ChildContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  User,
  FileX,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Activities = () => {
  const { selectedChildId } = useChild();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const locale = {
    uz: 'uz-UZ',
    ru: 'ru-RU',
    en: 'en-US',
  }[i18n.language] || 'en-US';

  useEffect(() => {
    if (!selectedChildId) {
      setLoading(false);
      return;
    }

    const loadActivities = async () => {
      try {
        const response = await api.get(`/activities?childId=${selectedChildId}`);
        const activitiesData = response.data?.activities || response.data || [];
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (error) {
        console.error('Error loading activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    loadActivities();
  }, [selectedChildId]);

  // For Individual Plans, we don't filter by type anymore
  const filteredActivities = activities;
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const openDetailsModal = (activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedActivity(null);
  };

  if (loading) return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{t('activities.title')}</h1>
        <p className="text-gray-500 text-lg">{t('activities.subtitle')}</p>
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
                        {activity.skill || t('activities.skill') || 'Ko\'nikma'}
                      </h3>
                      {activity.goal && (
                        <p className="text-sm text-orange-50 line-clamp-2">
                          {activity.goal.length > 80 ? `${activity.goal.substring(0, 80)}...` : activity.goal}
                        </p>
                      )}
                    </div>
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
                          <p className="text-xs text-blue-600 font-semibold mb-0.5">{t('activities.startDate') || 'Boshlanish'}</p>
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
                          <p className="text-xs text-purple-600 font-semibold mb-0.5">{t('activities.endDate') || 'Tugash'}</p>
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
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">{t('activities.teacher') || 'O\'qituvchi'}</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{activity.teacher}</p>
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {activity.services && Array.isArray(activity.services) && activity.services.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">{t('activities.services') || 'Xizmatlar'}</p>
                      <div className="flex flex-wrap gap-2">
                        {activity.services.slice(0, 3).map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-200/50"
                          >
                            {t(`activities.service.${service.replace(/\s+/g, '')}`) || service}
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

                  {/* Details Button */}
                  <button
                    onClick={() => openDetailsModal(activity)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 rounded-xl text-white transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg"
                  >
                    <ChevronDown className="w-4 h-4" />
                    {t('activities.showDetails') || 'Batafsil'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
          <FileX className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">{t('activities.empty')}</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-400 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">
                {selectedActivity.skill || t('activities.skill') || 'Ko\'nikma'}
              </h2>
              <button
                onClick={closeDetailsModal}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Goal */}
              {selectedActivity.goal && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-5 border border-orange-200">
                  <p className="text-sm font-bold text-orange-700 mb-2">{t('activities.goal') || 'Maqsad'}</p>
                  <p className="text-base text-gray-800 leading-relaxed">{selectedActivity.goal}</p>
                </div>
              )}

              {/* Dates and Teacher */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedActivity.startDate && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-600 font-semibold mb-1">{t('activities.startDate') || 'Boshlanish'}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(selectedActivity.startDate).toLocaleDateString(locale)}
                      </p>
                    </div>
                  </div>
                )}
                {selectedActivity.endDate && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-purple-600 font-semibold mb-1">{t('activities.endDate') || 'Tugash'}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(selectedActivity.endDate).toLocaleDateString(locale)}
                      </p>
                    </div>
                  </div>
                )}
                {selectedActivity.teacher && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-200">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-1">{t('activities.teacher') || 'O\'qituvchi'}</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{selectedActivity.teacher}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tasks */}
              {selectedActivity.tasks && Array.isArray(selectedActivity.tasks) && selectedActivity.tasks.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                  <p className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    {t('activities.tasks') || 'Vazifalar'}
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    {selectedActivity.tasks.map((task, idx) => task && (
                      <li key={idx} className="leading-relaxed">{task}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Methods */}
              {selectedActivity.methods && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                  <p className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    {t('activities.methods') || 'Usullar'}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedActivity.methods}</p>
                </div>
              )}

              {/* Progress */}
              {selectedActivity.progress && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                  <p className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    {t('activities.progress') || 'Jarayon/Taraqqiyot'}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedActivity.progress}</p>
                </div>
              )}

              {/* Observation */}
              {selectedActivity.observation && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                  <p className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    {t('activities.observation') || 'Kuzatish'}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedActivity.observation}</p>
                </div>
              )}

              {/* Services */}
              {selectedActivity.services && Array.isArray(selectedActivity.services) && selectedActivity.services.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                  <p className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    {t('activities.services') || 'Xizmatlar'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-200/50"
                      >
                        {t(`activities.service.${service.replace(/\s+/g, '')}`) || service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={closeDetailsModal}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors shadow-md"
                >
                  {t('activities.close') || 'Yopish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;