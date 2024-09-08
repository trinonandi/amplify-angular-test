import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {provideHttpClient, withFetch} from "@angular/common/http";
import { InstructionCardComponent } from './components/instruction-card/instruction-card.component';
import {FormsModule} from "@angular/forms";
import { ChatCardComponent } from './components/chat-card/chat-card.component';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";

@NgModule({
  declarations: [
    AppComponent,
    InstructionCardComponent,
    ChatCardComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule

    ],
  providers: [
    provideClientHydration(),
    provideHttpClient(
      withFetch()
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
