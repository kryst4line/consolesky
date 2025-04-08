import {ChangeDetectionStrategy, ChangeDetectorRef, Component, input, OnInit, WritableSignal} from '@angular/core';
import {Notification} from '@models/notification';
import {AvatarComponent} from '@components/shared/avatar/avatar.component';
import {IsLikeNotificationPipe} from '@shared/pipes/type-guards/notifications/is-like-notification.pipe';
import {IsFollowNotificationPipe} from '@shared/pipes/type-guards/notifications/is-follow-notification.pipe';
import {IsRepostNotificationPipe} from '@shared/pipes/type-guards/notifications/is-repost-notification.pipe';
import {IsStarterPackNotificationPipe} from '@shared/pipes/type-guards/notifications/is-starterpack-notification.pipe';
import {NgTemplateOutlet, SlicePipe} from '@angular/common';
import {DisplayNamePipe} from '@shared/pipes/display-name.pipe';
import {AppBskyEmbedImages, AppBskyFeedDefs} from '@atproto/api';
import {IsEmbedImagesViewPipe} from '@shared/pipes/type-guards/is-embed-images-view.pipe';
import {IsEmbedVideoViewPipe} from '@shared/pipes/type-guards/is-embed-video-view.pipe';
import {IsEmbedRecordWithMediaViewPipe} from '@shared/pipes/type-guards/is-embed-recordwithmedia-view.pipe';
import {DialogService} from '@services/dialog.service';

@Component({
  selector: 'notification-card',
  imports: [
    AvatarComponent,
    IsLikeNotificationPipe,
    IsFollowNotificationPipe,
    IsRepostNotificationPipe,
    IsStarterPackNotificationPipe,
    NgTemplateOutlet,
    SlicePipe,
    DisplayNamePipe,
    IsEmbedImagesViewPipe,
    IsEmbedVideoViewPipe,
    IsEmbedRecordWithMediaViewPipe
  ],
  templateUrl: './notification-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCardComponent implements OnInit {
  notification = input<Notification>();
  post: WritableSignal<AppBskyFeedDefs.PostView>;

  constructor(
    private dialogService: DialogService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.post = this.notification().post;
    this.cdRef.markForCheck();
  }

  openAuthor(event: Event, did: string) {
    //TODO: OpenAuthor
    event.stopPropagation();
  }

  openImage(event: Event, images: AppBskyEmbedImages.ViewImage[], index: number) {
    event.stopPropagation();
    this.dialogService.openImage(images, index);
  }
}
