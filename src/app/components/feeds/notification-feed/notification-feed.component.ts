import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {agent} from '@core/bsky.api';
import {ScrollDirective} from '@shared/directives/scroll.directive';
import {PostService} from '@services/post.service';
import {from} from 'rxjs';
import {PostCardComponent} from '@components/cards/post-card/post-card.component';
import NotificationUtils from '@shared/utils/notification-utils';
import {Notification} from '@models/notification';
import {IsNotificationArrayPipe} from '@shared/pipes/type-guards/notifications/is-post-notification';
import {NotificationCardComponent} from '@components/cards/notification-card/notification-card.component';

@Component({
  selector: 'notification-feed',
  imports: [
    CommonModule,
    ScrollDirective,
    PostCardComponent,
    IsNotificationArrayPipe,
    NotificationCardComponent,
  ],
  templateUrl: './notification-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationFeedComponent implements OnInit, OnDestroy {
  feed = viewChild<ElementRef>('feed');

  notifications: Notification[];
  cursor: string;
  loading = true;
  reloadReady = false;
  reloadTimeout: ReturnType<typeof setTimeout>;

  constructor(
    private postService: PostService,
    public cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initData();
  }

  ngOnDestroy() {
    clearTimeout(this.reloadTimeout);
  }

  initData() {
    this.loading = true;
    from(agent.listNotifications({
      limit: 15
    })).subscribe({
      next: response => {
        this.cursor = response.data.cursor;
        NotificationUtils.parseNotifications(response.data.notifications, this.postService)
          .then(notifications => {
            this.notifications = notifications;
            this.cdRef.markForCheck();
            setTimeout(() => {
              this.loading = false;
              this.manageRefresh();
            }, 500);
          });
        //TODO: MessageService
      }, error: err => console.log(err.message)
    });
  }

  nextData() {
    if (this.loading) return;
    this.loading = true;

    from(agent.listNotifications({
      cursor: this.cursor,
      limit: 15
    })).subscribe({
      next: response => {
        this.cursor = response.data.cursor;
        NotificationUtils.parseNotifications(response.data.notifications, this.postService)
          .then(notifications => {
            this.notifications = [...this.notifications, ...notifications];
            this.cdRef.markForCheck();
            setTimeout(() => {
              this.loading = false;
              this.manageRefresh();
            }, 500);
          });
        setTimeout(() => {
          this.loading = false;
        }, 500);
        //TODO: MessageService
      }, error: err => console.log(err.message)
    });
  }

  openNotification(notification: Notification) {
    //TODO: OpenNotification
    // Mute all video players
    // this.feed().nativeElement.querySelectorAll('video').forEach((video: HTMLVideoElement) => {
    //   video.muted = true;
    // });
    //
    // this.dialogService.openThread(uri, this.feed().nativeElement);
  }

  manageRefresh() {
    if (this.loading) return;

    if (!this.reloadReady && !this.reloadTimeout) {
      this.reloadTimeout = setTimeout(() => {
        this.reloadTimeout = undefined;

        if (this.feed().nativeElement.scrollTop == 0) {
          this.reloadReady = false;
          from(agent.listNotifications({
            limit: 1
          })).subscribe({
            next: response => {
              const notification = response.data.notifications[0];
              const lastNotification = this.notifications[0];

              if (notification?.indexedAt !== lastNotification?.notification.indexedAt) {
                this.initData();
              } else {
                this.manageRefresh();
              }
            }
          });
        } else {
          this.reloadReady = true;
        }
      }, 30e3);
      // Timer in seconds
    } else if (this.reloadReady && this.feed().nativeElement.scrollTop == 0) {
      this.reloadReady = false;
      this.initData();
    }
  }
}
