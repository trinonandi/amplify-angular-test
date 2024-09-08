import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Instruction} from "../DTO/instruction";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  // instructionUrl: string = 'conversation.json';
  conservationUrl: string = 'conversation.json';
  //
  // private uploadUrl: string = 'http://127.0.0.1:5000'; // Update with your backend URL
  private uploadUrl: string = 'http://52.52.154.252';
  // get the entire script
  getChat():Observable<Instruction[]> {
    return this.http.get<Instruction[]>(this.conservationUrl);
  }


  uploadAudio(audioBlob: Blob, content: string, roundNumber: string): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('content', content);  // Add the text input from local storage
    formData.append('roundNumber', roundNumber);
    return this.http.post(this.uploadUrl + '/upload-audio', formData);
  }

  uploadAnswers(data: { answers: any[], score: { right: number, wrong: number } }): Observable<any> {
    return this.http.post(this.uploadUrl+'/upload-answers', data);
  }

  uploadVideo(videoData: FormData, content: string): Observable<any> {
    videoData.append('content', content);  // Add the text input to the form data
    return this.http.post(this.uploadUrl + '/upload-video', videoData);
  }

}
