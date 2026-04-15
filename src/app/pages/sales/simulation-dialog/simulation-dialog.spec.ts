import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulationDialog } from './simulation-dialog';

describe('SimulationDialog', () => {
  let component: SimulationDialog;
  let fixture: ComponentFixture<SimulationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
