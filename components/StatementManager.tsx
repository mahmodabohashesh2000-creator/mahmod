import React, { useState } from 'react';
import { AppState, Party, Transfer } from '../types';
// Fixed missing X icon import
import { 
  Users, 
  Search, 
  ArrowLeftRight, 
  Plus, 
  FileDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  Calendar,
  Wallet,
  X
} from 'lucide-react';
import { exportToExcel } from '../utils/excel';

interface Props {
  data: AppState;
  updateData: (newData: Partial<AppState>) => void;
}

const StatementManager: React.FC<Props> = ({ data, updateData }) => {
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  
  const [transferForm, setTransferForm] = useState({
    fromId: '',
    toId: '',
    amount: 0,
    reason: ''
  });

  const [partyForm, setPartyForm] = useState<Omit<Party, 'id' | 'currentBalance'>>({
    code: '',
    name: '',
    type: 'Customer',
    category: data.categories[0] || 'افتراضي',
    phone: '',
    openingBalance: 0
  });

  const selectedParty = data.parties.find(p => p.id === selectedPartyId);
  const partyHistory = data.invoices
    .filter(inv => inv.partyId === selectedPartyId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleTransfer = () => {
    if (!transferForm.fromId || !transferForm.toId || transferForm.amount <= 0) {
      alert("يرجى إكمال بيانات التحويل");
      return;
    }
    
    const updatedParties = data.parties.map(p => {
      if (p.id === transferForm.fromId) return { ...p, currentBalance: p.currentBalance - transferForm.amount };
      if (p.id === transferForm.toId) return { ...p, currentBalance: p.currentBalance + transferForm.amount };
      return p;
    });

    const newTransfer: Transfer = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      fromPartyId: transferForm.fromId,
      toPartyId: transferForm.toId,
      amount: transferForm.amount,
      reason: transferForm.reason
    };

    updateData({ parties: updatedParties, transfers: [...data.transfers, newTransfer] });
    setShowTransferModal(false);
    setTransferForm({ fromId: '', toId: '', amount: 0, reason: '' });
  };

  const handleAddParty = () => {
    const party: Party = {
      ...partyForm,
      id: Math.random().toString(36).substr(2, 9),
      currentBalance: partyForm.openingBalance
    };
    updateData({ parties: [...data.parties, party] });
    setShowAddPartyModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">كشوف الحسابات والمناقلات</h2>
          <p className="text-slate-500">متابعة أرصدة العملاء والموردين</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all font-bold"
          >
            <ArrowLeftRight size={20} />
            <span>تحويل رصيد</span>
          </button>
          <button 
            onClick={() => setShowAddPartyModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md font-bold"
          >
            <Plus size={20} />
            <span>إضافة عميل/مورد</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Filter size={18} className="text-slate-400" /> فلترة البيانات
            </h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">اختر العميل/المورد</label>
                <select 
                  className="w-full p-3 border rounded-xl bg-slate-50 outline-none"
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                >
                  <option value="">-- اختر الطرف --</option>
                  {data.parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.currentBalance.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar size={12} /> من تاريخ
                </label>
                <input 
                  type="date"
                  className="w-full p-3 border rounded-xl bg-slate-50 outline-none"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar size={12} /> إلى تاريخ
                </label>
                <input 
                  type="date"
                  className="w-full p-3 border rounded-xl bg-slate-50 outline-none"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                />
              </div>
            </div>
          </div>

          {selectedParty && (
            <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl space-y-4">
               <div className="flex items-center justify-between">
                 <div className="p-3 bg-white/10 rounded-xl">
                    <Users size={24} />
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-indigo-200">الرصيد الحالي</p>
                    <p className="text-2xl font-black">{selectedParty.currentBalance.toLocaleString()} <span className="text-sm font-normal">ج.م</span></p>
                 </div>
               </div>
               <div className="pt-4 border-t border-white/10 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">نوع الحساب:</span>
                    <span className="font-bold">{selectedParty.type === 'Customer' ? 'عميل' : selectedParty.type === 'Supplier' ? 'مورد' : 'مشترك'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">التصنيف:</span>
                    <span className="font-bold">{selectedParty.category}</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-bold text-slate-900">تفاصيل الحركات المالية</h3>
            <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-bold">
              <FileDown size={18} /> تصدير PDF
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b">
                  <th className="p-4 font-bold text-sm">التاريخ</th>
                  <th className="p-4 font-bold text-sm">العملية</th>
                  <th className="p-4 font-bold text-sm">مدين</th>
                  <th className="p-4 font-bold text-sm">دائن</th>
                  <th className="p-4 font-bold text-sm">الرصيد</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedPartyId ? (
                   partyHistory.length > 0 ? (
                    partyHistory.map((inv) => {
                      const amount = inv.total;
                      const isDebit = inv.type === 'Sale' || inv.type === 'PurchaseReturn';
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="p-4 text-slate-600 text-sm">{inv.date}</td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-slate-900">#{inv.number}</span>
                            <p className="text-[10px] text-slate-400">
                              {inv.type === 'Sale' ? 'فاتورة بيع' : inv.type === 'Purchase' ? 'فاتورة شراء' : inv.type === 'SaleReturn' ? 'مرتجع مبيعات' : 'مرتجع مشتريات'}
                            </p>
                          </td>
                          <td className="p-4 font-bold text-emerald-600 text-sm">{isDebit ? amount.toLocaleString() : '-'}</td>
                          <td className="p-4 font-bold text-rose-600 text-sm">{!isDebit ? amount.toLocaleString() : '-'}</td>
                          <td className="p-4 font-bold text-slate-900 text-sm">---</td>
                        </tr>
                      );
                    })
                   ) : (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400">لا توجد حركات مسجلة لهذا الطرف</td></tr>
                   )
                ) : (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">يرجى اختيار طرف لعرض كشف الحساب</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">مناقلة رصيد بين الحسابات</h3>
                <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
             </div>
             <div className="flex flex-col md:flex-row items-center gap-6 justify-center py-4 bg-slate-50 rounded-2xl">
               <div className="flex-1 space-y-2 p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold">المحول منه</p>
                  <select 
                    className="w-full p-3 border rounded-xl bg-white text-center font-bold"
                    value={transferForm.fromId}
                    onChange={(e) => setTransferForm({...transferForm, fromId: e.target.value})}
                  >
                    <option value="">اختر الحساب...</option>
                    {data.parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
               </div>
               <div className="p-4 bg-indigo-600 text-white rounded-full shadow-lg">
                  <ArrowUpRight size={24} />
               </div>
               <div className="flex-1 space-y-2 p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold">المحول إليه</p>
                  <select 
                    className="w-full p-3 border rounded-xl bg-white text-center font-bold"
                    value={transferForm.toId}
                    onChange={(e) => setTransferForm({...transferForm, toId: e.target.value})}
                  >
                    <option value="">اختر الحساب...</option>
                    {data.parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">المبلغ</label>
                  <input 
                    type="number"
                    className="w-full p-3 border rounded-xl bg-slate-50"
                    placeholder="0.00"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">سبب التحويل</label>
                  <input 
                    type="text"
                    className="w-full p-3 border rounded-xl bg-slate-50"
                    placeholder="ملاحظات..."
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm({...transferForm, reason: e.target.value})}
                  />
                </div>
             </div>
             <button onClick={handleTransfer} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-xl transition-all">تأكيد عملية التحويل</button>
          </div>
        </div>
      )}

      {/* Add Party Modal */}
      {showAddPartyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-bold">إضافة عميل أو مورد جديد</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-slate-500">كود الطرف</label>
                  <input type="text" className="w-full p-3 border rounded-xl bg-slate-50" value={partyForm.code} onChange={e => setPartyForm({...partyForm, code: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-500">اسم الطرف</label>
                  <input type="text" className="w-full p-3 border rounded-xl bg-slate-50" value={partyForm.name} onChange={e => setPartyForm({...partyForm, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-500">النوع</label>
                  <select className="w-full p-3 border rounded-xl bg-slate-50" value={partyForm.type} onChange={e => setPartyForm({...partyForm, type: e.target.value as any})}>
                    <option value="Customer">عميل</option>
                    <option value="Supplier">مورد</option>
                    <option value="Both">مشترك</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-500">التصنيف</label>
                  <select className="w-full p-3 border rounded-xl bg-slate-50" value={partyForm.category} onChange={e => setPartyForm({...partyForm, category: e.target.value})}>
                    {data.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                   <label className="text-sm text-slate-500">رصيد افتتاحي</label>
                   <input type="number" className="w-full p-3 border rounded-xl bg-slate-50" value={partyForm.openingBalance} onChange={e => setPartyForm({...partyForm, openingBalance: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                   <label className="text-sm text-slate-500">رقم الهاتف</label>
                   <input type="text" className="w-full p-3 border rounded-xl bg-slate-50" value={partyForm.phone} onChange={e => setPartyForm({...partyForm, phone: e.target.value})} />
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={handleAddParty} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">حفظ</button>
                <button onClick={() => setShowAddPartyModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementManager;