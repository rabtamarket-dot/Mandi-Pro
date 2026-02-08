
export interface WeightEntry {
  id: string;
  weight: number;
  label: string;
}

export interface CustomExpense {
  id: string;
  name: string;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  bharti: number;
  quantity: number;
  katt: number;
  rate: number; 
  weight: number; 
}

export interface InvoiceData {
  id?: string;
  shopName: string;
  address: string;
  phone: string;
  billNumber: string;
  partyName: string;
  date: string;
  trolleyNo: string;
  brokerName: string;
  ratePerMaund: number;
  commissionRate: number;
  commissionImpact: 'plus' | 'minus';
  items: InvoiceItem[];
  weights: WeightEntry[];
  khaliBardanaRate: number;
  brokerageRate: number;
  laborCharges: number;
  biltyCharges: number;
  customExpenses: CustomExpense[];
}

export const DEFAULT_INVOICE: InvoiceData = {
  shopName: '',
  address: '',
  phone: '',
  billNumber: '',
  partyName: '',
  date: new Date().toISOString().split('T')[0],
  trolleyNo: '',
  brokerName: '',
  ratePerMaund: 0,
  commissionRate: 1.0,
  commissionImpact: 'minus',
  items: [],
  weights: [],
  khaliBardanaRate: 0,
  brokerageRate: 0,
  laborCharges: 0,
  biltyCharges: 0,
  customExpenses: []
};
