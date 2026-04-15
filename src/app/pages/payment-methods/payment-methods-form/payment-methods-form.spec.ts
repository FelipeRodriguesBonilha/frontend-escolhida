import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodsForm } from './payment-methods-form';

describe('PaymentMethodsForm', () => {
  let component: PaymentMethodsForm;
  let fixture: ComponentFixture<PaymentMethodsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
