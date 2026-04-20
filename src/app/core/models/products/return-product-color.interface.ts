export interface ReturnProductColorDto {
  id: string;
  productId: string;
  name: string;
  colorCode: string | null;
  imageUrl: string | null;
  order: number;
  createdAt: Date;
}
