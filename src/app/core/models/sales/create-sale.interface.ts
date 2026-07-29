export interface SaleItemDto {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface SalePaymentDto {
  paymentMethodId: string;
  amount: number;
  installments?: number;
}

export interface CreateSaleDto {
  items: SaleItemDto[];
  payments: SalePaymentDto[];
  discount: number;
  notes?: string;
}
