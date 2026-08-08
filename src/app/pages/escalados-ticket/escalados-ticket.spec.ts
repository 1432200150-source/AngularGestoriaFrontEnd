import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscaladosTicket } from './escalados-ticket';

describe('EscaladosTicket', () => {
  let component: EscaladosTicket;
  let fixture: ComponentFixture<EscaladosTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscaladosTicket],
    }).compileComponents();

    fixture = TestBed.createComponent(EscaladosTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
