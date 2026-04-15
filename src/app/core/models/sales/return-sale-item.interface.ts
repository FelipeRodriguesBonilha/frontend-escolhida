import { ReturnProductDto } from '../products/return-product.interface';

export interface ReturnSaleItemDto {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: ReturnProductDto;
}
