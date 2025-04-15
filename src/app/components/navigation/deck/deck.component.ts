import {ChangeDetectionStrategy, Component, WritableSignal} from '@angular/core';
import {DeckColumn} from '@models/deck-column';
import {ColumnService} from '@services/column.service';
import {IsDeckColumnTimelinePipe} from '@shared/pipes/type-guards/is-deckcolumn-timeline';
import {
  TimelineDeckColumnComponent
} from '@components/deck-columns/timeline-deck-column/timeline-deck-column.component';
import {IsDeckColumnNotificationPipe} from '@shared/pipes/type-guards/is-deckcolumn-notifications';
import {
  NotificationDeckColumnComponent
} from '@components/deck-columns/notification-deck-column/notification-deck-column.component';
import {IsDeckColumnAuthorPipe} from '@shared/pipes/type-guards/is-deckcolumn-author';
import {AuthorDeckColumnComponent} from '@components/deck-columns/author-deck-column/author-deck-column.component';

@Component({
  selector: 'deck',
  imports: [
    IsDeckColumnTimelinePipe,
    TimelineDeckColumnComponent,
    IsDeckColumnNotificationPipe,
    NotificationDeckColumnComponent,
    IsDeckColumnAuthorPipe,
    AuthorDeckColumnComponent
  ],
  templateUrl: './deck.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeckComponent {
  columns: WritableSignal<Partial<DeckColumn>[]>;

  constructor(
    private columnService: ColumnService,
  ) {
    this.columns = columnService.getColumns();
  }
}
