import { TestBed } from '@angular/core/testing';

import { JwtHelper } from './jwt-helper';

describe('JwtHelper', () => {
  let service: JwtHelper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtHelper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
