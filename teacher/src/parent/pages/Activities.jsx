import { useEffect, useState } from 'react';
import { useChild } from '../context/ChildContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  FileX,
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
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{t('activities.title')}</h1>
        <p className="text-gray-500 text-lg">{t('activities.subtitle')}</p>
      </div>

      {/* Activities Table */}
      {filteredActivities.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t('activities.skill') || 'Ko\'nikma'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t('activities.goal') || 'Maqsad'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t('activities.startDate') || 'Boshlanish'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t('activities.endDate') || 'Tugash'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t('activities.services') || 'Xizmatlar'}
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t('activities.teacher') || 'O\'qituvchi'}
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-12">
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredActivities.map((activity) => {
                  const isExpanded = expandedRows.has(activity.id);
                  return (
                    <>
                      <tr key={activity.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {activity.skill || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                            {activity.goal ? (activity.goal.length > 100 ? `${activity.goal.substring(0, 100)}...` : activity.goal) : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {activity.startDate ? new Date(activity.startDate).toLocaleDateString(locale) : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {activity.endDate ? new Date(activity.endDate).toLocaleDateString(locale) : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {activity.services && Array.isArray(activity.services) && activity.services.length > 0 ? (
                              activity.services.slice(0, 2).map((service, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-medium"
                                >
                                  {t(`activities.service.${service.replace(/\s+/g, '')}`) || service}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                            {activity.services && activity.services.length > 2 && (
                              <span className="text-xs text-gray-500">+{activity.services.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{activity.teacher || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => toggleRow(activity.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={7} className="px-4 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {activity.tasks && Array.isArray(activity.tasks) && activity.tasks.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.tasks') || 'Vazifalar'}:</p>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                    {activity.tasks.map((task, idx) => task && (
                                      <li key={idx}>{task}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {activity.methods && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.methods') || 'Usullar'}:</p>
                                  <p className="text-sm text-gray-600">{activity.methods}</p>
                                </div>
                              )}
                              {activity.progress && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.progress') || 'Jarayon/Taraqqiyot'}:</p>
                                  <p className="text-sm text-gray-600">{activity.progress}</p>
                                </div>
                              )}
                              {activity.observation && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.observation') || 'Kuzatish'}:</p>
                                  <p className="text-sm text-gray-600">{activity.observation}</p>
                                </div>
                              )}
                              {activity.services && Array.isArray(activity.services) && activity.services.length > 0 && (
                                <div className="md:col-span-2">
                                  <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.services') || 'Xizmatlar'}:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {activity.services.map((service, idx) => (
                                      <span 
                                        key={idx}
                                        className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium"
                                      >
                                        {t(`activities.service.${service.replace(/\s+/g, '')}`) || service}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
          <FileX className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">{t('activities.empty')}</p>
        </div>
      )}
    </div>
  );
};

export default Activities;