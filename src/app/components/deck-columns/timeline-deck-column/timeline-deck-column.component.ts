import {booleanAttribute, ChangeDetectionStrategy, Component, input, model, output, signal} from '@angular/core';
import {TimelineDeckColumn} from '@models/deck-column';
import {TimelineFeedComponent} from '@components/feeds/timeline-feed/timeline-feed.component';
import {NgTemplateOutlet} from '@angular/common';
import {ColumnService} from '@services/column.service';

@Component({
  selector: 'timeline-deck-column',
  imports: [
    TimelineFeedComponent,
    NgTemplateOutlet
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

  showSettings = signal(false);

  constructor(
    private columnService: ColumnService
  ) {}

  updateFiltering(option: 'hideReplies' | 'hideUnfollowedReplies' | 'hideReposts', value: boolean) {
    this.column.update(column => {
      switch (option) {
        case "hideReplies":
          column.options.hideReplies = value;
          if (value) column.options.hideUnfollowedReplies = !value;
          break;
        case "hideUnfollowedReplies":
          column.options.hideUnfollowedReplies = value;
          if (value) column.options.hideReplies = !value;
          break;
        case "hideReposts":
          column.options.hideReposts = value;
          break;
      }
      return column;
    });

    this.columnService.updateColumn(this.column());
  }
}
