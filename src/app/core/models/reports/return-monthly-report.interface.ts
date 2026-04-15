export interface ReturnMonthlyReportDto {
  year: number;
  month: number;
  period: string;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  byPaymentMethod: Record<string, number>;
  byDay: Record<string, {
    totalSales: number;
    totalRevenue: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
}
