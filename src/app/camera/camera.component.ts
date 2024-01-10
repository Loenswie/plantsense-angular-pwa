import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { CommonModule } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule, WebcamModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})

export class CameraComponent implements OnInit {
  private trigger: Subject<any> = new Subject();
  public webcamImage!: WebcamImage;
  public result!: ApiResponse;
  private nextWebcam: Subject<any> = new Subject();
  sysImage = '';

  // Constructor with HttpClient injection
  constructor(private http: HttpClient) { }

  ngOnInit() {}

  public getSnapshot(): void {
    this.trigger.next(void 0);
  }

  public captureImg(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.sysImage = webcamImage!.imageAsDataUrl;
    console.info('got webcam image', this.sysImage);
    this.sendImageToEndpoint(this.sysImage);
  }

  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }

  private async sendImageToEndpoint(sysImage: string) {
    const formData = new FormData();
    formData.append('image', this.dataURItoBlob(sysImage));

    const headers = new HttpHeaders(
      {
        'Accept': '*/*',
        'Authorization': 'Bearer 82e80ebaf984fa5045332258aecf63a00059e94bfedd91eed37520c0ce1c57f43f4ba4b0d8cafc342a3c01fbca0c43bc40d35a138edd9cb226a1b9729c6a4697be3193f4db5f710f4f1ad1fafcefdd5183ffec18cac1ee1ef1c4d1f9ff699960fea87f1bb294d702ff075515bb111a494781e88ea574363d6b8e65c22ca99f22'
      }
    );

    try {
      const response = await this.http.post('https://test-plantsense-cms.onrender.com/api/detect-plant', formData, { headers: headers }).toPromise();
      console.log('response received is ', response);
      if (response) {
        this.result = response as ApiResponse;
        console.log('result received is ', this.result)
        document.getElementById('type')!.innerHTML = this.result.result.classification.suggestions[0].name;
      }
    } catch (error) {
      console.error('error received is ', error);
    }
  }

  private dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  }

}


interface ApiResponse {
  result: {
    classification: {
      suggestions: [
        {
          name: string;
        }
      ];
    };
  };
}

