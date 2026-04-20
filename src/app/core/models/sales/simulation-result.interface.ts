export interface SimulationItemResult {
  productId: string;
  productName: string;
  category: string;
  brand: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  stockAvailable: number;
  hasStock: boolean;
  willBelowMinStock: boolean;
}

export interface SimulationPaymentSummary {
  paymentMethodId: string;
  paymentMethodName: string;
  amount: number;
  installments: number | null;
  installmentValue: number | null;
}

export interface SimulationSummary {
  totalItems: number;
  totalProducts: number;
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  change: number | null;
  payments: SimulationPaymentSummary[];
}

export interface SimulationError {
  type: string;
  productId?: string;
  productName?: string;
  message: string;
}

export interface SimulationWarning {
  type: string;
  productId: string;
  productName: string;
  message: string;
}

export interface SimulationResult {
  canFinalize: boolean;
  items: SimulationItemResult[];
  summary: SimulationSummary;
  errors: SimulationError[];
  warnings: SimulationWarning[];
}
