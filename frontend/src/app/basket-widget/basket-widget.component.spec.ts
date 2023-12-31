import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketWidgetComponent } from './basket-widget.component';

describe('BasketWidgetComponent', () => {
  let component: BasketWidgetComponent;
  let fixture: ComponentFixture<BasketWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasketWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BasketWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
