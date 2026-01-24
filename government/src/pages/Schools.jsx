import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Building2, Star, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Schools = () => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const res = await api.get('/government/schools');
      setSchools(res.data?.data?.schools || []);
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
          {schools.map((school) => (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Schools;
