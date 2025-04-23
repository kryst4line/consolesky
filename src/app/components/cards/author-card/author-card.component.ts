import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  input,
  model,
  output
} from '@angular/core';
import {AppBskyActorDefs, AppBskyEmbedRecord} from '@atproto/api';
import {AvatarComponent} from '@components/shared/avatar/avatar.component';
import {DisplayNamePipe} from '@shared/pipes/display-name.pipe';
import {OverlayModule} from '@angular/cdk/overlay';
import {DialogService} from '@services/dialog.service';
import {ButtonFollowComponent} from '@components/shared/button-follow/button-follow.component';

@Component({
  selector: 'author-card',
  imports: [
    AvatarComponent,
    DisplayNamePipe,
    OverlayModule,
    ButtonFollowComponent
  ],
  templateUrl: './author-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorCardComponent {
  author = model.required<Partial<{
    did: string,
    handle: string,
    avatar?: string,
    displayName?: string,
    viewer?: AppBskyActorDefs.ViewerState
  }>>();
  compact = input(false, {transform: booleanAttribute});

  onEmbedRecord = output<AppBskyEmbedRecord.View>();

  constructor(
    protected dialogService: DialogService,
    private cdRef: ChangeDetectorRef
  ) {
    effect(() => {
      if (this.author()) cdRef.markForCheck();
    });
  }
}
