export interface ReturnSupplierDto {
  id: string;
  name: string;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
