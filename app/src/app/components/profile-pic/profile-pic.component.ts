import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-pic',
  templateUrl: './profile-pic.component.html',
  styleUrls: ['./profile-pic.component.css']
})
export class ProfilePicComponent {
  selectedFile!: File;

  constructor(private userService: UserService) { }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadProfilePic(): void {
    const userId = sessionStorage.getItem('userId'); // Get user ID from session
    if (!userId) {
      console.error('User ID not found in session');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', this.selectedFile);
    formData.append('userId', userId);

    this.userService.uploadProfilePic(formData)
      .subscribe(
        response => {
          console.log('Profile picture uploaded successfully');
          // Handle success
        },
        error => {
          console.error('Error uploading profile picture:', error);
          // Handle error
        }
      );
  }
}
