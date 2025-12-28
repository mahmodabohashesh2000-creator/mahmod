
import React, { useState } from 'react';
import { User, CompanyInfo } from '../types';
import { ShieldCheck, User as UserIcon, Lock, TrendingUp } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  users: User[];
  companyInfo: CompanyInfo;
}

const Login: React.FC<Props> = ({ onLogin, users, companyInfo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('خطأ في اسم المستخدم أو كلمة المرور');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      <div className="flex-1 bg-gradient-to-br from-indigo-900 to-indigo-700 p-12 flex flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-lg mx-auto md:mx-0">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
            <TrendingUp size={40} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">نظام أركان <br /> <span className="text-indigo-300">لإدارة الأعمال</span></h1>
            <p className="text-indigo-100/70 text-lg mt-4 font-light">الحل المتكامل للمحاسبة والمخازن وإدارة العملاء. أمان تام، سهولة استثنائية، وتقارير احترافية.</p>
          </div>
          <div className="flex items-center gap-6 pt-4">
             <div className="text-center">
               <p className="text-2xl font-black">100%</p>
               <p className="text-[10px] uppercase opacity-50 tracking-widest">أمان البيانات</p>
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <div className="text-center">
               <p className="text-2xl font-black">24/7</p>
               <p className="text-[10px] uppercase opacity-50 tracking-widest">بدون إنترنت</p>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center space-y-2">
            {companyInfo.logo ? (
              <img src={companyInfo.logo} className="h-16 mx-auto mb-4" alt="Logo" />
            ) : (
               <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-400 mb-4">
                 <ShieldCheck size={32} />
               </div>
            )}
            <h2 className="text-3xl font-black text-slate-900">تسجيل الدخول</h2>
            <p className="text-slate-400">مرحباً بك مجدداً في {companyInfo.name}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3 animate-shake">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600 px-1">اسم المستخدم</label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600 px-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold"
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
            >
              دخول النظام
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs">
            أركان ERP الإصدار 2024.1 <br /> جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

const AlertCircle: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default Login;
