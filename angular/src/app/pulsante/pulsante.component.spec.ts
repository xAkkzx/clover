import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PulsanteComponent } from './pulsante.component';

describe('PulsanteComponent', () => {
  let component: PulsanteComponent;
  let fixture: ComponentFixture<PulsanteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PulsanteComponent]
    });
    fixture = TestBed.createComponent(PulsanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
