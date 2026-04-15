export interface SimulateSaleItemDto {
  productId: string;
  quantity: number;
}

export interface SimulateSaleDto {
  items: SimulateSaleItemDto[];
  paymentMethodId: string;
  discount: number;
  installments?: number;
  amountPaid?: number;
}
