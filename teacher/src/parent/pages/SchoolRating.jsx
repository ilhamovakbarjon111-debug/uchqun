import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const SchoolRating = () => {
  const { t, i18n } = useTranslation();
  const [school, setSchool] = useState(null);
  const [rating, setRating] = useState(null);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const locale = useMemo(() => {
    return (
      {
        uz: 'uz-UZ',
        ru: 'ru-RU',
        en: 'en-US',
      }[i18n.language] || 'en-US'
    );
  }, [i18n.language]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const ratingRes = await api.get('/parent/school-rating').catch((err) => {
        // Treat 400/404 as "no rating yet"
        if (err.response?.status === 400 || err.response?.status === 404) {
          return { data: { data: { rating: null, school: null, summary: { average: 0, count: 0 } } } };
        }
        throw err;
      });

      const ratingData = ratingRes?.data?.data || { rating: null, school: null, summary: { average: 0, count: 0 } };
      setSchool(ratingData.school);
      setRating(ratingData.rating);
      setStars(ratingData.rating?.stars || 0);
      setComment(ratingData.rating?.comment || '');
      setSummary(ratingData.summary || { average: 0, count: 0 });
    } catch (err) {
      console.error('Error loading school rating data:', err);
      setError(t('schoolRatingPage.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!school) {
      setError(t('schoolRatingPage.noSchool'));
      return;
    }

    if (!stars) {
      setError(t('schoolRatingPage.errorRequired'));
      return;
    }

    setSaving(true);
    try {
      await api.post('/parent/school-rating', { schoolId: school.id, stars, comment });
      setRating({
        stars,
        comment,
        updatedAt: new Date().toISOString(),
      });
      setSuccess(t('schoolRatingPage.success'));

      // Refresh summary after saving
      const refreshRes = await api.get('/parent/school-rating').catch((err) => {
        if (err.response?.status === 400 || err.response?.status === 404) {
          return { data: { data: { summary: { average: 0, count: 0 } } } };
        }
        throw err;
      });
      const ratingData = refreshRes?.data?.data || {};
      setSummary(ratingData.summary || { average: 0, count: 0 });
    } catch (err) {
      console.error('Error saving school rating:', err);
      setError(err.response?.data?.error || t('schoolRatingPage.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const lastUpdated = useMemo(() => {
    if (!rating?.updatedAt && !rating?.createdAt) return null;
    const dateValue = rating.updatedAt || rating.createdAt;
    return new Date(dateValue).toLocaleString(locale);
  }, [rating, locale]);

  const starButtons = [1, 2, 3, 4, 5];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-blue-50 text-blue-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('schoolRatingPage.title')}</h2>
            <p className="text-gray-600">{t('schoolRatingPage.noSchool')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Card className="bg-gradient-to-r from-green-500 to-green-400 rounded-2xl p-6 md:p-8 shadow-xl border-0">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('schoolRatingPage.title')}</h1>
        <p className="text-white/90 text-sm md:text-base">{t('schoolRatingPage.subtitle')}</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 font-black flex items-center justify-center text-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                  {t('schoolRatingPage.yourSchool')}
                </p>
                <h2 className="text-xl font-bold text-gray-900">
                  {school.name}
                </h2>
                {school.address && (
                  <p className="text-sm text-gray-500">{school.address}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('schoolRatingPage.average')}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-green-600 font-bold text-xl">
                  <Star className="w-5 h-5 fill-green-500 text-green-500" />
                  {summary.average?.toFixed(1) || '0.0'}
                </div>
                <span className="text-xs text-gray-500">
                  {t('schoolRatingPage.ratingsCount', { count: summary.count || 0 })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t('schoolRatingPage.starsLabel')}</p>
              <div className="flex items-center gap-2">
                {starButtons.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStars(value)}
                    className={`p-3 rounded-2xl border transition-colors ${
                      stars >= value
                        ? 'bg-green-50 border-green-200 text-green-600'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-green-200 hover:text-green-500'
                    }`}
                  >
                    <Star
                      className="w-6 h-6"
                      fill={stars >= value ? '#22c55e' : 'none'}
                      stroke={stars >= value ? '#16a34a' : 'currentColor'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">{t('schoolRatingPage.commentLabel')}</p>
                <span className="text-xs text-gray-400">{t('schoolRatingPage.optional')}</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder={t('schoolRatingPage.commentPlaceholder')}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 mt-0.5" />
                <p>{success}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {lastUpdated && t('schoolRatingPage.lastUpdated', { date: lastUpdated })}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <LoadingSpinner size="sm" />}
                {rating ? t('schoolRatingPage.update') : t('schoolRatingPage.submit')}
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-50 text-green-600">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('schoolRatingPage.yourRating')}</p>
                <p className="text-xs text-gray-500">{t('schoolRatingPage.rateCta')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {starButtons.map((value) => (
                <Star
                  key={value}
                  className="w-5 h-5"
                  fill={(rating?.stars || stars) >= value ? '#22c55e' : 'none'}
                  stroke={(rating?.stars || stars) >= value ? '#16a34a' : '#9ca3af'}
                />
              ))}
            </div>

            <div className="text-sm text-gray-600">
              {rating?.comment ? `"${rating.comment}"` : t('schoolRatingPage.noComment')}
            </div>
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">{t('schoolRatingPage.summaryTitle')}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-green-500 fill-green-500" />
                <div>
                  <p className="text-xl font-bold text-gray-900">{summary.average?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-gray-500">{t('schoolRatingPage.average')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{summary.count || 0}</p>
                <p className="text-xs text-gray-500">{t('schoolRatingPage.ratingsCount', { count: summary.count || 0 })}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchoolRating;
