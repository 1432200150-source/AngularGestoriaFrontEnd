import { TestBed } from '@angular/core/testing';

import { EscladosTickets } from './esclados-tickets';

describe('EscladosTickets', () => {
  let service: EscladosTickets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EscladosTickets);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
