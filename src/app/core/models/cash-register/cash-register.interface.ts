export type CashRegisterStatus = 'OPEN' | 'CLOSED';

export interface CashBleedDto {
  id: string;
  cashRegisterId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface CashRegisterDto {
  id: string;
  openedAt: string;
  closedAt: string | null;
  initialAmount: number;
  finalAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  status: CashRegisterStatus;
  notes: string | null;
  closingNotes: string | null;
  bleeds: CashBleedDto[];
  totalBleeds: number;
}

export interface OpenCashRegisterDto {
  initialAmount: number;
  notes?: string;
}

export interface CloseCashRegisterDto {
  finalAmount: number;
  closingNotes?: string;
}

export interface CreateCashBleedDto {
  amount: number;
  reason: string;
}

export interface PaginatedCashRegistersResponse {
  data: CashRegisterDto[];
  total: number;
  page: number;
  lastPage: number;
}
