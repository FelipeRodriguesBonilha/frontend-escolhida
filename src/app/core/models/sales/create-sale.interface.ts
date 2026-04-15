export interface SaleItemDto {
  productId: string;
  quantity: number;
}

export interface CreateSaleDto {
  items: SaleItemDto[];
  paymentMethodId: string;
  discount: number;
  amountPaid: number;
  installments?: number;
  notes?: string;
}
