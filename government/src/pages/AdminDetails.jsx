import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Shield,
  Building2,
  Users,
  GraduationCap,
  Star,
  DollarSign,
  ArrowLeft,
  UserCheck,
  User,
  Baby,
} from 'lucide-react';

const AdminDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminDetails();
  }, [id]);

  const loadAdminDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/government/admins/${id}`);
      setData(res.data?.data || null);
    } catch (error) {
      console.error('Error loading admin details:', error);
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Admin topilmadi</p>
        <button
          onClick={() => navigate('/government')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const { admin, stats, receptions, schools, teachers, parents, children } = data;

  const statCards = [
    {
      title: 'Receptionlar',
      value: stats.receptions,
      icon: UserCheck,
      color: 'bg-blue-500',
    },
    {
      title: 'Maktablar',
      value: stats.schools,
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: 'O\'qituvchilar',
      value: stats.teachers,
      icon: GraduationCap,
      color: 'bg-purple-500',
    },
    {
      title: 'Ota-onalar',
      value: stats.parents,
      icon: Users,
      color: 'bg-orange-500',
    },
    {
      title: 'O\'quvchilar',
      value: stats.students,
      icon: Baby,
      color: 'bg-pink-500',
    },
    {
      title: 'O\'rtacha Reyting',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: 'Jami Daromad',
      value: `${stats.totalRevenue.toLocaleString()} UZS`,
      icon: DollarSign,
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/government')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {admin.firstName} {admin.lastName}
          </h1>
          <p className="text-gray-600">{admin.email}</p>
        </div>
      </div>

      {/* Admin Info Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{admin.email}</p>
              </div>
              {admin.phone && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Telefon</p>
                  <p className="font-semibold text-gray-900">{admin.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Yaratilgan sana</p>
                <p className="font-semibold text-gray-900">
                  {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('uz-UZ') : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Holati</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  admin.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {admin.isActive ? 'Faol' : 'Nofaol'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Receptions */}
      {receptions.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Receptionlar ({receptions.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receptions.map((reception) => (
              <div key={reception.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <UserCheck className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-gray-900">
                    {reception.firstName} {reception.lastName}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{reception.email}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Schools */}
      {schools.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Maktablar ({schools.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => (
              <div key={school.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">{school.name}</h3>
                </div>
                {school.address && (
                  <p className="text-sm text-gray-600">{school.address}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Teachers */}
      {teachers.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">O'qituvchilar ({teachers.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{teacher.email}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Parents */}
      {parents.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ota-onalar ({parents.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parents.map((parent) => (
              <div key={parent.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-gray-900">
                    {parent.firstName} {parent.lastName}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{parent.email}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Children */}
      {children.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">O'quvchilar ({children.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Baby className="w-5 h-5 text-pink-600" />
                  <h3 className="font-bold text-gray-900">
                    {child.firstName} {child.lastName}
                  </h3>
                </div>
                {child.birthDate && (
                  <p className="text-sm text-gray-600">
                    Tug'ilgan: {new Date(child.birthDate).toLocaleDateString('uz-UZ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDetails;
