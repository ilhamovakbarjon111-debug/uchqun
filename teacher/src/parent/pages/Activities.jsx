import { useEffect, useState } from 'react';
import { useChild } from '../context/ChildContext';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  User,
  CheckCircle2,
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

  if (loading) return <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{t('activities.title')}</h1>
        <p className="text-gray-500 text-lg">{t('activities.subtitle')}</p>
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

                {activity.skill && (
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {activity.skill}
                  </h3>
                )}
                
                {activity.goal && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {activity.goal}
                  </p>
                )}

                {/* Tags & Meta */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                    <User className="w-3 h-3" /> {activity.teacher}
                  </div>
                  {activity.startDate && activity.endDate && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-600 uppercase tracking-tight">
                      <Calendar className="w-3 h-3" />
                      {new Date(activity.startDate).toLocaleDateString(locale)} - {new Date(activity.endDate).toLocaleDateString(locale)}
                    </div>
                  )}
                </div>

                {activity.tasks && Array.isArray(activity.tasks) && activity.tasks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.tasks') || 'Vazifalar'}:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {activity.tasks.map((task, idx) => task && (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activity.methods && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.methods') || 'Usullar'}:</p>
                    <p className="text-sm text-gray-600">{activity.methods}</p>
                  </div>
                )}

                {activity.progress && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.progress') || 'Jarayon/Taraqqiyot'}:</p>
                    <p className="text-sm text-gray-600">{activity.progress}</p>
                  </div>
                )}

                {activity.observation && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{t('activities.observation') || 'Kuzatish'}:</p>
                    <p className="text-sm text-gray-600">{activity.observation}</p>
                  </div>
                )}

                {activity.services && Array.isArray(activity.services) && activity.services.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
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
            <p className="text-gray-400 font-medium text-lg">{t('activities.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;