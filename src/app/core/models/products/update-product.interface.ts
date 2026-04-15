import { CreateProductDto } from './create-product.interface';

export interface UpdateProductDto extends CreateProductDto {
  active?: boolean;
}
