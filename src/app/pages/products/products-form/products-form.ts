import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast/toast.service';
import { CreateProductDto, ReturnBrandDto, ReturnCategoryDto, ReturnProductColorDto, ReturnProductDto, ReturnSupplierDto, UpdateProductDto } from '../../../core/models';
import { Brands as BrandService } from '../../../core/services/brands/brands';
import { Categories as CategoryService } from '../../../core/services/categories/categories';
import { Products as ProductService } from '../../../core/services/products/products';
import { Suppliers as SupplierService } from '../../../core/services/suppliers/suppliers';
import { Upload as UploadService } from '../../../core/services/upload/upload';
import { NgxCurrencyDirective } from 'ngx-currency';

@Component({
  selector: 'app-products-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    NgxCurrencyDirective
  ],
  templateUrl: './products-form.html',
  styleUrl: './products-form.scss',
})
export class ProductsForm implements OnInit {
  productForm: FormGroup;
  isEditing = false;
  isLoading = false;
  productId: string | null = null;
  product: ReturnProductDto | null = null;

  selectedImage: File | null = null;
  imagePreview: string | null = null;
  secureImageUrl: string | null = null;
  imageRemoved = false;

  categories: ReturnCategoryDto[] = [];
  brands: ReturnBrandDto[] = [];
  suppliers: ReturnSupplierDto[] = [];

  colors: ReturnProductColorDto[] = [];
  colorImagePreviews = new Map<string, string>();
  colorSecureUrls = new Map<string, string>();

  newColorName = '';
  newColorCode = '';
  newColorFile: File | null = null;
  newColorPreview: string | null = null;
  isAddingColor = false;

  editingColorId: string | null = null;
  editColorImageRemoved = false;
  editColorName = '';
  editColorCode = '';
  editColorFile: File | null = null;
  editColorPreview: string | null = null;
  isSavingColor = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private supplierService: SupplierService,
    private uploadService: UploadService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      barcode: ['', [Validators.maxLength(20)]],
      description: ['', [Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      costPrice: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      brandId: ['', Validators.required],
      supplierId: [''],
      initialStock: [0, [Validators.min(0)]],
      minQuantity: [0, [Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadSuppliers();

    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.productId = id;
        this.loadProduct(id);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategoriesDropdown().subscribe({
      next: (categories) => { this.categories = categories; },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadBrands(): void {
    this.brandService.getAllBrandsDropdown().subscribe({
      next: (brands) => { this.brands = brands; },
      error: (error) => console.error('Error loading brands:', error)
    });
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliersDropdown().subscribe({
      next: (suppliers) => { this.suppliers = suppliers; },
      error: (error) => console.error('Error loading suppliers:', error)
    });
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.productForm.patchValue({
            name: product.name,
            barcode: product.barcode || '',
            description: product.description || '',
            price: Number(product.price),
            costPrice: Number(product.costPrice),
            categoryId: product.categoryId,
            brandId: product.brandId,
            supplierId: product.supplierId,
            active: product.active
          });
          
          if (product.imageUrl) {
            this.uploadService.getSecureImageUrl(product.imageUrl).subscribe(url => {
              this.secureImageUrl = url;
            });
          }

          this.colors = product.colors ?? [];
          this.colors.forEach(color => {
            if (color.imageUrl) {
              this.uploadService.getSecureImageUrl(color.imageUrl).subscribe(url => {
                this.colorSecureUrls.set(color.id, url);
              });
            }
          });
        } else {
          console.error('Product not found');
          this.router.navigate(['/produtos']);
        }
        this.isLoading = false;

      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const price = this.productForm.value.price;
    const costPrice = this.productForm.value.costPrice;
    if (costPrice >= price) {
      this.toastService.warning('Preço de custo deve ser menor que preço de venda');
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.productId) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  private createProduct(): void {
    const productData: CreateProductDto = {
      name: this.productForm.value.name!,
      barcode: this.productForm.value.barcode || undefined,
      description: this.productForm.value.description || undefined,
      price: this.productForm.value.price,
      costPrice: this.productForm.value.costPrice,
      categoryId: this.productForm.value.categoryId!,
      brandId: this.productForm.value.brandId!,
      supplierId: this.productForm.value.supplierId || undefined,
      initialStock: this.productForm.value.initialStock || undefined,
      minQuantity: this.productForm.value.minQuantity || undefined
    };

    this.productService.createProduct(productData, this.selectedImage || undefined).subscribe({
      next: () => {
        this.toastService.success('Produto cadastrado com sucesso!');
        this.router.navigate(['/produtos']);
      },
      error: (error) => {
        console.error('Error creating product:', error);
        const errorMessage = error?.error?.message || 'Erro ao cadastrar produto. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private updateProduct(): void {
    if (!this.productId) return;

    const productData: UpdateProductDto = {
      name: this.productForm.value.name!,
      barcode: this.productForm.value.barcode || undefined,
      description: this.productForm.value.description || undefined,
      price: this.productForm.value.price,
      costPrice: this.productForm.value.costPrice,
      categoryId: this.productForm.value.categoryId!,
      brandId: this.productForm.value.brandId!,
      supplierId: this.productForm.value.supplierId || undefined,
      initialStock: this.productForm.value.initialStock || undefined,
      minQuantity: this.productForm.value.minQuantity || undefined,
      active: this.productForm.value.active,
      removeImage: this.imageRemoved && !this.selectedImage ? true : undefined
    };

    this.productService.updateProduct(this.productId, productData, this.selectedImage || undefined).subscribe({
      next: () => {
        this.toastService.success('Produto atualizado com sucesso!');
        this.router.navigate(['/produtos']);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        const errorMessage = error?.error?.message || 'Erro ao atualizar produto. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/produtos']);
  }

  getErrorMessage(field: string): string {
    const control = this.productForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Campo obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) {
      if (field === 'price' || field === 'costPrice') return 'Valor deve ser maior que 0';
      return 'Valor deve ser maior ou igual a 0';
    }

    return 'Campo inválido';
  }

  get title(): string {
    return this.isEditing ? 'Editar Produto' : 'Novo Produto';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Salvar Alterações' : 'Cadastrar Produto';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getProfitMargin(): number {
    const price = this.productForm.value.price || 0;
    const costPrice = this.productForm.value.costPrice || 0;

    if (price <= 0 || costPrice <= 0) return 0;

    return ((price - costPrice) / price) * 100;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.toastService.warning('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.toastService.warning('A imagem deve ter no máximo 5MB');
        return;
      }

      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;

      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.secureImageUrl = null;
    this.imageRemoved = true;
  }

  onNewColorImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.toastService.warning('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.warning('A imagem deve ter no máximo 5MB');
        return;
      }
      this.newColorFile = file;
      const reader = new FileReader();
      reader.onload = (e) => { this.newColorPreview = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  addColor(): void {
    if (!this.productId || !this.newColorName.trim()) return;
    this.isAddingColor = true;
    this.productService.addColor(
      this.productId,
      this.newColorName.trim(),
      this.newColorCode.trim() || undefined,
      this.newColorFile || undefined
    ).subscribe({
      next: (color) => {
        this.colors = [...this.colors, color];
        if (color.imageUrl) {
          this.uploadService.getSecureImageUrl(color.imageUrl).subscribe(url => {
            this.colorSecureUrls.set(color.id, url);
          });
        }
        this.newColorName = '';
        this.newColorCode = '';
        this.newColorFile = null;
        this.newColorPreview = null;
        this.isAddingColor = false;
        this.toastService.success('Cor adicionada!');
      },
      error: (error) => {
        const msg = error?.error?.message || 'Erro ao adicionar cor';
        this.toastService.error(msg);
        this.isAddingColor = false;
      }
    });
  }

  startEditColor(color: ReturnProductColorDto): void {
    this.editingColorId = color.id;
    this.editColorName = color.name;
    this.editColorCode = color.colorCode ?? '';
    this.editColorFile = null;
    this.editColorPreview = this.colorSecureUrls.get(color.id) || null;
    this.editColorImageRemoved = false;
  }

  cancelEditColor(): void {
    this.editingColorId = null;
    this.editColorFile = null;
    this.editColorPreview = null;
    this.editColorImageRemoved = false;
  }

  onEditColorImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.toastService.warning('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.warning('A imagem deve ter no máximo 5MB');
        return;
      }
      this.editColorFile = file;
      const reader = new FileReader();
      reader.onload = (e) => { this.editColorPreview = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  saveColorEdit(): void {
    if (!this.productId || !this.editingColorId || !this.editColorName.trim()) return;
    this.isSavingColor = true;
    const colorId = this.editingColorId;
    this.productService.updateColor(
      this.productId,
      colorId,
      this.editColorName.trim(),
      this.editColorCode.trim() || undefined,
      this.editColorFile || undefined,
      this.editColorImageRemoved && !this.editColorFile ? true : undefined
    ).subscribe({
      next: (updated) => {
        this.colors = this.colors.map(c => c.id === colorId ? updated : c);
        if (updated.imageUrl) {
          this.uploadService.getSecureImageUrl(updated.imageUrl).subscribe(url => {
            this.colorSecureUrls.set(updated.id, url);
          });
        } else {
          this.colorSecureUrls.delete(updated.id);
        }
        this.cancelEditColor();
        this.isSavingColor = false;
        this.toastService.success('Cor atualizada!');
      },
      error: (error) => {
        const msg = error?.error?.message || 'Erro ao atualizar cor';
        this.toastService.error(msg);
        this.isSavingColor = false;
      }
    });
  }

  removeColor(colorId: string): void {
    if (!this.productId) return;
    this.productService.removeColor(this.productId, colorId).subscribe({
      next: () => {
        this.colors = this.colors.filter(c => c.id !== colorId);
        this.colorSecureUrls.delete(colorId);
        this.toastService.success('Cor removida!');
      },
      error: (error) => {
        const msg = error?.error?.message || 'Erro ao remover cor';
        this.toastService.error(msg);
      }
    });
  }

  getColorImageUrl(color: ReturnProductColorDto): string {
    return this.colorSecureUrls.get(color.id) || '';
  }

  getProductImageUrl(): string {
    if (this.imagePreview) {
      return this.imagePreview;
    }
    if (this.secureImageUrl) {
      return this.secureImageUrl;
    }
    return '';
  }

  getProfitMarginColor(): string {
    const margin = this.getProfitMargin();

    if (margin < 10) return 'text-red-600';
    if (margin < 30) return 'text-yellow-600';
    return 'text-green-600';
  }
}
