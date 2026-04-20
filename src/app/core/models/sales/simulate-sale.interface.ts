export interface SimulateSaleItemDto {
  productId: string;
  quantity: number;
}

export interface SimulatePaymentDto {
  paymentMethodId: string;
  amount: number;
  installments?: number;
}

export interface SimulateSaleDto {
  items: SimulateSaleItemDto[];
  payments: SimulatePaymentDto[];
  discount: number;
}
