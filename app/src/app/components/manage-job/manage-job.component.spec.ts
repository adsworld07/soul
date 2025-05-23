import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageJobComponent } from './manage-job.component';

describe('ManageJobComponent', () => {
  let component: ManageJobComponent;
  let fixture: ComponentFixture<ManageJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageJobComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
