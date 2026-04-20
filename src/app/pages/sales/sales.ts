import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { Upload } from '../../core/services/upload/upload';
import { CurrencyMaskDirective } from '../../shared/directives/currency-mask.directive';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';
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
    CurrencyMaskDirective,
    BrlCurrencyPipe
  ],
  templateUrl: './sales.html',
  styleUrl: './sales.scss'
})
export class Sales implements OnInit {
  searchForm: FormGroup;
  saleForm: FormGroup;
  salesFilterForm: FormGroup;

  products: ReturnProductDto[] = [];
  paymentMethods: ReturnPaymentMethodDto[] = [];
  cartItems: CartItem[] = [];
  filteredProducts: ReturnProductDto[] = [];
  productImageUrls = new Map<string, string>();

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
    private toastService: ToastService,
    private uploadService: Upload
  ) {
    this.searchForm = this.fb.group({
      searchQuery: [''],
      barcode: ['']
    });

    this.saleForm = this.fb.group({
      payments: this.fb.array([this.createPaymentGroup()]),
      discountType: ['value'],
      discount: [0, [Validators.min(0)]],
      notes: ['']
    });

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    this.salesFilterForm = this.fb.group({
      date: [todayStr]
    });

    this.searchForm.get('searchQuery')?.valueChanges.subscribe(value => {
      this.filterProducts(value);
    });

    this.saleForm.get('discount')?.valueChanges
      .pipe(debounceTime(0))
      .subscribe(() => {
        this.calculateTotals();
        this.resetSimulation();
      });

    this.saleForm.get('discountType')?.valueChanges.subscribe(() => {
      this.saleForm.get('discount')?.setValue(0, { emitEvent: false });
      this.calculateTotals();
      this.resetSimulation();
    });
  }

  get paymentsArray(): FormArray {
    return this.saleForm.get('payments') as FormArray;
  }

  get paymentControls(): FormGroup[] {
    return this.paymentsArray.controls as FormGroup[];
  }

  createPaymentGroup(): FormGroup {
    const group = this.fb.group({
      paymentMethodId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      installments: [{ value: null, disabled: true }]
    });

    group.get('paymentMethodId')?.valueChanges.subscribe(value => {
      this.handlePaymentMethodChangeForGroup(group, value ?? '');
      this.resetSimulation();
    });

    group.get('amount')?.valueChanges.pipe(debounceTime(0)).subscribe(() => {
      this.resetSimulation();
    });

    group.get('installments')?.valueChanges.pipe(debounceTime(0)).subscribe(() => {
      this.resetSimulation();
    });

    return group;
  }

  addPayment(): void {
    this.paymentsArray.push(this.createPaymentGroup());
    this.resetSimulation();
  }

  removePayment(index: number): void {
    if (this.paymentsArray.length > 1) {
      this.paymentsArray.removeAt(index);
      this.resetSimulation();
    }
  }

  handlePaymentMethodChangeForGroup(group: FormGroup, paymentMethodId: string): void {
    const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
    const installmentsControl = group.get('installments');
    if (!installmentsControl) return;

    if (paymentMethod?.code === 'CREDIT_CARD') {
      installmentsControl.setValidators([Validators.required, Validators.min(1)]);
      installmentsControl.enable();
    } else {
      installmentsControl.clearValidators();
      installmentsControl.setValue(null);
      installmentsControl.disable();
    }
    installmentsControl.updateValueAndValidity();

    if (paymentMethod?.code === 'CASH') {
      group.get('amount')?.setValue(0, { emitEvent: false });
    } else {
      const otherTotal = this.paymentControls
        .filter(g => g !== group)
        .reduce((sum, g) => sum + (Number(g.get('amount')?.value) || 0), 0);
      const remaining = Math.max(0, Math.round((this.total - otherTotal) * 100) / 100);
      group.get('amount')?.setValue(remaining, { emitEvent: false });
    }
  }

  get totalAmountPaid(): number {
    return this.paymentControls.reduce((sum, group) => {
      return sum + (Number(group.get('amount')?.value) || 0);
    }, 0);
  }

  get change(): number {
    const paid = this.totalAmountPaid;
    return paid > this.total ? Math.round((paid - this.total) * 100) / 100 : 0;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadPaymentMethods();
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    if (index === 1 && this.sales.length === 0) {
      this.loadSales();
    }
  }

  loadSales(page: number = this.currentPage, limit: number = this.pageSize): void {
    this.isLoadingSales = true;
    const date = this.salesFilterForm.get('date')?.value;
    this.saleService.getAllSales(page, limit, date).subscribe({
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
        products.forEach(product => this.loadProductImage(product));
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

  get discountAmountInReais(): number {
    const raw = this.saleForm.value.discount ?? 0;
    const type = this.saleForm.value.discountType ?? 'value';
    if (type === 'percent') {
      return Math.round(this.subtotal * (Math.min(raw, 100) / 100) * 100) / 100;
    }
    return raw;
  }

  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.discount = this.discountAmountInReais;
    this.total = Math.max(this.subtotal - this.discount, 0);
    this.finalTotal = this.total;
  }

  updateTotals(): void {
    this.calculateTotals();
  }

  simulateSale(): void {
    if (this.cartItems.length === 0) return;

    this.isLoading = true;

    const simulateData: SimulateSaleDto = {
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      payments: this.paymentControls.map(group => ({
        paymentMethodId: group.get('paymentMethodId')?.value,
        amount: Number(group.get('amount')?.value) || 0,
        installments: group.get('installments')?.enabled ? group.get('installments')?.value || undefined : undefined
      })),
      discount: this.discountAmountInReais
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

  private executeCompleteSale(dialogRef?: any): void {
    this.isLoading = true;

    const saleData: CreateSaleDto = {
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      payments: this.paymentControls.map(group => ({
        paymentMethodId: group.get('paymentMethodId')?.value,
        amount: Number(group.get('amount')?.value) || 0,
        installments: group.get('installments')?.enabled ? group.get('installments')?.value || undefined : undefined
      })),
      discount: this.discountAmountInReais,
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
    while (this.paymentsArray.length > 1) {
      this.paymentsArray.removeAt(this.paymentsArray.length - 1);
    }
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

  getPaymentMethodNames(): string {
    return this.paymentControls
      .map(group => {
        const id = group.get('paymentMethodId')?.value;
        return id ? (this.paymentMethods.find(m => m.id === id)?.name || '') : '';
      })
      .filter(name => name)
      .join(', ');
  }

  setTodayFilter(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    this.salesFilterForm.patchValue({ date: todayStr });
  }

  getProductImageUrl(product: ReturnProductDto): string {
    return this.productImageUrls.get(product.id) || '';
  }

  private loadProductImage(product: ReturnProductDto): void {
    if (product.imageUrl && !this.productImageUrls.has(product.id)) {
      this.uploadService.getSecureImageUrl(product.imageUrl).subscribe(url => {
        this.productImageUrls.set(product.id, url);
      });
    }
  }
}