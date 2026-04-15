export interface CreatePaymentMethodDto {
  code: string;
  name: string;
  active?: boolean;
  order?: number;
}
