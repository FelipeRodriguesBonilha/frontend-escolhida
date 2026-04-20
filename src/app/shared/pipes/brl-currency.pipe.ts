import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brl', standalone: true })
export class BrlCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
