import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  startRecording() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (!stream) {
          console.error('No stream available.');
          return;
        }
        this.mediaRecorder = new MediaRecorder(stream);
        this.recordedChunks = [];
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
        this.mediaRecorder.start();
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
      });
  }



  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (this.mediaRecorder) {
        // Adding a delay of 5 seconds before stopping the recording
        setTimeout(() => {
          this.mediaRecorder!.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            resolve(blob);
          };
          this.mediaRecorder!.stop();
        }, 5000);
      } else {
        reject(new Error("mediaRecorder is null"));
      }
    });
  }

}

