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
import {MessageService} from '@services/message.service';
import {DividerComponent} from '@components/shared/divider/divider.component';
import {DialogService} from '@services/dialog.service';

@Component({
  selector: 'notification-feed',
  imports: [
    CommonModule,
    ScrollDirective,
    PostCardComponent,
    IsNotificationArrayPipe,
    NotificationCardComponent,
    DividerComponent,
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
    protected dialogService: DialogService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef
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
      }, error: err => this.messageService.error(err.message)
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
      }, error: err => this.messageService.error(err.message)
    });
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
            }, error: err => this.messageService.error(err.message)
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

  openNotification(notification: Notification) {
    if (
      notification.reason == 'like' ||
      notification.reason == 'repost'
    ) {
      this.dialogService.openThread(notification.uri)
    }
  }
}
