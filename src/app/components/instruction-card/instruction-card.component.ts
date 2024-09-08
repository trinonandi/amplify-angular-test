import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {Conversation, Instruction} from "../../DTO/instruction";
import {NgForm} from "@angular/forms";
import {HttpService} from "../../services/http.service";


@Component({
  selector: 'app-instruction-card',
  templateUrl: './instruction-card.component.html',
  styleUrl: './instruction-card.component.css'
})
export class InstructionCardComponent implements OnChanges {

  audioEnds: boolean = false
  textInput: string = '';
  selectedOption: string | null = null;
  attempts: number = 0;
  showCorrectAnswer: boolean = false;
  answer: string = '';
  correctAnswer:boolean = false;
  showTryAgainDiv:boolean = false;
  emitValue:number = 0;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioUrl: string | null = null;
  isRecording: boolean = false;
  showAudio:boolean = false;
  currentAnswer:string = '';
  backendResponse: string = '';
  loading: boolean = false;
  allAttemptsUsed: boolean = false;
  recordingAttempts: number = 0;
  transcription: string = '';

  @Input() instruction: Instruction = {
    actor: '',
    conversation: {
      content: '',
      inputType: '',
      options: [],
      correctAnswer: ''
    },
    audio: '',
    round: undefined
  };

  @Output() onComplete:EventEmitter<string> = new EventEmitter<string>();
  @Output() incrementCorrectOrWrong:EventEmitter<number> = new EventEmitter<number>();

  constructor(private audioUploadService: HttpService) {}

  isConversation(conversation: string | Conversation): conversation is Conversation {
    return typeof conversation === 'object';
  }

  updateRoundNumber() {
    let round = this.instruction.round ?? '';
    console.log('Updating round number:', round);
    localStorage.setItem('roundNumber', `${round}`);
  }

  retrieveRoundNumber(): string {
    const roundNumber = localStorage.getItem('roundNumber') || '';
    console.log('Retrieved round number:', roundNumber);
    return roundNumber;
  }



  submitForm(submitForm: NgForm) {
    let response: string = '';
    if (this.isConversation(this.instruction.conversation)) {
      this.updateRoundNumber();  // Centralized round number update

      if (this.instruction.conversation.inputType === 'text') {
        response = this.textInput;
        this.storeAnswer(response);
        localStorage.setItem('name', response);

        if (this.instruction.conversation.content) {
          this.answer = this.instruction.conversation.content.replace('___', response);
        }
        this.currentAnswer = this.answer;
        this.showAudio = true;
      } else if (this.instruction.conversation.inputType === 'radio') {
        response = this.selectedOption || '';
        this.attempts++;
        this.storeAnswerOption(response, this.attempts);

        if (response === this.instruction.conversation.correctAnswer) {
          if (this.instruction.conversation.content) {
            this.answer = this.instruction.conversation.content.replace('___', response);
            this.emitValue = 1;
            this.currentAnswer = this.answer;
            this.showAudio = true;
            this.correctAnswer = false;
          }
          this.correctAnswer = true;
        } else if (this.attempts === 3) {
          setTimeout(() => {
            this.resetSelectedOption();
          }, 2000);
          this.showCorrectAnswer = true;
          const val: string = this.instruction.conversation.correctAnswer || '';
          if (this.instruction.conversation.content) {
            this.answer = this.instruction.conversation.content.replace('___', val);
          }
          this.emitValue = 2;
          this.currentAnswer = this.answer;
          this.showAudio = true;
          this.showTryAgainDiv = false;
          this.correctAnswer = true;
        } else {
          setTimeout(() => {
            this.resetSelectedOption();
          }, 2000);
          this.showTryAgainDiv = true;
        }
      }
    }
  }

  resetSelectedOption() {
    this.selectedOption = null;
  }

  storeAnswerOption(answer: string, attempts: number) {
    const answers = JSON.parse(localStorage.getItem('answers') || '[]');
    const existingAnswerIndex = answers.findIndex((ans: any) => this.isConversation(this.instruction.conversation) && ans.question === this.instruction.conversation.content);

    if (existingAnswerIndex !== -1) {
      const existingAnswer = answers[existingAnswerIndex];
      if (!existingAnswer.answers) {
        existingAnswer.answers = {};
      }
      existingAnswer.answers[`selected_Answer_attempt${attempts}`] = answer;
      existingAnswer.attempts = attempts;
    } else {
      const newAnswer = {
        question: this.isConversation(this.instruction.conversation) ? this.instruction.conversation.content : '',
        answers: {
          [`selected_Answer_attempt${attempts}`]: answer
        },
        attempts: attempts
      };
      answers.push(newAnswer);
    }

    localStorage.setItem('answers', JSON.stringify(answers));
  }



  storeAnswer(answer: string) {
    const answers = JSON.parse(localStorage.getItem('answers') || '[]');
    if (this.isConversation(this.instruction.conversation)) {
      answers.push({
        question: this.instruction.conversation.content,
        selected_Answer: answer
      });
    }
    localStorage.setItem('answers', JSON.stringify(answers));
  }

  getNextChat() {
    this.resetForm();
    // 1 -> correct answer, 2 -> wrong answer
    if (this.emitValue === 2) {
      this.incrementCorrectOrWrong.emit(2);
    }
    if (this.emitValue === 1) {
      this.incrementCorrectOrWrong.emit(1);
    }
    this.onComplete.emit(this.answer);
    this.attempts = 0;
    this.showTryAgainDiv = false;
    this.correctAnswer = false;
    this.loading = false;
    this.audioEnds = !this.audioEnds;
  }

  selectOption(option: string): void {
    this.showTryAgainDiv = false;
    this.selectedOption = option;
  }


  nextIns() {
    let response: string = '';
    this.updateRoundNumber();  // Centralized round number update

    if (this.isConversation(this.instruction.conversation)) {
      response = this.instruction.conversation.content || '';
    }
    this.currentAnswer = response;
    this.onComplete.emit(response);
    this.resetForm();
  }

  // checking the instruction is correctly fetched or not
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.instruction);
    let response:string = '';
    if (this.isConversation(this.instruction.conversation) && (this.instruction.conversation.inputType === '')) {
      response = this.instruction.conversation.content || '';
    }
    this.currentAnswer = response;
  }


  resetForm(): void {
    this.showTryAgainDiv = false;
    this.showAudio = false;
    this.textInput = '';
    this.selectedOption = null;
    this.clearAudio();
    this.backendResponse = '';
    this.recordingAttempts = 0;
    this.allAttemptsUsed = false;
    this.transcription = '';
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.isRecording = true;
        this.audioChunks = [];
        this.mediaRecorder.addEventListener("dataavailable", event => {
          this.audioChunks.push(event.data);
        });
      })
      .catch(error => {
        console.error("Error accessing microphone:", error);
      });
  }



  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.addEventListener("stop", () => {
        const audioBlob: Blob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioUrl = URL.createObjectURL(audioBlob);
        this.isRecording = false;
        this.audioEnds = true;

        // Ensure round number is set before sending audio to backend
        this.updateRoundNumber();  // Centralized round number update

        this.sendAudioToBackend(audioBlob).then(() => {
          if (this.isConversation(this.instruction.conversation)) {
            if (this.instruction.conversation.inputType === '') {
              this.nextIns(); // Call nextIns() for empty inputType
            } else {
              this.getNextChat(); // Call getNextChat() for other input types
            }
          }
        });
      });
    }
  }



  async sendAudioToBackend(audioBlob: Blob) {
    this.loading = true;

    const storedText = localStorage.getItem('name') || '';
    const roundNumber: string = this.retrieveRoundNumber();  // Use centralized round number retrieval
    console.log('Retrieved round number in sendAudioToBackend:', roundNumber);

    try {
      const response = await this.audioUploadService.uploadAudio(audioBlob, storedText, roundNumber).toPromise();
      console.log('Success:', response);
    } catch (error) {
      console.error('Error:', error);
      this.backendResponse = 'Error uploading audio';
    } finally {
      this.loading = false;
    }
  }


  clearAudio() {
    this.audioUrl = null;
    this.audioChunks = [];
    this.backendResponse = '';
    this.transcription = '';
  }

}
