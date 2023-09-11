import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitoloComponent } from './titolo.component';

describe('TitoloComponent', () => {
  let component: TitoloComponent;
  let fixture: ComponentFixture<TitoloComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TitoloComponent]
    });
    fixture = TestBed.createComponent(TitoloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
