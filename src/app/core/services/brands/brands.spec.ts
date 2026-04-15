import { TestBed } from '@angular/core/testing';

import { Brands } from './brands';

describe('Brands', () => {
  let service: Brands;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Brands);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
