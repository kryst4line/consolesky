import {booleanAttribute, ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {NotificationDeckColumn} from '@models/deck-column';
import {NotificationFeedComponent} from '@components/feeds/notification-feed/notification-feed.component';

@Component({
  selector: 'notification-deck-column',
  imports: [
    NotificationFeedComponent
  ],
  templateUrl: './notification-deck-column.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationDeckColumnComponent {
  column = model.required<NotificationDeckColumn>();
  firstIndex = input(false, {transform: booleanAttribute});
  lastIndex = input(false, {transform: booleanAttribute});
  reorderNext = output();
  reorderPrev = output();
  delete = output();
  widthChange = output<number>();
}
