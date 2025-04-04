import {Pipe, PipeTransform} from '@angular/core';
import {DeckColumnType, NotificationDeckColumn} from "@models/deck-column";

@Pipe({
  name: 'isDeckColumnNotification'
})
export class IsDeckColumnNotificationPipe implements PipeTransform {
  transform(value: unknown): value is NotificationDeckColumn {
    const typedValue = value as NotificationDeckColumn;
    return typedValue && typedValue.type && typedValue.type == DeckColumnType.NOTIFICATION;
  }
}
