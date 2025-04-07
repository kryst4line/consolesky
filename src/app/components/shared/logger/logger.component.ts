import { Component } from '@angular/core';
import {MessageService} from '@services/message.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'logger',
  imports: [
    NgClass
  ],
  templateUrl: './logger.component.html',
})
export class LoggerComponent {

  constructor(
    protected messageService: MessageService
  ) {}
}
