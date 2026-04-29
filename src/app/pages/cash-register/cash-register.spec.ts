import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashRegister } from './cash-register';

describe('CashRegister', () => {
  let component: CashRegister;
  let fixture: ComponentFixture<CashRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
