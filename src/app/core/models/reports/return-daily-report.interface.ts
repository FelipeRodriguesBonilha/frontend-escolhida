import { ReturnSaleDto } from '../sales/return-sale.interface';

export interface ReturnDailyReportDto {
  date: string;
  totalSales: number;
  totalRevenue: number;
  byPaymentMethod: Record<string, number>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  sales: ReturnSaleDto[];
}
