import { ReturnSaleItemDto } from './return-sale-item.interface';
import { ReturnPaymentMethodDto } from '../payment-methods/return-payment-method.interface';

export interface SalePaymentReturnDto {
  id: string;
  paymentMethodId: string;
  paymentMethod: ReturnPaymentMethodDto;
  amount: number;
  installments: number | null;
  installmentValue: number | null;
}

export interface ReturnSaleDto {
  id: string;
  total: number;
  discount: number;
  finalTotal: number;
  amountPaid: number;
  change: number;
  payments: SalePaymentReturnDto[];
  notes: string | null;
  createdAt: Date;
  items?: ReturnSaleItemDto[];
}
