export interface ReturnProductVariationDto {
  id: string;
  productId: string;
  name: string;
  barcode: string | null;
  colorCode: string | null;
  imageUrl: string | null;
  order: number;
  createdAt: Date;
}
