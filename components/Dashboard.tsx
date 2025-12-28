import React from 'react';
import { AppState } from '../types';
import { 
  Users, Package, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, AlertCircle, ShoppingBag, History, MousePointer2
} from 'lucide-react';

interface Props {
  data: AppState;
}

const Dashboard: React.FC<Props> = ({ data }) => {
  const totalSales = data.invoices.filter(i => i.type === 'Sale').reduce((sum, i) => sum + i.total, 0);
  const totalPurchases = data.invoices.filter(i => i.type === 'Purchase').reduce((sum, i) => sum + i.total, 0);
  const totalCustomers = data.parties.filter(p => p.type === 'Customer' || p.type === 'Both').length;
  const lowStock = data.products.filter(p => p.currentQty < 5).length;

  const stats = [
    { label: 'إجمالي المبيعات', value: totalSales, icon: ShoppingBag, color: '#2b579a' },
    { label: 'إجمالي المشتريات', value: totalPurchases, icon: ArrowDownLeft, color: '#e74c3c' },
    { label: 'عدد العملاء', value: totalCustomers, icon: Users, color: '#27ae60' },
    { label: 'نواقص المخزن', value: lowStock, icon: AlertCircle, color: '#f39c12' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">لوحة التحكم</h1>
          <p className="text-slate-500 text-sm">ملخص العمليات المالية والمخزنية لليوم</p>
        </div>
        <div className="text-left bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
            <span className="text-[10px] font-bold text-blue-600 block">توقيت النظام</span>
            <span className="text-sm font-bold text-blue-900">{new Date().toLocaleDateString('ar-EG')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div style={{ backgroundColor: `${stat.color}15`, color: stat.color }} className="p-3 rounded-xl">
                <stat.icon size={24} />
              </div>
              <TrendingUp size={16} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-xs font-bold mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-800">{stat.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                <History size={18} className="text-blue-600" /> آخر النشاطات
            </h3>
            <div className="space-y-4">
                {data.invoices.length === 0 ? (
                    <div className="text-center py-10 text-slate-300 font-bold">لا توجد عمليات مسجلة حتى الآن</div>
                ) : (
                    data.invoices.slice(-5).reverse().map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${inv.type === 'Sale' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {inv.type === 'Sale' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">فاتورة {inv.type === 'Sale' ? 'مبيعات' : 'مشتريات'} #{inv.number}</p>
                                    <p className="text-[10px] text-slate-400">{inv.partyName}</p>
                                </div>
                            </div>
                            <p className="font-black text-sm">{inv.total.toLocaleString()} ج.م</p>
                        </div>
                    ))
                )}
            </div>
        </div>

        <div className="bg-blue-900 rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-xl font-black mb-2">أركان المحاسبي</h3>
                <p className="text-xs text-blue-200 leading-relaxed">
                    تم تصميم هذا النظام ليعمل بكفاءة عالية على أجهزة الكمبيوتر المكتبية، مما يوفر لك سرعة في إدخال البيانات ودقة في التقارير.
                </p>
            </div>
            <div className="mt-8 space-y-3 relative z-10">
                <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold">حالة قاعدة البيانات</span>
                    <span className="text-[10px] bg-green-500 px-2 py-0.5 rounded-full">متصلة</span>
                </div>
                <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold">النسخة الاحتياطية</span>
                    <span className="text-[10px] opacity-60">تلقائي</span>
                </div>
            </div>
            <Wallet size={120} className="absolute -bottom-10 -right-10 opacity-10" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;