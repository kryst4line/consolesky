import {booleanAttribute, ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {TimelineDeckColumn} from '@models/deck-column';
import {TimelineFeedComponent} from '@components/feeds/timeline-feed/timeline-feed.component';

@Component({
  selector: 'timeline-deck-column',
  imports: [
    TimelineFeedComponent
  ],
  templateUrl: './timeline-deck-column.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineDeckColumnComponent {
  column = model.required<TimelineDeckColumn>();
  firstIndex = input(false, {transform: booleanAttribute});
  lastIndex = input(false, {transform: booleanAttribute});
  reorderNext = output();
  reorderPrev = output();
  delete = output();
  widthChange = output<number>();
}
