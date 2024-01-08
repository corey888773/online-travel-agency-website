import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTripFormComponent } from './update-trip-form.component';

describe('UpdateTripFormComponent', () => {
  let component: UpdateTripFormComponent;
  let fixture: ComponentFixture<UpdateTripFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTripFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateTripFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
