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
import {PostUtils} from '@shared/utils/post-utils';
import {SignalizedFeedViewPost} from '@models/signalized-feed-view-post';
import {from} from 'rxjs';
import {PostCardComponent} from '@components/cards/post-card/post-card.component';
import {MessageService} from '@services/message.service';

@Component({
  selector: 'author-feed',
  imports: [
    CommonModule,
    ScrollDirective,
    PostCardComponent,
  ],
  templateUrl: './author-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorFeedComponent implements OnInit, OnDestroy {
  feed = viewChild<ElementRef>('feed');
  did = input.required<string>();

  posts: SignalizedFeedViewPost[];
  cursor: string;
  loading = true;
  reloadReady = false;
  reloadTimeout: ReturnType<typeof setTimeout>;

  constructor(
    private postService: PostService,
    private messageService: MessageService,
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
    from(agent.getAuthorFeed({
      actor: this.did(),
      limit: 15
    })).subscribe({
      next: response => {
        this.cursor = response.data.cursor;
        this.posts = response.data.feed.map(fvp => PostUtils.parseFeedViewPost(fvp, this.postService));
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

    from(agent.getAuthorFeed({
      actor: this.did(),
      cursor: this.cursor,
      limit: 15
    })).subscribe({
      next: response => {
        this.cursor = response.data.cursor;
        const newPosts = response.data.feed.map(fvp => PostUtils.parseFeedViewPost(fvp, this.postService));
        this.posts = [...this.posts, ...newPosts];
        this.cdRef.markForCheck();
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }, error: err => this.messageService.error(err.message)
    });
  }

  openPost(uri: string) {
    //TODO: OpenPost

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
          from(agent.getAuthorFeed({
            actor: this.did(),
            limit: 1
          })).subscribe({
            next: response => {
              const post = response.data.feed[0];
              const lastPost = this.posts[0];
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
