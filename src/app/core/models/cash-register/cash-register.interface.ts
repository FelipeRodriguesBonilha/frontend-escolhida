export type CashRegisterStatus = 'OPEN' | 'CLOSED';

export interface CashBleedDto {
  id: string;
  cashRegisterId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface CashEntryDto {
  id: string;
  cashRegisterId: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface SaleDto {
  id: string;
  total: number;
  discount: number;
  finalTotal: number;
  amountPaid: number;
  change: number;
  notes: string | null;
  createdAt: string;
  cashRegisterId: string | null;
}

export interface CashRegisterDto {
  id: string;
  openedAt: string;
  closedAt: string | null;
  initialAmount: number;
  finalAmount: number | null;
  status: CashRegisterStatus;
  notes: string | null;
  closingNotes: string | null;
  bleeds: CashBleedDto[];
  entries: CashEntryDto[];
  sales: SaleDto[];
  totalBleeds: number;
  totalEntries: number;
  totalCashSales: number;
}

export interface OpenCashRegisterDto {
  initialAmount: number;
  entries?: CreateCashEntryDto[];
  notes?: string;
}

export interface CloseCashRegisterDto {
  closingNotes?: string;
}

export interface CreateCashBleedDto {
  amount: number;
  reason: string;
}

export interface CreateCashEntryDto {
  amount: number;
  description: string;
}

export interface PaginatedCashRegistersResponse {
  data: CashRegisterDto[];
  total: number;
  page: number;
  lastPage: number;
}
