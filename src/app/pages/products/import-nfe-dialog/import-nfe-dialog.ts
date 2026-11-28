import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NfeImportResult } from '../../../core/models';
import { Products as ProductService } from '../../../core/services/products/products';

@Component({
  selector: 'app-import-nfe-dialog',
  imports: [CommonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './import-nfe-dialog.html',
  styleUrl: './import-nfe-dialog.scss',
})
export class ImportNfeDialog {
  selectedFile: File | null = null;
  isImporting = false;
  result: NfeImportResult | null = null;
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<ImportNfeDialog>,
    private productService: ProductService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.result = null;
    this.errorMessage = '';
  }

  import(): void {
    if (!this.selectedFile) return;
    this.isImporting = true;
    this.errorMessage = '';
    this.productService.importNfe(this.selectedFile).subscribe({
      next: (result) => {
        this.result = result;
        this.isImporting = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Erro ao importar a nota. Tente novamente.';
        this.isImporting = false;
      }
    });
  }

  close(): void {
    const changed = !!this.result && (this.result.created > 0 || this.result.restocked > 0);
    this.dialogRef.close(changed);
  }
}
