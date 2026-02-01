import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Star, Building2, Trophy, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LEVEL_COLORS = {
  5: 'bg-green-100 text-green-800',
  4: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  2: 'bg-orange-100 text-orange-800',
  1: 'bg-red-100 text-red-800',
};

const Ratings = () => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({ total: 0, average: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/government/ratings');
      const data = res.data?.data || {};
      setSchools(data.schools || []);
      setStats({ total: data.total || 0, average: data.average || 0 });
    } catch (error) {
      console.error('Error loading ratings:', error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (index) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-600';
    return 'text-gray-500';
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
          {t('ratings.title', { defaultValue: 'Reytinglar' })}
        </h1>
        <p className="text-gray-600">
          {t('ratings.subtitle', { defaultValue: 'Maktablar reytinglari' })}
        </p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">
            {t('ratings.totalRatings', { defaultValue: 'Jami baholar' })}
          </p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">
            {t('ratings.overallAverage', { defaultValue: 'Umumiy o\'rtacha' })}
          </p>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <p className="text-2xl font-bold text-gray-900">{stats.average.toFixed(1)}</p>
          </div>
        </Card>
      </div>

      {schools.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {t('ratings.notFound', { defaultValue: 'Reytinglar topilmadi' })}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {schools.map((school, index) => {
            const level = school.governmentLevel || 1;
            return (
              <Card key={school.id} className="p-6">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    {index < 3 ? (
                      <Trophy className={`w-7 h-7 mx-auto ${getRankColor(index)}`} />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    )}
                  </div>

                  {/* School info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                      <h3 className="font-bold text-gray-900 truncate">{school.name}</h3>
                      {/* Government level badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${LEVEL_COLORS[level]}`}>
                        <Award className="w-3 h-3" />
                        {t('ratings.level', { defaultValue: 'Daraja' })} {level}
                      </span>
                    </div>
                    {school.address && (
                      <p className="text-sm text-gray-500 truncate">{school.address}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {t('ratings.ratingsCount', { defaultValue: 'Baholar soni' })}: {school.ratingsCount}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(school.averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {school.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Rating distribution bar */}
                {school.ratingsCount > 0 && (
                  <div className="mt-4 flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = school.distribution?.[star] || 0;
                      const pct = (count / school.ratingsCount) * 100;
                      if (pct === 0) return null;
                      const colors = {
                        5: 'bg-green-500',
                        4: 'bg-lime-500',
                        3: 'bg-yellow-400',
                        2: 'bg-orange-400',
                        1: 'bg-red-500',
                      };
                      return (
                        <div
                          key={star}
                          className={`${colors[star]} rounded-sm`}
                          style={{ width: `${pct}%` }}
                          title={`${star} ${t('ratings.stars', { defaultValue: 'yulduz' })}: ${count}`}
                        />
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Ratings;
