import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaleDetailsDialog } from './sale-details-dialog';

describe('SaleDetailsDialog', () => {
  let component: SaleDetailsDialog;
  let fixture: ComponentFixture<SaleDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleDetailsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleDetailsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});