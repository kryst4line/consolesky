import {Injectable, signal} from '@angular/core';
import {Message} from '@models/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messages = signal<Message[]>([]);

  constructor() {}

  info(text: string) {
    const message = new Message();
    message.type = 'info';
    message.text = text;
    this.messages.update(msgs => {
      return [...msgs, message];
    });

    setTimeout(() => {
      this.messages.update(msgs => {
        return msgs.filter(m => m.uuid !== message.uuid);
      });
    }, 5e3);
  }

  error(text: string) {
    const message = new Message();
    message.type = 'error';
    message.text = text;
    this.messages.update(msgs => {
      return [...msgs, message];
    });

    setTimeout(() => {
      this.messages.update(msgs => {
        return msgs.filter(m => m.uuid !== message.uuid);
      });
    }, 5e3);
  }
}
