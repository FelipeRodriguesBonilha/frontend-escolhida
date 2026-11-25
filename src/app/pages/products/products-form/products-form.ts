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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { ToastService } from '../../../core/services/toast/toast.service';
import { CreateProductDto, ReturnBrandDto, ReturnCategoryDto, ReturnProductVariationDto, ReturnProductDto, ReturnProductImageDto, ReturnSupplierDto, UpdateProductDto } from '../../../core/models';
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
    MatDialogModule,
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

  images: ReturnProductImageDto[] = [];
  imageSecureUrls = new Map<string, string>();
  imagesToRemove: string[] = [];
  newFiles: File[] = [];
  newFilePreviews: string[] = [];

  variations: ReturnProductVariationDto[] = [];
  variationImagePreviews = new Map<string, string>();
  variationSecureUrls = new Map<string, string>();

  newVariationName = '';
  newVariationCode = '';
  newVariationBarcode = '';
  newVariationFile: File | null = null;
  newVariationPreview: string | null = null;
  isAddingVariation = false;

  editingVariationId: string | null = null;
  editVariationImageRemoved = false;
  editVariationName = '';
  editVariationCode = '';
  editVariationBarcode = '';
  editVariationFile: File | null = null;
  editVariationPreview: string | null = null;
  isSavingVariation = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private supplierService: SupplierService,
    private uploadService: UploadService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private dialog: MatDialog
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
      active: [true],
      showInCatalog: [false],
      inPromotion: [false],
      promotionPrice: [null],
      isNew: [false]
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
            active: product.active,
            showInCatalog: product.showInCatalog,
            inPromotion: product.inPromotion ?? false,
            promotionPrice: product.promotionPrice ? Number(product.promotionPrice) : null,
            isNew: product.isNew ?? false
          });
          
          if (product.imageUrl) {
            this.uploadService.getSecureImageUrl(product.imageUrl).subscribe(url => {
              this.secureImageUrl = url;
            });
          }

          this.images = product.images ?? [];
          this.images.forEach(image => {
            this.uploadService.getSecureImageUrl(image.url).subscribe(url => {
              this.imageSecureUrls.set(image.id, url);
            });
          });

          this.variations = product.variations ?? [];
          this.variations.forEach(variation => {
            if (variation.imageUrl) {
              this.uploadService.getSecureImageUrl(variation.imageUrl).subscribe(url => {
                this.variationSecureUrls.set(variation.id, url);
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
      minQuantity: this.productForm.value.minQuantity || undefined,
      showInCatalog: this.productForm.value.showInCatalog ?? false,
      inPromotion: this.productForm.value.inPromotion ?? false,
      promotionPrice: this.productForm.value.inPromotion ? this.productForm.value.promotionPrice || undefined : undefined,
      isNew: this.productForm.value.isNew ?? false
    };

    this.productService.createProduct(productData, this.newFiles.length > 0 ? this.newFiles : undefined).subscribe({
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
      showInCatalog: this.productForm.value.showInCatalog ?? false,
      inPromotion: this.productForm.value.inPromotion ?? false,
      promotionPrice: this.productForm.value.inPromotion ? this.productForm.value.promotionPrice || undefined : undefined,
      isNew: this.productForm.value.isNew ?? false
    };

    this.productService.updateProduct(
      this.productId,
      productData,
      this.newFiles.length > 0 ? this.newFiles : undefined,
      this.imagesToRemove.length > 0 ? this.imagesToRemove : undefined
    ).subscribe({
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

  onNewVariationImageSelected(event: Event): void {
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
      this.newVariationFile = file;
      const reader = new FileReader();
      reader.onload = (e) => { this.newVariationPreview = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  addVariation(): void {
    if (!this.productId) return;
    const barcode = this.newVariationBarcode.trim();
    if (barcode) {
      this.checkNewVariationBarcodeConflict(barcode);
      return;
    }
    if (!this.newVariationName.trim()) {
      this.toastService.error('Informe o nome da variação');
      return;
    }
    this.submitAddVariation();
  }

  private submitAddVariation(): void {
    if (!this.productId) return;
    this.isAddingVariation = true;
    this.productService.addVariation(
      this.productId,
      this.newVariationName.trim(),
      this.newVariationCode.trim() || undefined,
      this.newVariationBarcode.trim() || undefined,
      this.newVariationFile || undefined
    ).subscribe({
      next: (variation) => this.onVariationAdded(variation, 'Variação adicionada!'),
      error: (error) => {
        const msg = error?.error?.message || 'Erro ao adicionar variação';
        this.toastService.error(msg);
        this.isAddingVariation = false;
      }
    });
  }

  private onVariationAdded(variation: ReturnProductVariationDto, message: string): void {
    this.variations = [...this.variations, variation];
    if (variation.imageUrl) {
      this.uploadService.getSecureImageUrl(variation.imageUrl).subscribe(url => {
        this.variationSecureUrls.set(variation.id, url);
      });
    }
    this.newVariationName = '';
    this.newVariationCode = '';
    this.newVariationBarcode = '';
    this.newVariationFile = null;
    this.newVariationPreview = null;
    this.isAddingVariation = false;
    this.toastService.success(message);
  }

  private checkNewVariationBarcodeConflict(barcode: string): void {
    this.isAddingVariation = true;
    this.productService.getProductByBarcode(barcode).subscribe({
      next: (product) => {
        if (product.barcode === barcode) {
          if (product.id === this.productId) {
            this.toastService.error('Este código de barras já pertence a este produto');
            this.isAddingVariation = false;
            return;
          }
          this.confirmConvertProduct(product, barcode);
          return;
        }
        this.toastService.error('Este código já é uma variação de outro produto');
        this.isAddingVariation = false;
      },
      error: () => {
        if (!this.newVariationName.trim()) {
          this.toastService.error('Código de barras não encontrado — informe o nome da variação');
          this.isAddingVariation = false;
          return;
        }
        this.submitAddVariation();
      }
    });
  }

  private confirmConvertProduct(product: ReturnProductDto, barcode: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '480px',
      data: {
        title: 'Código já cadastrado',
        message: `O código ${barcode} pertence ao produto "${product.name}". Transformar esse produto em variação deste produto? O produto "${product.name}" será desativado.`,
        confirmText: 'Transformar em variação',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        this.isAddingVariation = false;
        return;
      }
      if (!this.productId) return;
      this.productService.convertVariationFromProduct(this.productId, {
        barcode,
        name: this.newVariationName.trim() || product.name,
        colorCode: this.newVariationCode.trim() || undefined,
        image: this.newVariationFile || undefined
      }).subscribe({
        next: (variation) => this.onVariationAdded(variation, 'Produto convertido em variação!'),
        error: (error) => {
          const msg = error?.error?.message || 'Erro ao converter produto em variação';
          this.toastService.error(msg);
          this.isAddingVariation = false;
        }
      });
    });
  }

  startEditVariation(variation: ReturnProductVariationDto): void {
    this.editingVariationId = variation.id;
    this.editVariationName = variation.name;
    this.editVariationCode = variation.colorCode ?? '';
    this.editVariationBarcode = variation.barcode ?? '';
    this.editVariationFile = null;
    this.editVariationPreview = this.variationSecureUrls.get(variation.id) || null;
    this.editVariationImageRemoved = false;
  }

  cancelEditVariation(): void {
    this.editingVariationId = null;
    this.editVariationFile = null;
    this.editVariationPreview = null;
    this.editVariationImageRemoved = false;
  }

  onEditVariationImageSelected(event: Event): void {
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
      this.editVariationFile = file;
      const reader = new FileReader();
      reader.onload = (e) => { this.editVariationPreview = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  saveVariationEdit(): void {
    if (!this.productId || !this.editingVariationId || !this.editVariationName.trim()) return;
    const variation = this.variations.find(c => c.id === this.editingVariationId);
    const barcode = this.editVariationBarcode.trim();
    if (barcode && barcode !== variation?.barcode) {
      this.checkEditVariationBarcodeConflict(barcode);
      return;
    }
    this.submitUpdateVariation();
  }

  private submitUpdateVariation(): void {
    if (!this.productId || !this.editingVariationId) return;
    this.isSavingVariation = true;
    const variationId = this.editingVariationId;
    this.productService.updateVariation(
      this.productId,
      variationId,
      this.editVariationName.trim(),
      this.editVariationCode.trim() || undefined,
      this.editVariationBarcode.trim() || undefined,
      this.editVariationFile || undefined,
      this.editVariationImageRemoved && !this.editVariationFile ? true : undefined
    ).subscribe({
      next: (updated) => {
        this.variations = this.variations.map(c => c.id === variationId ? updated : c);
        if (updated.imageUrl) {
          this.uploadService.getSecureImageUrl(updated.imageUrl).subscribe(url => {
            this.variationSecureUrls.set(updated.id, url);
          });
        } else {
          this.variationSecureUrls.delete(updated.id);
        }
        this.cancelEditVariation();
        this.isSavingVariation = false;
        this.toastService.success('Variação atualizada!');
      },
      error: (error) => {
        const msg = error?.error?.message || 'Erro ao atualizar variação';
        this.toastService.error(msg);
        this.isSavingVariation = false;
      }
    });
  }

  private checkEditVariationBarcodeConflict(barcode: string): void {
    this.isSavingVariation = true;
    this.productService.getProductByBarcode(barcode).subscribe({
      next: (product) => {
        if (product.barcode === barcode) {
          if (product.id === this.productId) {
            this.toastService.error('Este código de barras já pertence a este produto');
            this.isSavingVariation = false;
            return;
          }
          this.confirmConvertProductForEdit(product, barcode);
          return;
        }
        this.toastService.error('Este código já é uma variação de outro produto');
        this.isSavingVariation = false;
      },
      error: () => this.submitUpdateVariation()
    });
  }

  private confirmConvertProductForEdit(product: ReturnProductDto, barcode: string): void {
    const variationId = this.editingVariationId;
    if (!variationId || !this.productId) {
      this.isSavingVariation = false;
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '480px',
      data: {
        title: 'Código já cadastrado',
        message: `O código ${barcode} pertence ao produto "${product.name}". Transformar esse produto em variação deste produto? O produto "${product.name}" será desativado.`,
        confirmText: 'Transformar em variação',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed || !this.productId) {
        this.isSavingVariation = false;
        return;
      }
      this.productService.convertVariationFromProduct(this.productId, {
        barcode,
        variationId,
        name: this.editVariationName.trim() || undefined,
        colorCode: this.editVariationCode.trim() || undefined,
        image: this.editVariationFile || undefined
      }).subscribe({
        next: (updated) => {
          this.variations = this.variations.map(c => c.id === variationId ? updated : c);
          if (updated.imageUrl) {
            this.uploadService.getSecureImageUrl(updated.imageUrl).subscribe(url => {
              this.variationSecureUrls.set(updated.id, url);
            });
          }
          this.cancelEditVariation();
          this.isSavingVariation = false;
          this.toastService.success('Produto convertido em variação!');
        },
        error: (error) => {
          const msg = error?.error?.message || 'Erro ao converter produto em variação';
          this.toastService.error(msg);
          this.isSavingVariation = false;
        }
      });
    });
  }

  removeVariation(variationId: string): void {
    if (!this.productId) return;
    this.productService.removeVariation(this.productId, variationId).subscribe({
      next: () => {
        this.variations = this.variations.filter(c => c.id !== variationId);
        this.variationSecureUrls.delete(variationId);
        this.toastService.success('Variação removida!');
      },
      error: (error) => {
        const msg = error?.error?.message || 'Erro ao remover variação';
        this.toastService.error(msg);
      }
    });
  }

  getVariationImageUrl(variation: ReturnProductVariationDto): string {
    return this.variationSecureUrls.get(variation.id) || '';
  }

  getGalleryImageUrl(image: ReturnProductImageDto): string {
    return this.imageSecureUrls.get(image.id) || '';
  }

  isMarkedForRemoval(imageId: string): boolean {
    return this.imagesToRemove.includes(imageId);
  }

  toggleRemoveExistingImage(imageId: string): void {
    if (this.imagesToRemove.includes(imageId)) {
      this.imagesToRemove = this.imagesToRemove.filter(id => id !== imageId);
    } else {
      this.imagesToRemove = [...this.imagesToRemove, imageId];
    }
  }

  onGalleryImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    input.value = '';

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.toastService.warning(`${file.name}: apenas arquivos de imagem`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.warning(`${file.name}: máximo 5MB`);
        continue;
      }
      this.newFiles = [...this.newFiles, file];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newFilePreviews = [...this.newFilePreviews, e.target?.result as string];
      };
      reader.readAsDataURL(file);
    }
  }

  removeNewImage(index: number): void {
    this.newFiles = this.newFiles.filter((_, i) => i !== index);
    this.newFilePreviews = this.newFilePreviews.filter((_, i) => i !== index);
  }

  setMainImage(imageId: string): void {
    if (!this.productId) return;
    this.productService.setMainImage(this.productId, imageId).subscribe({
      next: (updatedImages) => {
        this.images = updatedImages;
        this.imageSecureUrls.clear();
        this.images.forEach(image => {
          this.uploadService.getSecureImageUrl(image.url).subscribe(url => {
            this.imageSecureUrls.set(image.id, url);
          });
        });
        this.toastService.success('Imagem principal definida!');
      },
      error: (error) => {
        this.toastService.error(error?.error?.message || 'Erro ao definir imagem principal');
      }
    });
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

  getProfitMarginVariation(): string {
    const margin = this.getProfitMargin();

    if (margin < 10) return 'text-red-600';
    if (margin < 30) return 'text-yellow-600';
    return 'text-green-600';
  }
}
