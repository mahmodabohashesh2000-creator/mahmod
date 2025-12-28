
import React, { useState } from 'react';
import { AppState } from '../types';
import { TrendingUp, FileDown, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  data: AppState;
}

const ReportsManager: React.FC<Props> = ({ data }) => {
  const [period, setPeriod] = useState({ from: '', to: '' });

  const filterByPeriod = (item: { date: string }) => {
    if (!period.from || !period.to) return true;
    return item.date >= period.from && item.date <= period.to;
  };

  const sales = data.invoices.filter(i => i.type === 'Sale' && filterByPeriod(i)).reduce((s, i) => s + i.total, 0);
  const purchase = data.invoices.filter(i => i.type === 'Purchase' && filterByPeriod(i)).reduce((s, i) => s + i.total, 0);
  const saleReturns = data.invoices.filter(i => i.type === 'SaleReturn' && filterByPeriod(i)).reduce((s, i) => s + i.total, 0);
  const purchaseReturns = data.invoices.filter(i => i.type === 'PurchaseReturn' && filterByPeriod(i)).reduce((s, i) => s + i.total, 0);
  
  const netSales = sales - saleReturns;
  const netPurchases = purchase - purchaseReturns;
  const operatingExpenses = data.treasury.filter(t => t.type === 'Out' && filterByPeriod(t)).reduce((s, t) => s + t.amount, 0);
  const otherIncome = data.treasury.filter(t => t.type === 'In' && !t.partyId && filterByPeriod(t)).reduce((s, t) => s + t.amount, 0);
  
  const grossProfit = netSales - netPurchases; // Simplified
  const netProfit = grossProfit - operatingExpenses + otherIncome;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">التقارير المالية</h2>
          <p className="text-slate-500">تحليل الأرباح والخسائر والمؤشرات</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 border rounded-xl shadow-sm">
           <Calendar size={18} className="text-slate-400 mr-2" />
           <input type="date" className="p-1 text-sm border-none focus:ring-0" value={period.from} onChange={e => setPeriod({...period, from: e.target.value})} />
           <span className="text-slate-300">|</span>
           <input type="date" className="p-1 text-sm border-none focus:ring-0" value={period.to} onChange={e => setPeriod({...period, to: e.target.value})} />
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
        <div className={`p-8 ${netProfit >= 0 ? 'bg-emerald-600' : 'bg-rose-600'} text-white flex items-center justify-between`}>
          <div>
            <p className="text-emerald-100 opacity-80 font-bold mb-2">صافي الربح / الخسارة للفترة</p>
            <h3 className="text-5xl font-black">{netProfit.toLocaleString()} <span className="text-xl font-normal opacity-70">ج.م</span></h3>
          </div>
          <div className="p-6 bg-white/10 rounded-full">
            <TrendingUp size={64} />
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest border-b pb-2">النشاط التجاري</h4>
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-slate-600 font-bold text-sm">صافي المبيعات</span>
                 <span className="text-slate-900 font-black">{netSales.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-600 font-bold text-sm">صافي المشتريات</span>
                 <span className="text-slate-900 font-black text-rose-600">({netPurchases.toLocaleString()})</span>
               </div>
               <div className="pt-2 border-t flex justify-between items-center text-indigo-600">
                 <span className="font-bold text-sm">مجمل الربح</span>
                 <span className="font-black">{(netSales - netPurchases).toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest border-b pb-2">التكاليف التشغيلية</h4>
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-slate-600 font-bold text-sm">إجمالي المصروفات</span>
                 <span className="text-rose-600 font-black">({operatingExpenses.toLocaleString()})</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-600 font-bold text-sm">إيرادات أخرى</span>
                 <span className="text-emerald-600 font-black">{otherIncome.toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 flex flex-col justify-center">
             <div className="flex items-center gap-4 mb-4">
                <div className={`w-3 h-3 rounded-full ${netProfit >= 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                <p className="text-slate-700 font-bold">ملخص الحالة المالية</p>
             </div>
             <p className="text-slate-500 text-sm leading-relaxed">
               {netProfit >= 0 
                ? `النظام يشير إلى تحقيق أرباح بقيمة ${netProfit.toLocaleString()} ج.م خلال الفترة المختارة. هذا الأداء ناتج عن تفوق المبيعات على التكاليف والمصروفات بنسبة جيدة.`
                : `هناك خسائر تشغيلية مسجلة بقيمة ${Math.abs(netProfit).toLocaleString()} ج.م. يرجى مراجعة بنود المصروفات وحجم المبيعات لزيادة الهامش الربحي.`
               }
             </p>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t">
          <button className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold shadow-sm">
            <FileDown size={18} /> تصدير PDF
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 font-bold shadow-md">
            طباعة التقرير
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
