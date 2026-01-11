// Reception ParentManagement - Updated to use /reception/parents endpoint
import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Mail,
  Phone,
  X,
  Save,
  Baby,
  UserCheck,
  UsersRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [editingParent, setEditingParent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    teacherId: '',
    groupId: '',
    child: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      disabilityType: '',
      specialNeeds: '',
      school: 'Uchqun School',
    },
  });
  const [childFormData, setChildFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    disabilityType: '',
    specialNeeds: '',
    school: 'Uchqun School',
  });
  const { success, error: showError } = useToast();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showChildPassword, setShowChildPassword] = useState(false);

  useEffect(() => {
    loadParents();
    loadTeachersAndGroups();
  }, []);

  const loadTeachersAndGroups = async () => {
    try {
      const [teachersRes, groupsRes] = await Promise.all([
        api.get('/reception/teachers').catch(() => ({ data: { data: [] } })),
        api.get('/groups').catch(() => ({ data: { groups: [] } }))
      ]);
      setTeachers(Array.isArray(teachersRes.data.data) ? teachersRes.data.data : []);
      setGroups(Array.isArray(groupsRes.data.groups) ? groupsRes.data.groups : []);
    } catch (error) {
      console.error('Error loading teachers and groups:', error);
    }
  };

  // Filter groups based on selected teacher
  const filteredGroups = formData.teacherId
    ? groups.filter(group => group.teacherId === formData.teacherId)
    : groups;

  const loadParents = async () => {
    try {
      setLoading(true);
      console.log('Loading parents from /reception/parents endpoint');
      const response = await api.get('/reception/parents');
      setParents(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error loading parents:', error);
      showError(error.response?.data?.error || t('parentsPage.toastLoadError'));
      setParents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingParent(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      teacherId: '',
      groupId: '',
      child: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Male',
        disabilityType: '',
        specialNeeds: '',
        school: 'Uchqun School',
        photo: null,
      },
    });
    setShowModal(true);
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setFormData({
      firstName: parent.firstName || '',
      lastName: parent.lastName || '',
      email: parent.email || '',
      phone: parent.phone || '',
      password: '',
      teacherId: parent.teacherId || '',
      groupId: parent.groupId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (parentId) => {
    if (!window.confirm(t('parentsPage.confirmDelete'))) {
      return;
    }

    try {
      await api.delete(`/reception/parents/${parentId}`);
      success(t('parentsPage.toastDelete'));
      loadParents();
    } catch (error) {
      console.error('Error deleting parent:', error);
      showError(error.response?.data?.error || t('parentsPage.toastDeleteError'));
    }
  };


  const handleAddChild = (parentId) => {
    setSelectedParentId(parentId);
    setChildFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      disabilityType: '',
      specialNeeds: '',
      school: 'Uchqun School',
      photo: null,
    });
    setShowChildModal(true);
  };

  const handleSubmitChild = async (e) => {
    e.preventDefault();
    
    if (!selectedParentId) {
      showError('Parent ID is missing');
      return;
    }

    // Validate required fields
    if (!childFormData.firstName || !childFormData.lastName || !childFormData.dateOfBirth || 
        !childFormData.disabilityType || !childFormData.school) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('parentId', selectedParentId);
      formDataToSend.append('child[firstName]', childFormData.firstName.trim());
      formDataToSend.append('child[lastName]', childFormData.lastName.trim());
      formDataToSend.append('child[dateOfBirth]', childFormData.dateOfBirth);
      formDataToSend.append('child[gender]', childFormData.gender || 'Male');
      formDataToSend.append('child[disabilityType]', childFormData.disabilityType.trim());
      if (childFormData.specialNeeds) {
        formDataToSend.append('child[specialNeeds]', childFormData.specialNeeds.trim());
      }
      formDataToSend.append('child[school]', childFormData.school.trim());
      if (childFormData.photo) {
        formDataToSend.append('child[photo]', childFormData.photo);
      }
      
      // Debug: Log FormData contents
      console.log('Sending FormData:', {
        parentId: selectedParentId,
        firstName: childFormData.firstName,
        lastName: childFormData.lastName,
        dateOfBirth: childFormData.dateOfBirth,
        gender: childFormData.gender,
        disabilityType: childFormData.disabilityType,
        school: childFormData.school,
        hasPhoto: !!childFormData.photo,
      });
      
      await api.post('/reception/children', formDataToSend);
      success('Child added successfully');
      setShowChildModal(false);
      loadParents();
    } catch (error) {
      console.error('Error adding child:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to add child';
      const errorDetails = error.response?.data?.missing ? `Missing: ${JSON.stringify(error.response.data.missing)}` : '';
      showError(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingParent) {
        // Update parent info
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          teacherId: formData.teacherId || null,
          groupId: formData.groupId || null,
        };
        // Include password in update if provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/reception/parents/${editingParent.id}`, updateData);
        
        success(t('parentsPage.toastUpdate'));
      } else {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append('firstName', formData.firstName);
        formDataToSend.append('lastName', formData.lastName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('password', formData.password);
        if (formData.teacherId) formDataToSend.append('teacherId', formData.teacherId);
        if (formData.groupId) formDataToSend.append('groupId', formData.groupId);
        
        // Add child data if provided
        if (formData.child.firstName && formData.child.lastName) {
          formDataToSend.append('child[firstName]', formData.child.firstName);
          formDataToSend.append('child[lastName]', formData.child.lastName);
          formDataToSend.append('child[dateOfBirth]', formData.child.dateOfBirth);
          formDataToSend.append('child[gender]', formData.child.gender);
          formDataToSend.append('child[disabilityType]', formData.child.disabilityType);
          if (formData.child.specialNeeds) formDataToSend.append('child[specialNeeds]', formData.child.specialNeeds);
          formDataToSend.append('child[school]', formData.child.school);
          // Add photo file if selected
          if (formData.child.photo) {
            formDataToSend.append('child[photo]', formData.child.photo);
          }
        }
        
        // Axios automatically sets Content-Type for FormData, don't set it manually
        await api.post('/reception/parents', formDataToSend);
        success(t('parentsPage.toastCreate'));
      }
      
      setShowModal(false);
      loadParents();
    } catch (error) {
      console.error('Error saving parent:', error);
      showError(error.response?.data?.error || t('parentsPage.toastSaveError'));
    }
  };

  const filteredParents = parents.filter((parent) => {
    const query = searchQuery.toLowerCase();
    return (
      parent.firstName?.toLowerCase().includes(query) ||
      parent.lastName?.toLowerCase().includes(query) ||
      parent.email?.toLowerCase().includes(query) ||
      parent.phone?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('parentsPage.title')}</h1>
          <p className="text-gray-500 font-medium mt-1">{t('parentsPage.subtitle')}</p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('parentsPage.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full md:w-64"
            />
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t('parentsPage.add')}</span>
          </button>
        </div>
      </div>

      {filteredParents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParents.map((parent) => (
            <Card key={parent.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                    {parent.firstName?.charAt(0)}{parent.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {parent.firstName} {parent.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{parent.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{parent.email}</span>
                </div>
                {parent.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{parent.phone}</span>
                  </div>
                )}
                
                {/* Teacher and Group Section */}
                {(parent.assignedTeacher || parent.group) && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>{t('parentsPage.assignment')}</span>
                    </div>
                    <div className="space-y-2">
                      {parent.assignedTeacher && (
                        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">{t('parentsPage.teacherLabel')}</span> {parent.assignedTeacher.firstName} {parent.assignedTeacher.lastName}
                          </p>
                        </div>
                      )}
                      {parent.group && (
                        <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">{t('parentsPage.groupLabel')}</span> {parent.group.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Children Section */}
                {parent.children && parent.children.length > 0 ? (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Baby className="w-4 h-4 text-orange-600" />
                      <span>{t('parentsPage.children', { count: parent.children.length })}</span>
                    </div>
                    <div className="space-y-2">
                      {parent.children.map((child) => (
                        <div key={child.id} className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">
                                {child.firstName} {child.lastName}
                              </p>
                              <div className="mt-1 space-y-1">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">{t('parentsPage.class')}</span> {child.class}
                                </p>
                                {child.teacher && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">Teacher:</span> {child.teacher}
                                  </p>
                                )}
                                {child.disabilityType && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium">{t('parentsPage.disability')}</span> {child.disabilityType}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-400 italic pt-3 border-t border-gray-100">
                    <Baby className="w-4 h-4" />
                    <span>No children registered</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleAddChild(parent.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors"
                >
                  <Baby className="w-4 h-4" />
                  Add Child
                </button>
                <button
                  onClick={() => handleEdit(parent)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(parent.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">
            {searchQuery ? t('parentsPage.noParentsFound') : t('parentsPage.noParents')}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Parent
            </button>
          )}
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingParent ? t('parentsPage.form.update') + ' ' + t('nav.parents') : t('parentsPage.add')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('parentsPage.form.firstName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('parentsPage.form.lastName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('parentsPage.form.email')}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('parentsPage.form.phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('parentsPage.form.password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingParent}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('parentsPage.form.teacher')}
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => {
                      const selectedTeacherId = e.target.value;
                      setFormData({ 
                        ...formData, 
                        teacherId: selectedTeacherId,
                        groupId: '' // Reset group when teacher changes
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">{t('parentsPage.form.teacher')} tanlang</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('parentsPage.form.group')}
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => {
                      const selectedGroupId = e.target.value;
                      const selectedGroup = groups.find(g => g.id === selectedGroupId);
                      setFormData({ 
                        ...formData, 
                        groupId: selectedGroupId,
                        // Auto-set teacher from group if no teacher was selected
                        teacherId: selectedGroup?.teacherId || formData.teacherId
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">{t('parentsPage.form.group')} tanlang</option>
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Avval o'qituvchi tanlang</option>
                    )}
                  </select>
                </div>
              </div>

              {!editingParent && (
                <>
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('parentsPage.form.child')}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('parentsPage.form.childFirstName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.child.firstName}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            child: { ...formData.child, firstName: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('parentsPage.form.childLastName')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.child.lastName}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            child: { ...formData.child, lastName: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('parentsPage.form.childDob')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.child.dateOfBirth}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            child: { ...formData.child, dateOfBirth: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('parentsPage.form.childGender')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.child.gender}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            child: { ...formData.child, gender: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="Male">Erkak</option>
                          <option value="Female">Ayol</option>
                          <option value="Other">Boshqa</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('parentsPage.form.childDisability')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.child.disabilityType}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          child: { ...formData.child, disabilityType: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('parentsPage.form.childSpecialNeeds')}</label>
                      <textarea
                        value={formData.child.specialNeeds}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          child: { ...formData.child, specialNeeds: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('parentsPage.form.childSchool')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.child.school}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            child: { ...formData.child, school: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingParent ? t('parentsPage.form.update') : t('parentsPage.form.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Child Modal */}
      {showChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Bola qo'shish</h2>
              <button
                onClick={() => {
                  setShowChildModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitChild} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('parentsPage.form.childFirstName')} <span className="text-red-500">*</span>
                        </label>
                  <input
                    type="text"
                          required
                    value={childFormData.firstName}
                    onChange={(e) => setChildFormData({ ...childFormData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                      </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('parentsPage.form.childLastName')} <span className="text-red-500">*</span>
                  </label>
                      <input
                    type="text"
                    required
                    value={childFormData.lastName}
                    onChange={(e) => setChildFormData({ ...childFormData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                </div>
                    </div>

              <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('parentsPage.form.childDob')} <span className="text-red-500">*</span>
                          </label>
                          <input
                    type="date"
                            required
                    value={childFormData.dateOfBirth}
                    onChange={(e) => setChildFormData({ ...childFormData, dateOfBirth: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('parentsPage.form.childGender')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={childFormData.gender}
                    onChange={(e) => setChildFormData({ ...childFormData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Male">Erkak</option>
                    <option value="Female">Ayol</option>
                    <option value="Other">Boshqa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('parentsPage.form.childDisability')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                  value={childFormData.disabilityType}
                  onChange={(e) => setChildFormData({ ...childFormData, disabilityType: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('parentsPage.form.childSpecialNeeds')}</label>
                <textarea
                  value={childFormData.specialNeeds}
                  onChange={(e) => setChildFormData({ ...childFormData, specialNeeds: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('parentsPage.form.childSchool')} <span className="text-red-500">*</span>
                          </label>
                          <input
                  type="text"
                            required
                  value={childFormData.school}
                  onChange={(e) => setChildFormData({ ...childFormData, school: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>


              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowChildModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('parentsPage.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Bola qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentManagement;

