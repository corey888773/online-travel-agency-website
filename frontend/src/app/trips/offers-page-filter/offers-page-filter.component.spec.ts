import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersPageFilterComponent } from './offers-page-filter.component';

describe('OffersPageFilterComponent', () => {
  let component: OffersPageFilterComponent;
  let fixture: ComponentFixture<OffersPageFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersPageFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OffersPageFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
