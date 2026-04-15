import { ReturnProductDto } from '../products/return-product.interface';

export interface ReturnStockDto {
  id: string;
  productId: string;
  quantity: number;
  minQuantity: number;
  updatedAt: Date;
  product?: ReturnProductDto;
}
