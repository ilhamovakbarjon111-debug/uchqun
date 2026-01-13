import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Mail, Phone, MessageSquare, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const TeacherRating = () => {
  const { t, i18n } = useTranslation();
  const [teacher, setTeacher] = useState(null);
  const [rating, setRating] = useState(null);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [allRatings, setAllRatings] = useState([]);
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
      const [profileRes, ratingRes] = await Promise.all([
        api.get('/parent/profile'),
        api.get('/parent/ratings').catch((err) => {
          // Treat 400/404 as “no rating yet” to stay resilient with older APIs
          if (err.response?.status === 400 || err.response?.status === 404) {
            return { data: { data: { rating: null, summary: { average: 0, count: 0 } } } };
          }
          throw err;
        }),
      ]);

      const teacherData = profileRes.data?.data?.user?.assignedTeacher || null;
      setTeacher(teacherData);

      const ratingData = ratingRes?.data?.data || { rating: null, summary: { average: 0, count: 0 }, allRatings: [] };
      setRating(ratingData.rating);
      setStars(ratingData.rating?.stars || 0);
      setComment(ratingData.rating?.comment || '');
      setSummary(ratingData.summary || { average: 0, count: 0 });
      setAllRatings(ratingData.allRatings || []);
    } catch (err) {
      console.error('Error loading rating data:', err);
      setError(t('ratingPage.errorLoad'));
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

    if (!teacher) {
      setError(t('ratingPage.noTeacher'));
      return;
    }

    if (!stars) {
      setError(t('ratingPage.errorRequired'));
      return;
    }

    setSaving(true);
    try {
      await api.post('/parent/ratings', { stars, comment });
      setRating({
        stars,
        comment,
        updatedAt: new Date().toISOString(),
      });
      setSuccess(t('ratingPage.success'));

      // Refresh summary and all ratings after saving
      const refreshRes = await api.get('/parent/ratings').catch((err) => {
        if (err.response?.status === 400 || err.response?.status === 404) {
          return { data: { data: { summary: { average: 0, count: 0 }, allRatings: [] } } };
        }
        throw err;
      });
      const ratingData = refreshRes?.data?.data || {};
      setSummary(ratingData.summary || { average: 0, count: 0 });
      setAllRatings(ratingData.allRatings || []);
    } catch (err) {
      console.error('Error saving rating:', err);
      setError(err.response?.data?.error || t('ratingPage.errorSave'));
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

  if (!teacher) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-blue-50 text-blue-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('ratingPage.title')}</h2>
            <p className="text-gray-600">{t('ratingPage.noTeacher')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl p-6 md:p-8 shadow-xl border-0">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('ratingPage.title')}</h1>
        <p className="text-white/90 text-sm md:text-base">{t('ratingPage.subtitle')}</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xl">
                {teacher.firstName?.[0]}
                {teacher.lastName?.[0]}
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {t('ratingPage.yourTeacher')}
                </p>
                <h2 className="text-xl font-bold text-gray-900">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <p className="text-sm text-gray-500">{teacher.email}</p>
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('ratingPage.average')}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-blue-600 font-bold text-xl">
                  <Star className="w-5 h-5 fill-blue-500 text-blue-500" />
                  {summary.average?.toFixed(1) || '0.0'}
                </div>
                <span className="text-xs text-gray-500">
                  {t('ratingPage.ratingsCount', { count: summary.count || 0 })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{teacher.email || '—'}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{teacher.phone || t('ratingPage.noPhone')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t('ratingPage.starsLabel')}</p>
              <div className="flex items-center gap-2">
                {starButtons.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStars(value)}
                    className={`p-3 rounded-2xl border transition-colors ${
                      stars >= value
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-blue-200 hover:text-blue-500'
                    }`}
                  >
                    <Star
                      className="w-6 h-6"
                      fill={stars >= value ? '#f97316' : 'none'}
                      stroke={stars >= value ? '#ea580c' : 'currentColor'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">{t('ratingPage.commentLabel')}</p>
                <span className="text-xs text-gray-400">{t('ratingPage.optional')}</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder={t('ratingPage.commentPlaceholder')}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                {lastUpdated && t('ratingPage.lastUpdated', { date: lastUpdated })}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <LoadingSpinner size="sm" />}
                {rating ? t('ratingPage.update') : t('ratingPage.submit')}
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('ratingPage.yourRating')}</p>
                <p className="text-xs text-gray-500">{t('ratingPage.rateCta')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {starButtons.map((value) => (
                <Star
                  key={value}
                  className="w-5 h-5"
                  fill={(rating?.stars || stars) >= value ? '#f97316' : 'none'}
                  stroke={(rating?.stars || stars) >= value ? '#ea580c' : '#9ca3af'}
                />
              ))}
            </div>

            <div className="text-sm text-gray-600">
              {rating?.comment ? `"${rating.comment}"` : t('ratingPage.noComment')}
            </div>
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-semibold text-gray-900">{t('ratingPage.summaryTitle')}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
                <div>
                  <p className="text-xl font-bold text-gray-900">{summary.average?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-gray-500">{t('ratingPage.average')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{summary.count || 0}</p>
                <p className="text-xs text-gray-500">{t('ratingPage.ratingsCount', { count: summary.count || 0 })}</p>
              </div>
            </div>
          </Card>

          {/* All Parents Ratings */}
          <Card className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-gray-900">
                {t('ratingPage.allRatings') || 'Barcha fikrlar'}
              </p>
            </div>
            {allRatings.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allRatings.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className="w-4 h-4"
                            fill={s <= r.stars ? '#f97316' : 'none'}
                            stroke={s <= r.stars ? '#ea580c' : '#d1d5db'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(r.updatedAt || r.createdAt).toLocaleDateString(locale)}
                      </span>
                    </div>
                    {r.comment && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                        <p className="text-sm leading-relaxed">{r.comment}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {r.parentName || r.parentEmail || t('ratingPage.anonymous') || 'Anonim'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">
                  {t('ratingPage.noRatings') || 'Hozircha fikr bildirilmagan'}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherRating;

