import { ReturnSaleItemDto } from './return-sale-item.interface';
import { ReturnPaymentMethodDto } from '../payment-methods/return-payment-method.interface';

export interface ReturnSaleDto {
  id: string;
  total: number;
  discount: number;
  finalTotal: number;
  amountPaid: number;
  change: number;
  paymentMethod: ReturnPaymentMethodDto;
  installments: number | null;
  installmentValue: number | null;
  notes: string | null;
  createdAt: Date;
  items?: ReturnSaleItemDto[];
}
