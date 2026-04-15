import { TestBed } from '@angular/core/testing';

import { PaymentMethods } from './payment-methods';

describe('PaymentMethods', () => {
  let service: PaymentMethods;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentMethods);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
