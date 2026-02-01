import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Building2, Star, Users, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LEVEL_COLORS = {
  5: 'bg-green-100 text-green-800',
  4: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  2: 'bg-orange-100 text-orange-800',
  1: 'bg-red-100 text-red-800',
};

const Schools = () => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState([]);
  const [globalStats, setGlobalStats] = useState({ total: 0, totalReviews: 0, globalAverageRating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const res = await api.get('/government/schools');
      const data = res.data?.data || {};
      setSchools(data.schools || []);
      setGlobalStats({
        total: data.total || 0,
        totalReviews: data.totalReviews || 0,
        globalAverageRating: data.globalAverageRating || 0,
      });
    } catch (error) {
      console.error('Error loading schools:', error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('schools.title', { defaultValue: 'Maktablar' })}
        </h1>
        <p className="text-gray-600">
          {t('schools.subtitle', { defaultValue: 'Barcha maktablar ro\'yxati' })}
        </p>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">
            {t('schools.totalSchools', { defaultValue: 'Jami maktablar' })}
          </p>
          <p className="text-2xl font-bold text-gray-900">{globalStats.total}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">
            {t('schools.totalReviews', { defaultValue: 'Jami baholar' })}
          </p>
          <p className="text-2xl font-bold text-gray-900">{globalStats.totalReviews}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">
            {t('schools.globalAverage', { defaultValue: 'Umumiy o\'rtacha reyting' })}
          </p>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <p className="text-2xl font-bold text-gray-900">{globalStats.globalAverageRating.toFixed(1)}</p>
          </div>
        </Card>
      </div>

      {schools.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {t('schools.notFound', { defaultValue: 'Maktablar topilmadi' })}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => {
            const level = school.governmentLevel || 1;
            return (
              <Card key={school.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{school.name}</h3>
                      {school.address && (
                        <p className="text-sm text-gray-600 mt-1">{school.address}</p>
                      )}
                    </div>
                  </div>
                  {/* Government level badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${LEVEL_COLORS[level]}`}>
                    <Award className="w-3 h-3" />
                    {t('schools.level', { defaultValue: 'Daraja' })} {level}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {t('schools.students', { defaultValue: 'O\'quvchilar' })}:
                    </span>
                    <span className="font-semibold text-gray-900">{school.studentsCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {t('schools.ratings', { defaultValue: 'Baholar' })}:
                    </span>
                    <span className="font-semibold text-gray-900">{school.ratingsCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {t('schools.averageRating', { defaultValue: 'O\'rtacha reyting' })}:
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {(school.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Schools;
