import { Component, OnInit } from '@angular/core';
import { FileUploadService } from '../../services/file-upload.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent implements OnInit {
  currentFile?: File;
  message = '';
  preview = '';
  imageInfos?: any;

  constructor(private uploadService: FileUploadService, private sanitizer: DomSanitizer) { }
 
  ngOnInit(): void {
    this.uploadService.getFiles().subscribe(res => {
      this.imageInfos = res;
      
      for (let r of res) {
        r.imageData = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/png;base64, ${r.imageData}`
        );

        console.log("Response::", r);
      }
    });
  }

  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    const selectedFiles = event.target.files;

    if (selectedFiles) {
      const file: File | null = selectedFiles.item(0);

      if (file) {
        this.preview = '';
        this.currentFile = file;

        const reader = new FileReader();

        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.preview = e.target.result;
        };

        reader.readAsDataURL(this.currentFile);
      }
    }
  }

  upload(): void {
    if (this.currentFile) {
      this.uploadService.upload(this.currentFile).subscribe({
        next: (event: any) => {
          if (event instanceof HttpResponse) {
            this.message = event.body;
            console.log(this.message);
            console.log(event.body);

            this.uploadService.getFiles().subscribe(res => {
              this.imageInfos = res;
              
              for (let r of res) {
                r.imageData = this.sanitizer.bypassSecurityTrustResourceUrl(
                  `data:image/png;base64, ${r.imageData}`
                );
        
                console.log("Response::", r);
              }
            });

          }
        },
        error: (err: any) => {
          console.log(err);

          if (err.error && err.error.message) {
            this.message = err.error.message;
          } else {
            this.message = 'Could not upload the image!';
          }
        },
        complete: () => {
          this.currentFile = undefined;
        }
      });
    }
  }
}
