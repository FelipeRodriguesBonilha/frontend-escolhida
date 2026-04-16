import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { debounceTime } from 'rxjs/operators';
import { CreateSaleDto, ReturnSaleDto, SimulateSaleDto, SimulationResult } from '../../core/models';
import { ReturnPaymentMethodDto } from '../../core/models/payment-methods/return-payment-method.interface';
import { ReturnProductDto } from '../../core/models/products/return-product.interface';
import { PaymentMethods as PaymentMethodService } from '../../core/services/payment-methods/payment-methods';
import { Products as ProductService } from '../../core/services/products/products';
import { PaginatedSalesResponse, Sales as SaleService } from '../../core/services/sales/sales';
import { ToastService } from '../../core/services/toast/toast.service';
import { CurrencyMaskDirective } from '../../shared/directives/currency-mask.directive';
import { SaleDetailsDialog } from './sale-details-dialog/sale-details-dialog';
import { SimulationDialog } from './simulation-dialog/simulation-dialog';

interface CartItem {
  product: ReturnProductDto;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatTabsModule,
    CurrencyMaskDirective
  ],
  templateUrl: './sales.html',
  styleUrl: './sales.scss'
})
export class Sales implements OnInit {
  searchForm: FormGroup;
  saleForm: FormGroup;

  products: ReturnProductDto[] = [];
  paymentMethods: ReturnPaymentMethodDto[] = [];
  cartItems: CartItem[] = [];
  filteredProducts: ReturnProductDto[] = [];

  selectedProduct: ReturnProductDto | null = null;
  isLoading = false;
  simulationResult: SimulationResult | null = null;

  activeTab = 0;
  sales: ReturnSaleDto[] = [];
  isLoadingSales = false;

  totalSales = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  displayedColumns: string[] = ['product', 'price', 'quantity', 'subtotal', 'actions'];
  salesColumns: string[] = ['date', 'items', 'total', 'payment', 'actions'];

  subtotal = 0;
  total = 0;
  discount = 0;
  finalTotal = 0;

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private productService: ProductService,
    private paymentMethodService: PaymentMethodService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {
    this.searchForm = this.fb.group({
      searchQuery: [''],
      barcode: ['']
    });

    this.saleForm = this.fb.group({
      paymentMethodId: ['', Validators.required],
      discount: [0, [Validators.min(0)]],
      amountPaid: [0, [Validators.required, Validators.min(0.01)]],
      installments: [{ value: null, disabled: true }],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadPaymentMethods();

    this.searchForm.get('searchQuery')?.valueChanges.subscribe(value => {
      this.filterProducts(value);
    });

    this.saleForm.get('discount')?.valueChanges
      .pipe(debounceTime(0))
      .subscribe(() => {
        this.calculateTotals();
        this.resetSimulation();
      });

    this.saleForm.get('amountPaid')?.valueChanges
      .pipe(debounceTime(0))
      .subscribe(() => {
        this.resetSimulation();
      });

    this.saleForm.get('installments')?.valueChanges
      .pipe(debounceTime(0))
      .subscribe(() => {
        this.resetSimulation();
      });

    this.saleForm.get('paymentMethodId')?.valueChanges.subscribe(value => {
      this.handlePaymentMethodChange(value);
      this.resetSimulation();
    });
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    if (index === 1 && this.sales.length === 0) {
      this.loadSales();
    }
  }

  loadSales(page: number = this.currentPage, limit: number = this.pageSize): void {
    this.isLoadingSales = true;
    this.saleService.getAllSales(page, limit).subscribe({
      next: (response: PaginatedSalesResponse) => {
        this.sales = response.data;
        this.totalSales = response.total;
        this.currentPage = response.page;
        this.isLoadingSales = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.isLoadingSales = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadSales(this.currentPage, this.pageSize);
  }

  viewSaleDetails(saleId: string): void {
    this.saleService.getSaleById(saleId).subscribe({
      next: (sale) => {
        this.dialog.open(SaleDetailsDialog, {
          width: '800px',
          maxHeight: '90vh',
          data: { sale }
        });
      },
      error: (error) => {
        console.error('Error loading sale details:', error);
      }
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  loadPaymentMethods(): void {
    this.paymentMethodService.getAllPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
      },
      error: (error) => console.error('Error loading payment methods:', error)
    });
  }

  filterProducts(query: string): void {
    if (!query) {
      this.filteredProducts = this.products;
      return;
    }

    const lowerQuery = query.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.barcode?.includes(lowerQuery)
    );
  }

  searchByBarcode(): void {
    const barcode = this.searchForm.get('barcode')?.value;
    if (!barcode) return;

    const product = this.products.find(p => p.barcode === barcode);
    if (product) {
      this.addToCart(product);
      this.searchForm.get('barcode')?.setValue('');
    }
  }

  addToCart(product: ReturnProductDto): void {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.subtotal = existingItem.quantity * existingItem.product.price;
    } else {
      this.cartItems.push({
        product,
        quantity: 1,
        subtotal: product.price
      });
    }

    this.cartItems = [...this.cartItems];
    this.calculateTotals();
    this.resetSimulation();
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
    this.cartItems = [...this.cartItems];
    this.calculateTotals();
    this.resetSimulation();
  }

  updateQuantity(index: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(index);
      return;
    }

    const item = this.cartItems[index];
    item.quantity = quantity;
    item.subtotal = item.quantity * item.product.price;
    this.cartItems = [...this.cartItems];
    this.calculateTotals();
    this.resetSimulation();
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.discount = this.saleForm.value.discount ?? 0;
    this.total = this.subtotal - this.discount;
    this.finalTotal = this.total;
  }

  updateTotals(): void {
    this.calculateTotals();
  }

  handlePaymentMethodChange(paymentMethodId?: string): void {
    const id = paymentMethodId ?? this.saleForm.value.paymentMethodId;
    const paymentMethod = this.paymentMethods.find(pm => pm.id === id);
    const installmentsControl = this.saleForm.get('installments');

    if (!installmentsControl) return;

    if (paymentMethod?.code === 'CREDIT_CARD') {
      installmentsControl.setValidators([Validators.min(1)]);
      installmentsControl.enable();
    } else {
      installmentsControl.clearValidators();
      installmentsControl.setValue(null);
      installmentsControl.disable();
    }

    installmentsControl.updateValueAndValidity();
  }

  simulateSale(): void {
    if (this.cartItems.length === 0) return;

    this.isLoading = true;

    const simulateData: SimulateSaleDto = {
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      paymentMethodId: this.saleForm.value.paymentMethodId,
      discount: this.saleForm.value.discount || 0,
      installments: this.saleForm.value.installments || undefined,
      amountPaid: this.saleForm.value.amountPaid || undefined
    };

    this.saleService.simulateSale(simulateData).subscribe({
      next: (simulation) => {
        this.isLoading = false;
        this.simulationResult = simulation;
        this.finalTotal = simulation.summary.total;

        const dialogRef = this.dialog.open(SimulationDialog, {
          width: '900px',
          maxHeight: '90vh',
          disableClose: true,
          data: {
            simulationResult: simulation,
            onConfirm: () => this.executeCompleteSale(dialogRef)
          }
        });
      },
      error: (error) => {
        console.error('Error simulating sale:', error);
        const errorMessage = error?.error?.message || 'Erro ao validar venda. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  completeSale(): void {
    if (this.cartItems.length === 0 || this.saleForm.invalid) return;

    if (!this.simulationResult || !this.simulationResult.canFinalize) {
      this.simulateSale();
      return;
    }

    this.executeCompleteSale();
  }

  private executeCompleteSale(dialogRef?: any): void {
    this.isLoading = true;

    const saleData: CreateSaleDto = {
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      paymentMethodId: this.saleForm.value.paymentMethodId!,
      discount: this.saleForm.value.discount || 0,
      amountPaid: this.saleForm.value.amountPaid!,
      installments: this.saleForm.value.installments || undefined,
      notes: this.saleForm.value.notes || undefined
    };

    this.saleService.createSale(saleData).subscribe({
      next: (sale) => {
        if (dialogRef) {
          dialogRef.close();
        }
        this.toastService.success('Venda realizada com sucesso!');
        this.clearCart();
        this.loadSales();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error completing sale:', error);
        const errorMessage = error?.error?.message || 'Erro ao finalizar venda. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  clearCart(): void {
    this.cartItems = [];
    this.calculateTotals();
    this.saleForm.reset();
    this.searchForm.reset();
    this.simulationResult = null;
  }

  resetSimulation(): void {
    this.simulationResult = null;
  }

  selectProduct(product: ReturnProductDto): void {
    this.selectedProduct = product;
    this.searchForm.get('searchQuery')?.setValue(product.name);
  }

  onProductSelected(): void {
    if (this.selectedProduct) {
      this.addToCart(this.selectedProduct);
      this.selectedProduct = null;
      this.searchForm.get('searchQuery')?.setValue('');
    }
  }

  getPaymentMethodName(): string {
    const paymentMethodId = this.saleForm.value.paymentMethodId;
    if (!paymentMethodId) return '';

    const method = this.paymentMethods.find(m => m.id === paymentMethodId);
    return method?.name || '';
  }
}