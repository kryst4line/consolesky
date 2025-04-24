import {booleanAttribute, ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {AppBskyEmbedRecord, AppBskyFeedDefs} from '@atproto/api';
import {AvatarComponent} from '@components/shared/avatar/avatar.component';
import {OverlayModule} from '@angular/cdk/overlay';
import {DialogService} from '@services/dialog.service';

@Component({
  selector: 'generator-card',
  imports: [
    AvatarComponent,
    OverlayModule
  ],
  templateUrl: './generator-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneratorCardComponent {
  generator = input.required<AppBskyFeedDefs.GeneratorView>();
  compact = input(false, {transform: booleanAttribute});

  onEmbedRecord = output<AppBskyEmbedRecord.View>();

  constructor(
    protected dialogService: DialogService
  ) {}
}
