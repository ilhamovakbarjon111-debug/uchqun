import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Star, Building2 } from 'lucide-react';

const Ratings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/government/ratings');
      setRatings(res.data?.data || []);
    } catch (error) {
      console.error('Error loading ratings:', error);
      setRatings([]);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reytinglar</h1>
        <p className="text-gray-600">Maktablar reytinglari</p>
      </div>

      {ratings.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Reytinglar topilmadi</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    <h3 className="font-bold text-gray-900">{rating.schoolName || 'Noma\'lum maktab'}</h3>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-gray-600 mb-3">{rating.comment}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>O'quvchi: {rating.studentName || 'Noma\'lum'}</span>
                    <span>Ota-ona: {rating.parentName || 'Noma\'lum'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= (rating.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900 ml-2">
                    {(rating.rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ratings;
