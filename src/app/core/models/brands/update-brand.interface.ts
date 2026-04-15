import { CreateBrandDto } from './create-brand.interface';

export interface UpdateBrandDto extends Partial<CreateBrandDto> {
  active?: boolean;
}
