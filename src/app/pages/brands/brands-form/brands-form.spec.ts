import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsForm } from './brands-form';

describe('BrandsForm', () => {
  let component: BrandsForm;
  let fixture: ComponentFixture<BrandsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
