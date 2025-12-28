
import React, { useState } from 'react';
import { AppState, TreasuryTransaction } from '../types';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Search, Calendar, Trash2 } from 'lucide-react';

interface Props {
  data: AppState;
  updateData: (newData: Partial<AppState>) => void;
}

const TreasuryManager: React.FC<Props> = ({ data, updateData }) => {
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', search: '' });
  const [newTx, setNewTx] = useState<Omit<TreasuryTransaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    type: 'In',
    amount: 0,
    reason: ''
  });

  const handleAddTx = () => {
    if (newTx.amount <= 0 || !newTx.reason) {
      alert("يرجى إدخال المبلغ والسبب");
      return;
    }
    const tx: TreasuryTransaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9)
    };
    updateData({ treasury: [...data.treasury, tx] });
    setShowModal(false);
    setNewTx({ date: new Date().toISOString().split('T')[0], type: 'In', amount: 0, reason: '' });
  };

  const cashIn = data.treasury.filter(t => t.type === 'In').reduce((sum, t) => sum + t.amount, 0);
  const cashOut = data.treasury.filter(t => t.type === 'Out').reduce((sum, t) => sum + t.amount, 0);
  const balance = cashIn - cashOut;

  const filteredHistory = data.treasury
    .filter(t => {
      if (filters.from && t.date < filters.from) return false;
      if (filters.to && t.date > filters.to) return false;
      if (filters.search && !t.reason.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة الخزينة</h2>
          <p className="text-slate-500">المقبوضات والمصروفات النقدية</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md font-bold"
        >
          <Plus size={20} />
          <span>إضافة حركة نقدية</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-emerald-600 text-sm font-bold mb-1">إجمالي المقبوضات</p>
            <h3 className="text-2xl font-black text-emerald-700">{cashIn.toLocaleString()} ج.م</h3>
          </div>
          <ArrowUpCircle className="text-emerald-500" size={40} />
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-rose-600 text-sm font-bold mb-1">إجمالي المصروفات</p>
            <h3 className="text-2xl font-black text-rose-700">{cashOut.toLocaleString()} ج.م</h3>
          </div>
          <ArrowDownCircle className="text-rose-500" size={40} />
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl flex items-center justify-between text-white shadow-xl">
          <div>
            <p className="text-indigo-200 text-sm font-bold mb-1">الرصيد النقدي الحالي</p>
            <h3 className="text-2xl font-black">{balance.toLocaleString()} ج.م</h3>
          </div>
          <Wallet className="text-indigo-300" size={40} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center gap-4 bg-slate-50">
           <div className="relative">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input type="text" placeholder="بحث بالسبب..." className="pr-10 pl-4 py-2 border rounded-xl text-sm" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
           </div>
           <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
              <Calendar size={16} />
              <span>من</span>
              <input type="date" className="p-2 border rounded-xl" value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})} />
              <span>إلى</span>
              <input type="date" className="p-2 border rounded-xl" value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})} />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-500 border-b">
                <th className="p-4 font-bold text-sm">التاريخ</th>
                <th className="p-4 font-bold text-sm">النوع</th>
                <th className="p-4 font-bold text-sm">المبلغ</th>
                <th className="p-4 font-bold text-sm">السبب / البيان</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 group">
                  <td className="p-4 text-slate-600 text-sm font-mono">{tx.date}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${tx.type === 'In' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {tx.type === 'In' ? 'داخل' : 'خارج'}
                    </span>
                  </td>
                  <td className={`p-4 font-bold ${tx.type === 'In' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.amount.toLocaleString()} ج.م
                  </td>
                  <td className="p-4 text-slate-700 font-medium text-sm">{tx.reason}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => updateData({ treasury: data.treasury.filter(t => t.id !== tx.id) })}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <div className="p-12 text-center text-slate-400">لا توجد حركات نقدية مطابقة</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-bold">تسجيل حركة نقدية جديدة</h3>
             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">التاريخ</label>
                  <input type="date" className="w-full p-3 border rounded-xl bg-slate-50" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">نوع الحركة</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setNewTx({...newTx, type: 'In'})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${newTx.type === 'In' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
                    >مقبوضات (داخل)</button>
                    <button 
                      onClick={() => setNewTx({...newTx, type: 'Out'})}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${newTx.type === 'Out' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
                    >مصروفات (خارج)</button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">المبلغ</label>
                  <input type="number" className="w-full p-3 border rounded-xl bg-slate-50 text-xl font-black" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">السبب / البيان</label>
                  <textarea className="w-full p-3 border rounded-xl bg-slate-50 h-24" value={newTx.reason} onChange={e => setNewTx({...newTx, reason: e.target.value})} placeholder="اكتب تفاصيل العملية هنا..."></textarea>
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={handleAddTx} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-xl">حفظ الحركة</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryManager;
