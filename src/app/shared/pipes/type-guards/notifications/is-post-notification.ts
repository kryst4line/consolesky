import {Pipe, PipeTransform} from '@angular/core';
import {Notification} from "@models/notification";

@Pipe({
  name: 'isPostNotification'
})
export class IsNotificationArrayPipe implements PipeTransform {
  transform(value: Notification): boolean {
    return value.post && (
      value.reason == 'reply' ||
      value.reason == 'quote' ||
      value.reason == 'mention'
    );
  }
}
