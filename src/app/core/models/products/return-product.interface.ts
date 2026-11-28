import { ReturnBrandDto } from "../brands/return-brand.interface";
import { ReturnCategoryDto } from "../categories/return-category.interface";
import { ReturnStockDto } from "../stock/return-stock.interface";
import { ReturnSupplierDto } from "../suppliers/return-supplier.interface";
import { ReturnProductVariationDto } from "./return-product-variation.interface";
import { ReturnProductImageDto } from "./return-product-image.interface";


export interface ReturnProductDto {
  id: string;
  name: string;
  barcode: string | null;
  description: string | null;
  price: number;
  costPrice: number;
  inPromotion: boolean;
  promotionPrice: number | null;
  effectivePrice: number;
  isNew: boolean;
  categoryId: string;
  brandId: string;
  supplierId?: string;
  supplierCode?: string | null;
  imageUrl: string | null;
  expirationDate: string | null;
  active: boolean;
  showInCatalog: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: ReturnCategoryDto;
  brand?: ReturnBrandDto;
  supplier?: ReturnSupplierDto;
  stock?: ReturnStockDto;
  variations: ReturnProductVariationDto[];
  images: ReturnProductImageDto[];
}