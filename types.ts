
export type UserRole = 'Admin' | 'Accountant';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  permissions: string[];
}

export type InvoiceType = 'Sale' | 'Purchase' | 'SaleReturn' | 'PurchaseReturn';

export interface InvoiceItem {
  id: string;
  productCode: string;
  productName: string;
  qty: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  number: string;
  date: string;
  partyId: string;
  partyName: string;
  items: InvoiceItem[];
  total: number;
  paidAmount: number;
  notes: string;
  template: 'Classic' | 'Minimal' | 'Modern';
}

export interface Party {
  id: string;
  code: string;
  name: string;
  type: 'Customer' | 'Supplier' | 'Both';
  category: string;
  phone: string;
  openingBalance: number;
  currentBalance: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  openingQty: number;
  openingValue: number;
  currentQty: number;
  avgCost: number;
}

export interface TreasuryTransaction {
  id: string;
  date: string;
  type: 'In' | 'Out';
  amount: number;
  reason: string;
  partyId?: string;
}

export interface Transfer {
  id: string;
  date: string;
  fromPartyId: string;
  toPartyId: string;
  amount: number;
  reason: string;
}

export interface CompanyInfo {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  commercialRegister: string;
  taxCard: string;
  logo?: string;
}

export interface AppState {
  users: User[];
  parties: Party[];
  products: Product[];
  invoices: Invoice[];
  treasury: TreasuryTransaction[];
  transfers: Transfer[];
  companyInfo: CompanyInfo;
  categories: string[];
}
