import React, { useState, useEffect, useRef } from 'react';
import { AppState, Invoice, InvoiceType, Party, Product, InvoiceItem } from '../types';
// Fixed missing TrendingUp icon import
import { 
  Plus, 
  Trash2, 
  Printer, 
  FileDown, 
  Search, 
  Save, 
  ArrowRightLeft,
  Calendar,
  User,
  Hash,
  MessageSquare,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import { exportToExcel } from '../utils/excel';

interface Props {
  type: InvoiceType;
  data: AppState;
  updateData: (newData: Partial<AppState>) => void;
}

const InvoiceManager: React.FC<Props> = ({ type, data, updateData }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(data.invoices.filter(inv => inv.type === type));
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Invoice['template']>('Classic');

  // New/Edit Invoice State
  const [invoiceForm, setInvoiceForm] = useState<Omit<Invoice, 'id'>>({
    type,
    number: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    partyId: '',
    partyName: '',
    items: [],
    total: 0,
    paidAmount: 0,
    notes: '',
    template: 'Classic'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCell, setActiveCell] = useState<{ row: number, field: string } | null>(null);

  useEffect(() => {
    setInvoices(data.invoices.filter(inv => inv.type === type));
  }, [data.invoices, type]);

  const calculateTotal = (items: InvoiceItem[]) => items.reduce((sum, item) => sum + item.total, 0);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      productCode: '',
      productName: '',
      qty: 1,
      price: 0,
      total: 0
    };
    setInvoiceForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceForm(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'productCode') {
            const product = data.products.find(p => p.code === value);
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.price = product.avgCost;
            }
          }
          updatedItem.total = updatedItem.qty * updatedItem.price;
          return updatedItem;
        }
        return item;
      });
      return { ...prev, items: newItems, total: calculateTotal(newItems) };
    });
  };

  const handleSaveInvoice = () => {
    if (!invoiceForm.partyId || invoiceForm.items.length === 0) {
      alert("يرجى اختيار العميل وإضافة صنف واحد على الأقل");
      return;
    }

    const newInvoice: Invoice = {
      ...invoiceForm,
      id: editingId || Math.random().toString(36).substr(2, 9),
      template: selectedTemplate
    };

    let updatedInvoices = [...data.invoices];
    if (editingId) {
      updatedInvoices = updatedInvoices.map(inv => inv.id === editingId ? newInvoice : inv);
    } else {
      updatedInvoices.push(newInvoice);
    }

    // Update stock and balances
    const updatedProducts = [...data.products];
    const updatedParties = [...data.parties];

    newInvoice.items.forEach(item => {
      const product = updatedProducts.find(p => p.code === item.productCode);
      if (product) {
        if (type === 'Sale' || type === 'PurchaseReturn') {
          product.currentQty -= item.qty;
        } else {
          // Weighted Average Cost for Purchase
          if (type === 'Purchase') {
             const oldTotal = product.currentQty * product.avgCost;
             const newTotal = item.qty * item.price;
             product.avgCost = (oldTotal + newTotal) / (product.currentQty + item.qty) || item.price;
          }
          product.currentQty += item.qty;
        }
      }
    });

    const party = updatedParties.find(p => p.id === newInvoice.partyId);
    if (party) {
      const remaining = newInvoice.total - newInvoice.paidAmount;
      if (type === 'Sale' || type === 'PurchaseReturn') {
        party.currentBalance += remaining;
      } else {
        party.currentBalance -= remaining;
      }
    }

    // Update Treasury if paid amount > 0
    let updatedTreasury = [...data.treasury];
    if (newInvoice.paidAmount > 0) {
      updatedTreasury.push({
        id: Math.random().toString(36).substr(2, 9),
        date: newInvoice.date,
        type: (type === 'Sale' || type === 'PurchaseReturn') ? 'In' : 'Out',
        amount: newInvoice.paidAmount,
        reason: `دفعة فاتورة ${type === 'Sale' ? 'بيع' : type === 'Purchase' ? 'شراء' : 'مرتجع'} رقم ${newInvoice.number}`,
        partyId: newInvoice.partyId
      });
    }

    updateData({ 
      invoices: updatedInvoices, 
      products: updatedProducts, 
      parties: updatedParties,
      treasury: updatedTreasury 
    });
    
    setShowForm(false);
    setEditingId(null);
    setInvoiceForm({
      type,
      number: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      partyId: '',
      partyName: '',
      items: [],
      total: 0,
      paidAmount: 0,
      notes: '',
      template: 'Classic'
    });
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.partyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const typeLabels: Record<InvoiceType, string> = {
    'Sale': 'مبيعات',
    'Purchase': 'مشتريات',
    'SaleReturn': 'مرتجع مبيعات',
    'PurchaseReturn': 'مرتجع مشتريات'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{typeLabels[type]}</h2>
          <p className="text-slate-500">إدارة {typeLabels[type]} والفواتير</p>
        </div>
        {!showForm && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="بحث برقم الفاتورة أو الاسم..."
                className="pr-10 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 w-64 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setShowForm(true); setEditingId(null); }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md"
            >
              <Plus size={20} />
              <span>فاتورة جديدة</span>
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl border shadow-xl p-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <div className="flex items-center gap-4">
               <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                <Trash2 size={20} />
               </button>
               <h3 className="text-xl font-bold">{editingId ? 'تعديل فاتورة' : 'إنشاء فاتورة جديدة'}</h3>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as any)}
                className="border rounded-lg px-3 py-2 text-sm bg-slate-50"
              >
                <option value="Classic">قالب كلاسيك</option>
                <option value="Minimal">قالب مينيمال</option>
                <option value="Modern">قالب مودرن</option>
              </select>
              <button onClick={handleSaveInvoice} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700">
                <Save size={20} />
                <span>حفظ الفاتورة</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Hash size={16} /> رقم الفاتورة
              </label>
              <input 
                type="text"
                className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={invoiceForm.number}
                onChange={(e) => setInvoiceForm({...invoiceForm, number: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Calendar size={16} /> التاريخ
              </label>
              <input 
                type="date"
                className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={invoiceForm.date}
                onChange={(e) => setInvoiceForm({...invoiceForm, date: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <User size={16} /> الطرف (عميل/مورد)
              </label>
              <select 
                className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={invoiceForm.partyId}
                onChange={(e) => {
                  const party = data.parties.find(p => p.id === e.target.value);
                  setInvoiceForm({...invoiceForm, partyId: e.target.value, partyName: party?.name || ''});
                }}
              >
                <option value="">اختر الطرف...</option>
                {data.parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <MessageSquare size={16} /> ملاحظات
              </label>
              <input 
                type="text"
                className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                placeholder="أضف ملاحظات..."
              />
            </div>
          </div>

          <div className="overflow-hidden border rounded-2xl mb-8">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b">
                  <th className="p-4 font-bold text-sm">كود الصنف</th>
                  <th className="p-4 font-bold text-sm">اسم الصنف</th>
                  <th className="p-4 font-bold text-sm">الكمية</th>
                  <th className="p-4 font-bold text-sm">السعر</th>
                  <th className="p-4 font-bold text-sm">الإجمالي</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoiceForm.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2">
                      <select 
                        className="w-full p-2 bg-transparent border-none focus:ring-0 cursor-pointer"
                        value={item.productCode}
                        onChange={(e) => handleItemChange(item.id, 'productCode', e.target.value)}
                      >
                        <option value="">اختر الصنف...</option>
                        {data.products.map(p => (
                          <option key={p.id} value={p.code}>{p.code} - {p.name} (رصيد: {p.currentQty})</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-slate-600 text-sm">{item.productName || '---'}</td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        className="w-24 p-2 bg-transparent border-none text-center focus:ring-0"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', parseFloat(e.target.value))}
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        className="w-24 p-2 bg-transparent border-none text-center focus:ring-0"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value))}
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-900 text-sm">{item.total.toLocaleString()} ج.م</td>
                    <td className="p-2">
                      <button 
                        onClick={() => setInvoiceForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== item.id), total: calculateTotal(prev.items.filter(i => i.id !== item.id)) }))}
                        className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button 
              onClick={handleAddItem}
              className="w-full p-4 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2 font-bold transition-colors"
            >
              <Plus size={20} />
              <span>إضافة صنف للفاتورة</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-between gap-8 pt-8 border-t">
             <div className="w-full max-w-sm space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                 <span className="text-slate-600 font-semibold">المبلغ المسدد:</span>
                 <input 
                  type="number"
                  className="bg-white border rounded-lg p-2 w-32 text-left font-bold"
                  value={invoiceForm.paidAmount}
                  onChange={(e) => setInvoiceForm({...invoiceForm, paidAmount: parseFloat(e.target.value) || 0})}
                 />
               </div>
               <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl text-rose-700">
                 <span className="font-semibold">المبلغ المتبقي:</span>
                 <span className="font-bold text-lg">{(invoiceForm.total - invoiceForm.paidAmount).toLocaleString()} ج.م</span>
               </div>
             </div>

             <div className="w-full max-w-md bg-indigo-900 text-white rounded-3xl p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <TrendingUp size={120} />
                </div>
                <p className="text-indigo-200 uppercase tracking-widest text-sm font-bold">إجمالي الفاتورة</p>
                <h4 className="text-5xl font-black">{invoiceForm.total.toLocaleString()} <span className="text-2xl font-normal opacity-70">ج.م</span></h4>
                <div className="flex items-center gap-2 text-indigo-300 text-sm bg-white/5 p-3 rounded-2xl w-fit">
                  <ArrowRightLeft size={16} />
                  <span>صافي العمليات الحسابية</span>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b">
                  <th className="p-4 font-bold text-sm">رقم الفاتورة</th>
                  <th className="p-4 font-bold text-sm">التاريخ</th>
                  <th className="p-4 font-bold text-sm">الطرف</th>
                  <th className="p-4 font-bold text-sm">الإجمالي</th>
                  <th className="p-4 font-bold text-sm">المسدد</th>
                  <th className="p-4 font-bold text-sm">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-bold text-slate-900">#{inv.number}</td>
                    <td className="p-4 text-slate-600">{inv.date}</td>
                    <td className="p-4 text-slate-600 font-medium">{inv.partyName}</td>
                    <td className="p-4 font-bold text-indigo-600">{inv.total.toLocaleString()} ج.م</td>
                    <td className="p-4 text-emerald-600 font-bold">{inv.paidAmount.toLocaleString()} ج.م</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white border rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-colors shadow-sm">
                          <Printer size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingId(inv.id);
                            setInvoiceForm(inv);
                            setSelectedTemplate(inv.template);
                            setShowForm(true);
                          }}
                          className="p-2 bg-white border rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-colors shadow-sm"
                        >
                          <FileDown size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
                              updateData({ invoices: data.invoices.filter(i => i.id !== inv.id) });
                            }
                          }}
                          className="p-2 bg-white border rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-600 transition-colors shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <FileSpreadsheet className="mx-auto mb-4 opacity-20" size={64} />
                <p>لا توجد فواتير مطابقة للبحث</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManager;