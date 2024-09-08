import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Instruction, Conversation } from "../../DTO/instruction";
import { HttpService } from "../../services/http.service";
import { Chat } from "../../DTO/chat";
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-chat-card',
  templateUrl: './chat-card.component.html',
  styleUrl: './chat-card.component.css'
})
export class ChatCardComponent implements OnInit, AfterViewChecked, OnChanges {

  @Output() answerCounter: EventEmitter<number> = new EventEmitter<number>();


  instructions: Instruction[] = [];
  currInstruction: Instruction = {
    actor: '',
    conversation: '',
    audio: ''
  };
  chatHistory: Chat[] = [];
  currentIndex: number = 0;
  endChat: boolean = false;
  audioToPlay: string | null = null;

  constructor(private http: HttpService, private cdr: ChangeDetectorRef, private appComponent: AppComponent) { }

  // passing the right and wrong counter
  handleAnswer(count: number) {
    // const answers = JSON.parse(localStorage.getItem('answers') || '[]');
    const score = JSON.parse(localStorage.getItem('score') || '{"right": 0, "wrong": 0}');

    if (count === 1) {
      score.right++;
    } else if (count === 2) {
      score.wrong++;
    }
    localStorage.setItem('score', JSON.stringify(score));
    this.answerCounter.emit(count);
  }

  ngOnInit(): void {
    this.http.getChat().subscribe(data => {
      this.instructions = data;
      this.getNext();
    });
  }

  ngOnChanges(changes: SimpleChanges): void { }

  // Scroll to the end
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  // getting the next chat
  async getNext(response?: string): Promise<void> {
    if (response) {
      this.addHistory(response);
    }

    if (this.instructions.length > this.currentIndex) {
      this.currInstruction = this.instructions[this.currentIndex];
      this.currentIndex++;
    }

    if (this.currentIndex == this.instructions.length) {
      this.endChat = true;
      this.sendAnswersToBackend();
      this.appComponent.handleChatEnd();
      return;
    }

    if (this.currInstruction.actor !== 'Mediator') {
      this.addHistory(null);
      if (this.currInstruction.audio) {
        this.audioToPlay = this.currInstruction.audio;
        await this.playAudio(this.currInstruction.audio);
      }
      this.getNext();
    }
  }

  // the chat history
  addHistory(response: string | null): void {
    let message: string | null = '';
    let css: string | null;
    let dp: string | null = '';

    if (this.isConversation(this.currInstruction.conversation)) {
      message = response || this.currInstruction.conversation.content || null;
    } else {
      message = this.currInstruction.conversation || null;
    }

    if (this.currInstruction.actor === 'Mediator') {
      css = 'mediator-class';
    } else if (this.currInstruction.actor === 'Dali') {
      css = 'jacob-class';
      dp = 'B1.png';
    } else {
      css = 'caleb-class';
      dp = 'B2.png';
    }

    this.chatHistory.push({
      person: this.currInstruction.actor,
      response: message,
      cssClass: css,
      dpUrl: dp
    });
  }

  // checking if the chat belongs to mediator or blossom by comparing their conversation type
  isConversation(conversation: string | Conversation): conversation is Conversation {
    return typeof conversation === 'object';
  }

  private scrollToBottom(): void {
    const chatArea = document.querySelector('.chat-area') as HTMLElement | null;
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }

  private playAudio(audioUrl: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.play();
    });
  }

  sendAnswersToBackend(): void {
    const answers = JSON.parse(localStorage.getItem('answers') || '[]');
    const score = JSON.parse(localStorage.getItem('score') || '{"right": 0, "wrong": 0}');
    const name = localStorage.getItem('name') || '';  // Retrieve name from local storage

    const result = {
      answers,
      score,
      name
    };

    this.http.uploadAnswers(result).subscribe(
      response => {
        console.log('Answers successfully uploaded:', response);
        localStorage.removeItem('answers');
        localStorage.removeItem('score');
      },
      error => {
        console.error('Error uploading answers:', error);
      }
    );
  }

}
