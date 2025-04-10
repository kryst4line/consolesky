import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {agent} from '@core/bsky.api';
import {ScrollDirective} from '@shared/directives/scroll.directive';
import {$Typed} from '@atproto/api';
import {ReasonRepost} from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import {PostService} from '@services/post.service';
import {from} from 'rxjs';
import {PostCardComponent} from '@components/cards/post-card/post-card.component';
import {MessageService} from '@services/message.service';
import {DialogService} from '@services/dialog.service';
import {DividerComponent} from '@components/shared/divider/divider.component';
import {GroupedPost, GroupedPostOptions} from '@models/grouped-post';
import {FeedService} from '@services/feed.service';
import {PostCardGrandParentPipe} from '@shared/pipes/post-card-grandparent.pipe';
import {PostCardParentPipe} from '@shared/pipes/post-card-parent.pipe';

@Component({
  selector: 'timeline-feed',
  imports: [
    CommonModule,
    ScrollDirective,
    PostCardComponent,
    DividerComponent,
    PostCardGrandParentPipe,
    PostCardParentPipe,
  ],
  templateUrl: './timeline-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineFeedComponent implements OnInit, OnDestroy {
  feed = viewChild<ElementRef>('feed');
  groupedPostOptions = input<GroupedPostOptions>();

  posts: GroupedPost[];
  cursor: string;
  loading = true;
  reloadReady = false;
  reloadTimeout: ReturnType<typeof setTimeout>;

  constructor(
    private postService: PostService,
    private feedService: FeedService,
    private messageService: MessageService,
    protected dialogService: DialogService,
    public cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initData();

    // Listen to new posts to refresh
    this.postService.refreshFeeds.subscribe({
      next: () => {
        if (this.feed().nativeElement.scrollTop == 0) {
          this.initData();
        } else {
          this.reloadReady = true;
        }
      }
    });
  }

  ngOnDestroy() {
    this.postService.refreshFeeds.unsubscribe();
    clearTimeout(this.reloadTimeout);
  }

  initData() {
    this.loading = true;
    from(agent.getTimeline({
      limit: 50
    })).subscribe({
      next: response => {
        this.cursor = response.data.cursor;
        this.posts = this.feedService.groupFeedViewPosts(response.data.feed, this.groupedPostOptions());
        this.cdRef.markForCheck();
        setTimeout(() => {
          this.loading = false;
          this.manageRefresh();
        }, 500);
      }, error: err => this.messageService.error(err.message)
    });
  }

  nextData() {
    if (this.loading) return;
    this.loading = true;

    from(agent.getTimeline({
      cursor: this.cursor,
      limit: 50
    })).subscribe({
      next: response => {
        this.cursor = response.data.cursor;
        const newPosts = this.feedService.groupFeedViewPosts(response.data.feed, this.groupedPostOptions());
        this.posts = [...this.posts, ...newPosts];
        this.cdRef.markForCheck();
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
          from(agent.getTimeline({
            limit: 1
          })).subscribe({
            next: response => {
              const post = response.data.feed[0];
              const lastPost = this.posts[0].thread[this.posts[0].thread.length-1];
              let isNewPost = false;

              if (post) {
                if (post.reason) {
                  const reason = post.reason as $Typed<ReasonRepost>;
                  if (!lastPost.reason) isNewPost = true;
                  if (reason.indexedAt !== (lastPost.reason as $Typed<ReasonRepost>)?.indexedAt) isNewPost = true;
                } else {
                  if (lastPost.reason) isNewPost = true;
                  if (post.post.indexedAt !== lastPost.post().indexedAt) isNewPost = true;
                }
              }

              if (isNewPost) {
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
}
