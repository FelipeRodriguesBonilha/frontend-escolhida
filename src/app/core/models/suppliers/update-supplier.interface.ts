import { CreateSupplierDto } from './create-supplier.interface';

export interface UpdateSupplierDto extends CreateSupplierDto {
  active?: boolean;
}
