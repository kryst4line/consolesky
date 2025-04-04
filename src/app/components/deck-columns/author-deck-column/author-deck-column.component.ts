import {booleanAttribute, ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {AuthorDeckColumn} from '@models/deck-column';
import {AuthorFeedComponent} from '@components/feeds/author-feed/author-feed.component';

@Component({
  selector: 'author-deck-column',
  imports: [
    AuthorFeedComponent
  ],
  templateUrl: './author-deck-column.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorDeckColumnComponent {
  column = model.required<AuthorDeckColumn>();
  firstIndex = input(false, {transform: booleanAttribute});
  lastIndex = input(false, {transform: booleanAttribute});
  reorderNext = output();
  reorderPrev = output();
  delete = output();
  widthChange = output<number>();
}
