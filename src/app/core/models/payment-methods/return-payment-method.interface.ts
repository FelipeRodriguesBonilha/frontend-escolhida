export interface ReturnPaymentMethodDto {
  id: string;
  code: string;
  name: string;
  active: boolean;
  order: number | null;
  createdAt: Date;
  updatedAt: Date;
}
