import { Directive, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appCurrencyMask]',
  standalone: true
})
export class CurrencyMaskDirective implements OnInit, OnDestroy {
  private el: HTMLInputElement;
  private subscription?: Subscription;

  constructor(
    private elementRef: ElementRef,
    private control: NgControl
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    const initialValue = this.control.control?.value ?? 0;
    this.el.value = this.formatCurrency(initialValue);

    this.subscription = this.control.control?.valueChanges.subscribe(value => {
      if (document.activeElement !== this.el) {
        this.el.value = this.formatCurrency(value ?? 0);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  @HostListener('focus')
  onFocus() {
    setTimeout(() => this.el.select(), 0);
  }

  @HostListener('blur')
  onBlur() {
    const value = this.control.control?.value;
    if (value !== null && value !== undefined) {
      this.el.value = this.formatCurrency(value);
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    let value = this.el.value;

    let numbers = value.replace(/\D/g, '');

    if (numbers === '') {
      this.el.value = 'R$ 0,00';
      this.control.control?.setValue(0, { emitEvent: false });
      return;
    }

    const numericValue = parseInt(numbers) / 100;

    this.control.control?.setValue(numericValue, { emitEvent: false });

    this.el.value = this.formatCurrency(numericValue);
  }

  private formatCurrency(value: number): string {
    const formatted = value.toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return 'R$ ' + formatted;
  }
}