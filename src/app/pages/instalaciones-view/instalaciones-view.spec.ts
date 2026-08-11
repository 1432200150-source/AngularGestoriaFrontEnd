import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstalacionesView } from './instalaciones-view';

describe('InstalacionesView', () => {
  let component: InstalacionesView;
  let fixture: ComponentFixture<InstalacionesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstalacionesView],
    }).compileComponents();

    fixture = TestBed.createComponent(InstalacionesView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
