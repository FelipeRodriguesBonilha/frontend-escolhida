import { CreateCategoryDto } from './create-category.interface';

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  active?: boolean;
}
