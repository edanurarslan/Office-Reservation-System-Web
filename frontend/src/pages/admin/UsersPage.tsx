import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer, PageHeader, GlassCard, PrimaryButton, SecondaryButton, TextInput, Select, Modal, Table } from '../../widgets';
import { Edit2, Trash2, Plus, Search, RefreshCw, User, Shield, Users, UserCheck, Briefcase, Mail, Phone } from 'lucide-react';
import api from '../../utils/services/api';

// Simple toast replacement
const toast = {
  success: (message: string) => console.log('✅ Success:', message),
  error: (message: string) => console.error('❌ Error:', message)
};

interface UserData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface RoleOption {
  value: string;
  label: string;
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Yönetici',
  user: 'Kullanıcı',
  guest: 'Misafir'
};

const statusLabels: Record<string, string> = {
  active: 'Aktif',
  inactive: 'Pasif'
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | number>('');
  const [statusFilter, setStatusFilter] = useState<string | number>('');
  const [roles, setRoles] = useState<RoleOption[]>([]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user' as string | number,
    department: '',
    jobTitle: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = String(roleFilter);
      if (statusFilter) params.status = String(statusFilter);
      
      const response = await api.getUsers(params);
      const userData = response?.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
      
      const userList = Array.isArray(userData) ? userData : [];
      setStats({
        total: response?.totalCount || userList.length,
        active: userList.filter((u: UserData) => u.status === 'active').length,
        admins: userList.filter((u: UserData) => u.role?.toLowerCase() === 'admin').length
      });
    } catch (error) {
      toast.error('Kullanıcılar yüklenemedi');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchRoles = async () => {
    try {
      const response = await api.getUserRoles();
      const rolesData = Array.isArray(response) ? response : ((response as any).data || []);
      if (Array.isArray(rolesData)) {
        setRoles(rolesData.map((r: string) => ({ 
          value: r.toLowerCase(), 
          label: roleLabels[r.toLowerCase()] || r 
        })));
      }
    } catch (error) {
      setRoles([
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Yönetici' },
        { value: 'user', label: 'Kullanıcı' },
        { value: 'guest', label: 'Misafir' }
      ]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      department: '',
      jobTitle: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleCreateUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Ad, soyad ve e-posta zorunludur');
      return;
    }
    setFormLoading(true);
    try {
      await api.createUser({
        name: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        role: String(formData.role),
        password: formData.password || undefined,
        department: formData.department || undefined,
        jobTitle: formData.jobTitle || undefined,
        phoneNumber: formData.phoneNumber || undefined
      });
      toast.success('Kullanıcı başarıyla oluşturuldu');
      setIsCreateModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı oluşturulamadı');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    const nameParts = user.name?.split(' ') || ['', ''];
    setFormData({
      firstName: user.firstName || nameParts[0] || '',
      lastName: user.lastName || nameParts.slice(1).join(' ') || '',
      email: user.email || '',
      role: user.role?.toLowerCase() || 'user',
      department: user.department || '',
      jobTitle: user.jobTitle || '',
      phoneNumber: user.phoneNumber || '',
      password: '',
      confirmPassword: ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      await api.updateUser(selectedUser.id, {
        name: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        role: String(formData.role),
        department: formData.department || undefined,
        jobTitle: formData.jobTitle || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        password: formData.password || undefined
      });
      toast.success('Kullanıcı güncellendi');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Güncelleme başarısız');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      await api.deleteUser(selectedUser.id);
      toast.success('Kullanıcı silindi');
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error('Silme işlemi başarısız');
    } finally {
      setFormLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-50 text-purple-700 ring-1 ring-purple-200';
      case 'manager': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      case 'user': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      default: return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-rose-100 text-rose-700';
  };

  const columns = [
    {
      key: 'name' as keyof UserData,
      header: 'Kullanıcı',
      render: (_value: string, user: UserData) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold uppercase">
              {(user.firstName?.[0] || user.name?.[0])}{(user.lastName?.[0] || user.name?.split(' ')[1]?.[0])}
            </span>
          </div>
          <div>
            <div className="font-semibold text-gray-800">{user.name || (user.firstName + ' ' + user.lastName)}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role' as keyof UserData,
      header: 'Yetki',
      render: (value: string) => (
        <span className={'px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ' + getRoleBadgeColor(value)}>
          {roleLabels[value?.toLowerCase()] || value}
        </span>
      )
    },
    {
      key: 'department' as keyof UserData,
      header: 'Departman',
      render: (value: string) => (
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">{value || '-'}</span>
        </div>
      )
    },
    {
      key: 'status' as keyof UserData,
      header: 'Durum',
      render: (value: string) => (
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${value === 'active' ? 'bg-green-500' : 'bg-rose-500'}`}></span>
            <span className={'px-2 py-0.5 rounded text-xs font-semibold ' + getStatusBadgeColor(value)}>
            {statusLabels[value] || value}
            </span>
        </div>
      )
    },
    {
      key: 'id' as keyof UserData,
      header: 'Eylemler',
      render: (_value: string, user: UserData) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEditClick(user)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const renderFormFields = () => (
    <div className="space-y-5 py-2">
      <div className="grid grid-cols-2 gap-4">
        <TextInput label="Ad" required value={formData.firstName} onChange={(val) => setFormData({ ...formData, firstName: val })} />
        <TextInput label="Soyad" required value={formData.lastName} onChange={(val) => setFormData({ ...formData, lastName: val })} />
      </div>

      <TextInput label="E-posta" required type="email" value={formData.email} onChange={(val) => setFormData({ ...formData, email: val })} />

      <div className="grid grid-cols-2 gap-4">
        <Select
            label="Kullanıcı Rolü"
            options={roles.length > 0 ? roles : []}
            value={formData.role}
            onChange={(val) => setFormData({ ...formData, role: val })}
        />
        <TextInput label="Telefon" type="tel" value={formData.phoneNumber} onChange={(val) => setFormData({ ...formData, phoneNumber: val })} />
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
        <TextInput label="Şifre" type="password" value={formData.password} onChange={(val) => setFormData({ ...formData, password: val })} />
        <TextInput label="Şifre Onay" type="password" value={formData.confirmPassword} onChange={(val) => setFormData({ ...formData, confirmPassword: val })} />
      </div>
    </div>
  );

  return (
    <PageContainer className="bg-[#f8fafc] min-h-screen pb-12">
      <div className="max-w-6xl mx-auto py-10">
        {/* Büyük beyaz kart */}
        <div className="bg-white rounded-2xl shadow-xl p-10 space-y-8">
          <PageHeader
            title="Kullanıcı Yönetimi"
            description="Ekip üyelerini yetkilendirin ve erişim izinlerini kontrol edin."
            action={
              <PrimaryButton onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="shadow-lg shadow-blue-200">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kullanıcı
              </PrimaryButton>
            }
          />

          {/* Statlar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-6 rounded-xl bg-indigo-50">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl bg-emerald-50">
              <UserCheck className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-500">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.active}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl bg-amber-50">
              <Shield className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-gray-500">Admin Sayısı</p>
                <p className="text-2xl font-bold text-amber-900">{stats.admins}</p>
              </div>
            </div>
          </div>

          {/* Filtre Barı */}
          <div className="bg-white p-4 rounded-xl shadow border border-slate-200 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="İsim, e-posta veya departman ile ara..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="w-44"><Select options={[{ value: '', label: 'Tüm Roller' }, ...roles]} value={roleFilter} onChange={setRoleFilter} /></div>
            <div className="w-44"><Select options={[{ value: '', label: 'Tüm Durumlar' }, { value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Pasif' }]} value={statusFilter} onChange={setStatusFilter} /></div>
            <SecondaryButton onClick={fetchUsers} disabled={loading} className="!p-2.5">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </SecondaryButton>
          </div>

          {/* Tablo */}
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
                <p>Veriler güncelleniyor...</p>
              </div>
            ) : (
              <div className="text-sm"><Table data={users} columns={columns} hoverable /></div>
            )}
            {!loading && users.length === 0 && (
              <div className="p-20 text-center text-slate-500 font-medium">Sonuç bulunamadı.</div>
            )}
          </div>
        </div>

        {/* Modals */}
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Yeni Kullanıcı Ekle" size="large">
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Vazgeç</SecondaryButton>
            <PrimaryButton onClick={handleCreateUser} disabled={formLoading}>{formLoading ? 'İşleniyor...' : 'Kullanıcıyı Kaydet'}</PrimaryButton>
          </div>
        </Modal>

        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Kullanıcı Bilgilerini Güncelle" size="large">
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Kapat</SecondaryButton>
            <PrimaryButton onClick={handleUpdateUser} disabled={formLoading}>{formLoading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}</PrimaryButton>
          </div>
        </Modal>

        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Kullanıcıyı Sil" size="small">
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <p className="text-slate-600">
              <strong>{selectedUser?.name}</strong> kullanıcısını silmek üzeresiniz. Bu işlem veritabanından kalıcı olarak kaldırılacaktır.
            </p>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} className="w-full">İptal</SecondaryButton>
            <PrimaryButton onClick={handleDeleteUser} disabled={formLoading} className="w-full !bg-rose-600 hover:!bg-rose-700">
              {formLoading ? 'Siliniyor...' : 'Evet, Sil'}
            </PrimaryButton>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default UsersPage;