import { TestBed } from '@angular/core/testing';

import { CashRegister } from './cash-register';

describe('CashRegister', () => {
  let service: CashRegister;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashRegister);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
