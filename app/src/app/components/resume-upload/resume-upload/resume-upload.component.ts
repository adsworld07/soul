import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ResumeUploadService } from '../../../services/resume-upload.service';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { trigger, transition, style, animate } from '@angular/animations';
declare var bootstrap: any;

@Component({
  selector: 'app-resume-upload',
  templateUrl: './resume-upload.component.html',
  styleUrls: ['./resume-upload.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUpDown', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})

export class ResumeUploadComponent implements OnInit, AfterViewInit {
  files: any[] = [];
  filesExist: boolean = false;
  isModalOpen: boolean = false;
  @ViewChild('uploadModal') uploadModal!: ElementRef;

  private modalInstance: any;

  constructor(
    private resumeUploadService: ResumeUploadService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.fetchFileNames();

  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
   
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file, file.name);
  
      this.resumeUploadService.uploadFile(formData).subscribe(
        () => {
          this.isModalOpen=false
          this.toastr.success('Upload successful');
          this.fetchFileNames(); // Refresh file list
        },
        (error: any) => {
          console.error('Error uploading file:', error);
          this.toastr.error('Upload failed');
        }
      );
    }
  }
  

  openGoogleDrivePicker() {
    // Implement Google Drive picker integration here
    console.log('Open Google Drive picker');
  }
  ngAfterViewInit() {
    if (this.uploadModal) {
      this.modalInstance = new bootstrap.Modal(this.uploadModal.nativeElement);
    }
  }

  fetchFileNames() {
    this.resumeUploadService.showFileNames().subscribe(
      (response: any[]) => {
        if (response.length > 0) {
          const latestFile = response[response.length - 1];
          this.files = [{
            filename: latestFile.filename,
            originalname: latestFile.originalname,
            contentType: latestFile.contentType,
            uploadDate: latestFile.uploadDate
          }];
          this.filesExist = true;
        } else {
          this.files = [];
          this.filesExist = false;
        }
      },
      error => {
        console.error('Error fetching file names:', error);
      }
    );
  }

  getUploadUrl(): string {
    return this.resumeUploadService.url;
  }

  public dropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const formData = new FormData();
          formData.append('file', file, droppedFile.relativePath);
          this.resumeUploadService.uploadFile(formData).subscribe(
            () => {
              this.toastr.success('Upload successful');
              this.closeUploadModal();
              this.fetchFileNames();
            },
            (error: any) => {
              console.error('Error uploading file:', error);
            }
          );
        });
      }
    }
  }

  downloadPdf(filename: string, contentType: string) {
    this.resumeUploadService.downloadPDF(filename).subscribe(
      (res: Blob) => {
        const file = new Blob([res], { type: contentType });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      },
      error => {
        console.error('Error downloading PDF:', error);
      }
    );
  }

  openUploadModal() {
    if (this.modalInstance) {
      this.modalInstance.show();
    } else {
      console.error('uploadModal is not defined');
    }
  }

  closeUploadModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    } else {
      console.error('uploadModal is not defined');
    }
  }
}
