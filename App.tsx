import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Store, Users, TrendingUp, Settings, LogOut, Package, Wallet, Menu, X, Monitor
} from 'lucide-react';
import { AppState, User, CompanyInfo } from './types';
import Dashboard from './components/Dashboard';
import InvoiceManager from './components/InvoiceManager';
import InventoryManager from './components/InventoryManager';
import StatementManager from './components/StatementManager';
import TreasuryManager from './components/TreasuryManager';
import ReportsManager from './components/ReportsManager';
import SettingsManager from './components/SettingsManager';
import Login from './components/Login';

const STORAGE_KEY = 'arkan_erp_db_stable_v1';

const initialCompany: CompanyInfo = {
  name: 'مؤسسة أركان التجارية',
  phone: '01000000000',
  whatsapp: '01000000000',
  address: 'القاهرة، مصر',
  commercialRegister: '123456',
  taxCard: '987-654-321'
};

const defaultAdmin: User = {
  id: '1',
  username: 'admin',
  password: '123',
  role: 'Admin',
  permissions: ['dashboard', 'sales', 'purchases', 'inventory', 'statements', 'treasury', 'reports', 'settings', 'import']
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      users: [defaultAdmin],
      parties: [],
      products: [],
      invoices: [],
      treasury: [],
      transfers: [],
      companyInfo: initialCompany,
      categories: ['عملاء جملة', 'عملاء قطاعي', 'موردين']
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((newData: Partial<AppState>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} users={data.users} companyInfo={data.companyInfo} />;
  }

  const renderContent = () => {
    const props = { data, updateData };
    switch (activeTab) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'sales': return <InvoiceManager type="Sale" {...props} />;
      case 'purchases': return <InvoiceManager type="Purchase" {...props} />;
      case 'inventory': return <InventoryManager {...props} />;
      case 'statements': return <StatementManager {...props} />;
      case 'treasury': return <TreasuryManager {...props} />;
      case 'reports': return <ReportsManager {...props} />;
      case 'settings': return <SettingsManager {...props} currentUser={currentUser} />;
      default: return <Dashboard {...props} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'sales', label: 'المبيعات', icon: ShoppingCart },
    { id: 'purchases', label: 'المشتريات', icon: Store },
    { id: 'statements', label: 'الحسابات', icon: Users },
    { id: 'inventory', label: 'المخازن', icon: Package },
    { id: 'treasury', label: 'الخزينة', icon: Wallet },
    { id: 'reports', label: 'التقارير', icon: TrendingUp },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden', background: '#f8f9fa' }} dir="rtl">
      {/* Sidebar - CSS Fixed for Stability */}
      <aside 
        style={{ 
          width: sidebarOpen ? '260px' : '70px', 
          backgroundColor: '#2b579a', 
          color: '#ffffff', 
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease-in-out',
          flexShrink: 0,
          boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
          zIndex: 100
        }}
      >
        <div style={{ padding: '15px', height: '65px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ minWidth: '40px', display: 'flex', justifyContent: 'center' }}><Monitor size={24} /></div>
          {sidebarOpen && <span style={{ fontWeight: '900', fontSize: '20px', whiteSpace: 'nowrap' }}>أركان <span style={{opacity: 0.6}}>ERP</span></span>}
        </div>
        
        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '12px 15px',
                borderRadius: '10px',
                marginBottom: '6px',
                border: 'none',
                background: activeTab === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'right',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}><item.icon size={20} /></div>
              {sidebarOpen && <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setCurrentUser(null)}
          style={{ 
            padding: '20px', 
            background: 'rgba(0,0,0,0.1)', 
            border: 'none', 
            color: '#ffffff', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            width: '100%',
            marginTop: 'auto'
          }}
        >
          <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}><LogOut size={20} /></div>
          {sidebarOpen && <span style={{ fontWeight: 'bold' }}>خروج</span>}
        </button>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ 
          height: '65px', 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #eee', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 25px',
          flexShrink: 0,
          zIndex: 90
        }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{ 
              padding: '10px', 
              background: '#f8f9fa', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              cursor: 'pointer',
              color: '#2b579a',
              display: 'flex', alignItems: 'center'
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '10px', color: '#888', fontWeight: 'bold' }}>أهلاً بك</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#2b579a' }}>{currentUser.username}</p>
            </div>
            <div style={{ width: '40px', height: '40px', background: '#2b579a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'white', fontWeight: 'bold', justifyContent: 'center' }}>
              {currentUser.username[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '30px', position: 'relative' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;