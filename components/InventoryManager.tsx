
import React, { useState } from 'react';
import { AppState, Product } from '../types';
import { Package, Plus, Search, TrendingUp, History, FileDown, Trash2 } from 'lucide-react';
import { exportToExcel } from '../utils/excel';

interface Props {
  data: AppState;
  updateData: (newData: Partial<AppState>) => void;
}

const InventoryManager: React.FC<Props> = ({ data, updateData }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'currentQty'>>({
    code: '',
    name: '',
    openingQty: 0,
    openingValue: 0,
    avgCost: 0
  });

  const handleAddProduct = () => {
    if (!newProduct.code || !newProduct.name) {
      alert("يرجى إكمال بيانات الصنف");
      return;
    }
    const product: Product = {
      ...newProduct,
      id: Math.random().toString(36).substr(2, 9),
      currentQty: newProduct.openingQty,
      avgCost: newProduct.openingValue / newProduct.openingQty || 0
    };
    updateData({ products: [...data.products, product] });
    setShowModal(false);
    setNewProduct({ code: '', name: '', openingQty: 0, openingValue: 0, avgCost: 0 });
  };

  const filteredProducts = data.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">إدارة المخزن</h2>
          <p className="text-slate-500">الأصناف المتاحة وحركات المخزون</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="بحث بالكود أو الاسم..."
              className="pr-10 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 w-64 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md"
          >
            <Plus size={20} />
            <span>إضافة صنف</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b">
                <th className="p-4 font-bold text-sm">الكود</th>
                <th className="p-4 font-bold text-sm">الاسم</th>
                <th className="p-4 font-bold text-sm">الرصيد الحالي</th>
                <th className="p-4 font-bold text-sm">متوسط التكلفة</th>
                <th className="p-4 font-bold text-sm">القيمة</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 group">
                  <td className="p-4 font-mono text-xs">{p.code}</td>
                  <td className="p-4 font-bold text-slate-900">{p.name}</td>
                  <td className={`p-4 font-bold ${p.currentQty < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {p.currentQty}
                  </td>
                  <td className="p-4 text-slate-600">{p.avgCost.toLocaleString()} ج.م</td>
                  <td className="p-4 font-bold text-indigo-600">{(p.currentQty * p.avgCost).toLocaleString()} ج.م</td>
                  <td className="p-4">
                    <button 
                      onClick={() => updateData({ products: data.products.filter(item => item.id !== p.id) })}
                      className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
             <div className="p-12 text-center text-slate-400">
              <Package className="mx-auto mb-4 opacity-20" size={64} />
              <p>لا توجد أصناف مسجلة حالياً</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
             <div className="flex items-center gap-3 text-emerald-600 mb-2">
               <TrendingUp size={24} />
               <h4 className="font-bold">إحصائيات سريعة</h4>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-xl">
                 <p className="text-xs text-slate-500 mb-1">إجمالي الأصناف</p>
                 <p className="text-xl font-bold">{data.products.length}</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl">
                 <p className="text-xs text-slate-500 mb-1">أصناف منتهية</p>
                 <p className="text-xl font-bold text-rose-600">{data.products.filter(p => p.currentQty <= 0).length}</p>
               </div>
             </div>
           </div>

           <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
             <div className="flex items-center gap-3 mb-2">
               <History size={24} className="text-indigo-300" />
               <h4 className="font-bold">أحدث الحركات</h4>
             </div>
             <div className="space-y-3">
               {data.invoices.slice(-3).reverse().map(inv => (
                 <div key={inv.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                   <div className="text-xs">
                     <p className="font-bold">{inv.type === 'Sale' ? 'فاتورة بيع' : 'فاتورة شراء'} #{inv.number}</p>
                     <p className="opacity-50">{inv.date}</p>
                   </div>
                   <div className="text-right">
                     <p className={`font-bold ${inv.type === 'Sale' ? 'text-rose-300' : 'text-emerald-300'}`}>
                       {inv.items.reduce((sum, i) => sum + i.qty, 0)} قطعة
                     </p>
                   </div>
                 </div>
               ))}
               <button className="w-full text-center text-xs text-indigo-300 hover:text-white transition-colors">عرض السجل الكامل</button>
             </div>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900">إضافة صنف جديد للمخزن</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">كود الصنف</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl bg-slate-50"
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                  placeholder="مثال: ITEM-001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">اسم الصنف</label>
                <input 
                  type="text" 
                  className="w-full p-3 border rounded-xl bg-slate-50"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="اسم المنتج..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">رصيد أول المدة (كمية)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border rounded-xl bg-slate-50"
                  value={newProduct.openingQty}
                  onChange={(e) => setNewProduct({...newProduct, openingQty: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">رصيد أول المدة (قيمة)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border rounded-xl bg-slate-50"
                  value={newProduct.openingValue}
                  onChange={(e) => setNewProduct({...newProduct, openingValue: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddProduct} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">حفظ الصنف</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
