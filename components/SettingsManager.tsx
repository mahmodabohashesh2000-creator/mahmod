import React, { useState } from 'react';
import { AppState, CompanyInfo, User } from '../types';
import { Settings, Shield, Building, Database, Save, UserPlus, Key, Trash2, Camera, Download, Upload, Search } from 'lucide-react';

interface Props {
  data: AppState;
  updateData: (newData: Partial<AppState>) => void;
  currentUser: User;
}

const SettingsManager: React.FC<Props> = ({ data, updateData, currentUser }) => {
  const [activeTab, setActiveTab] = useState('company');
  const [companyForm, setCompanyForm] = useState(data.companyInfo);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    username: '',
    password: '',
    role: 'Accountant',
    permissions: ['dashboard', 'sales', 'statements', 'treasury']
  });

  const handleSaveCompany = () => {
    updateData({ companyInfo: companyForm });
    alert("✅ تم حفظ بيانات المؤسسة بنجاح");
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
      alert("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    const user: User = {
      ...newUser,
      id: Math.random().toString(36).substr(2, 9)
    };
    updateData({ users: [...data.users, user] });
    setShowAddUser(false);
    setNewUser({ username: '', password: '', role: 'Accountant', permissions: ['dashboard', 'sales', 'statements', 'treasury'] });
  };

  const handleExportBackup = () => {
    const backup = JSON.stringify(data);
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arkan_backup_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.json`;
    a.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (confirm("⚠️ تحذير: استعادة النسخة سيؤدي لمسح البيانات الحالية. هل تريد الاستمرار؟")) {
            updateData(imported);
            alert("✅ تمت استعادة البيانات بنجاح");
          }
        } catch (err) {
          alert("❌ الملف غير صالح أو تالف");
        }
      };
      reader.readAsText(file);
    }
  };

  // تصفية المستخدمين بناءً على كلمة البحث (غير حساسة لحالة الأحرف)
  const filteredUsers = data.users.filter(u => 
    u.username.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
          <Settings size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">إعدادات النظام</h2>
          <p className="text-slate-500 text-sm">إدارة هوية الشركة، المستخدمين، وقواعد البيانات</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-200/50 p-1.5 rounded-xl border w-fit">
        <button 
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'company' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
        >
          <Building size={16} /> هوية الشركة
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
        >
          <Shield size={16} /> صلاحيات المستخدمين
        </button>
        <button 
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'backup' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
        >
          <Database size={16} /> قاعدة البيانات
        </button>
      </div>

      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4 text-center">
               <div className="w-48 h-48 mx-auto rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 relative group overflow-hidden">
                  {companyForm.logo ? (
                    <img src={companyForm.logo} className="w-full h-full object-contain p-2" alt="Logo" />
                  ) : (
                    <Building className="text-slate-200" size={64} />
                  )}
                  <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <Camera className="text-white" size={28} />
                  </div>
               </div>
               <p className="text-xs font-bold text-slate-500">شعار المؤسسة</p>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { label: 'اسم المنشأة', key: 'name' },
                 { label: 'رقم الهاتف', key: 'phone' },
                 { label: 'واتساب', key: 'whatsapp' },
                 { label: 'السجل التجاري', key: 'commercialRegister' },
                 { label: 'البطاقة الضريبية', key: 'taxCard' },
                 { label: 'العنوان', key: 'address' }
               ].map(field => (
                 <div key={field.key} className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 mr-1">{field.label}</label>
                   <input 
                    type="text" 
                    className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" 
                    value={(companyForm as any)[field.key]} 
                    onChange={e => setCompanyForm({...companyForm, [field.key]: e.target.value})} 
                   />
                 </div>
               ))}
            </div>
          </div>
          <div className="flex justify-end pt-6 border-t">
             <button onClick={handleSaveCompany} className="flex items-center gap-2 bg-blue-700 text-white px-8 py-3 rounded-xl hover:bg-blue-800 shadow-lg font-black transition-all">
               <Save size={20} /> حفظ البيانات
             </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
           <div className="p-6 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
             <div className="relative w-full sm:w-80">
               <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="ابحث عن مستخدم..."
                 className="w-full pr-10 pl-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                 value={userSearchTerm}
                 onChange={(e) => setUserSearchTerm(e.target.value)}
               />
             </div>
             <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 font-bold shadow-md w-full sm:w-auto justify-center">
               <UserPlus size={18} /> إضافة مستخدم
             </button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-right">
               <thead>
                 <tr className="bg-slate-100 text-slate-500 text-xs border-b">
                   <th className="p-4">اسم المستخدم</th>
                   <th className="p-4">الدور الوظيفي</th>
                   <th className="p-4">تاريخ النشاط</th>
                   <th className="p-4 w-20">إجراء</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {filteredUsers.map(u => (
                   <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                     <td className="p-4 font-bold text-slate-800">{u.username}</td>
                     <td className="p-4">
                       <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${u.role === 'Admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                         {u.role === 'Admin' ? 'مدير نظام' : 'محاسب'}
                       </span>
                     </td>
                     <td className="p-4 text-xs text-slate-400">نشط الآن</td>
                     <td className="p-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600"><Key size={16} /></button>
                          {u.id !== currentUser.id && (
                            <button onClick={() => updateData({ users: data.users.filter(item => item.id !== u.id) })} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                          )}
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {filteredUsers.length === 0 && (
               <div className="p-12 text-center text-slate-400 font-bold">لم يتم العثور على نتائج للبحث</div>
             )}
           </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
           <div className="bg-blue-800 text-white p-8 rounded-2xl shadow-lg space-y-4">
              <Download size={32} className="text-blue-200" />
              <h3 className="text-lg font-bold">تصدير قاعدة البيانات</h3>
              <p className="text-sm text-blue-100 opacity-80 leading-relaxed">قم بتحميل نسخة كاملة من بياناتك (الفواتير، العملاء، المخزن) كملف احتياطي لاستخدامه في حال حدوث طوارئ.</p>
              <button onClick={handleExportBackup} className="w-full bg-white text-blue-800 py-3 rounded-xl font-black hover:bg-blue-50 transition-all">تحميل النسخة (.JSON)</button>
           </div>

           <div className="bg-white border-2 border-dashed border-slate-300 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              <Upload size={32} className="text-slate-300" />
              <div>
                <h3 className="text-lg font-bold text-slate-700">استعادة البيانات</h3>
                <p className="text-sm text-slate-400">اختر ملف النسخة الاحتياطية لرفع بياناتك للنظام مرة أخرى.</p>
              </div>
              <label className="w-full">
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" id="import-input" />
                <label htmlFor="import-input" className="block w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-black hover:bg-slate-200 cursor-pointer transition-all">رفع الملف واستعادة الحسابات</label>
              </label>
           </div>
        </div>
      )}

      {showAddUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-800 border-b pb-4">مستخدم جديد</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">اسم الدخول</label>
                <input type="text" className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">كلمة المرور</label>
                <input type="password" className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">الصلاحيات</label>
                <select className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                  <option value="Admin">مدير نظام كامل</option>
                  <option value="Accountant">محاسب محدود</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
               <button onClick={handleAddUser} className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-black">حفظ المستخدم</button>
               <button onClick={() => setShowAddUser(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black">تراجع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;