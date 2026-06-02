export interface CreateProductDto {
  name: string;
  barcode?: string;
  description?: string;
  price: number;
  costPrice: number;
  categoryId: string;
  brandId: string;
  supplierId?: string;
  initialStock?: number;
  minQuantity?: number;
  showInCatalog?: boolean;
  inPromotion?: boolean;
  promotionPrice?: number;
}
