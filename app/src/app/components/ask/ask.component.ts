import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-ask',
  templateUrl: './ask.component.html',
  styleUrls: ['./ask.component.css']
})
export class AskComponent {
  helpForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.helpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      query: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.helpForm.valid) {
      console.log('Form Submitted', this.helpForm.value);
      // Handle form submission
    } else {
      console.log('Form not valid');
    }
  }
}
