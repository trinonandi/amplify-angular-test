import { Component } from '@angular/core';
import {HttpService} from "./services/http.service";
import { VideoService } from "./services/video-recording-service.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private http:HttpService, private videoService: VideoService) {
  }

  instructionPresent:boolean = true;
  // startedIns:boolean = false;
  toggleSection:boolean = false;
  notToggleStart:boolean = true;
  showChat:boolean = false;
  startChatWindow:boolean =false;
  correctCount:number = 0;
  wrongCount:number = 0;
  endOfChat: boolean = false;



  handleCounter(count: number) {
    if (count === 1) {
      this.correctCount++;
    } else if (count === 2) {
      this.wrongCount++;
    }
  }

  clickInstruction() {
    this.instructionPresent = !this.instructionPresent;
    localStorage.clear();
    if (!this.instructionPresent) {
      this.videoService.startRecording();  // Start recording
    }
  }
  clickInstructionNext() {
    this.toggleSection = !this.toggleSection;
    this.notToggleStart = !this.notToggleStart;
    this.showChat = !this.showChat;
  }
  toggleInstructions() {
    this.toggleSection = !this.toggleSection;
  }

  startChat() {
    this.showChat = true;
    this.startChatWindow = true;
    this.toggleSection = !this.toggleSection;
    setTimeout(() => {
      const chatArea = document.querySelector('.chat-area');
      if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    }, 0);
  }

  async handleChatEnd() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.endOfChat = true;
    const videoBlob = await this.videoService.stopRecording();  // Stop recording
    const formData = new FormData();
    // Retrieve the text input from local storage
    const storedText = localStorage.getItem('name') || '';
    formData.append('video', videoBlob, 'mediation-video.webm');
    this.http.uploadVideo(formData, storedText).subscribe(response => {
      console.log('Video uploaded successfully:', response);
    }, error => {
      console.error('Error uploading video:', error);
    });

  }

}
