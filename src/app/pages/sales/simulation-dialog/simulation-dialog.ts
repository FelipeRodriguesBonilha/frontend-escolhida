import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SimulationResult } from '../../../core/models';

@Component({
  selector: 'app-simulation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './simulation-dialog.html',
  styleUrl: './simulation-dialog.scss'
})
export class SimulationDialog {
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<SimulationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      simulationResult: SimulationResult,
      onConfirm: () => void
    }
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.isLoading = true;
    this.data.onConfirm();
  }
}
