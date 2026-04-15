import { ReturnBrandDto } from "../brands/return-brand.interface";
import { ReturnCategoryDto } from "../categories/return-category.interface";
import { ReturnStockDto } from "../stock/return-stock.interface";
import { ReturnSupplierDto } from "../suppliers/return-supplier.interface";


export interface ReturnProductDto {
  id: string;
  name: string;
  barcode: string | null;
  description: string | null;
  price: number;
  costPrice: number;
  categoryId: string;
  brandId: string;
  supplierId?: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: ReturnCategoryDto;
  brand?: ReturnBrandDto;
  supplier?: ReturnSupplierDto;
  stock?: ReturnStockDto;
}
