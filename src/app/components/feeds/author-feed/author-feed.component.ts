import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
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
import {FeedService} from '@services/feed.service';
import {GroupedPost} from '@models/grouped-post';
import {PostCardGrandParentPipe} from '@shared/pipes/post-card-grandparent.pipe';
import {PostCardParentPipe} from '@shared/pipes/post-card-parent.pipe';
import {SpinnerComponent} from '@components/shared/spinner/spinner.component';

@Component({
  selector: 'author-feed',
  imports: [
    CommonModule,
    ScrollDirective,
    PostCardComponent,
    DividerComponent,
    PostCardGrandParentPipe,
    PostCardParentPipe,
    SpinnerComponent,
  ],
  templateUrl: './author-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorFeedComponent implements OnInit, OnDestroy {
  feed = viewChild<ElementRef>('feed');
  did = input.required<string>();
  filter = input<
    | 'posts_with_replies'
    | 'posts_no_replies'
    | 'posts_with_media'
    | 'posts_and_author_threads'
    | 'posts_with_video'>('posts_no_replies');

  posts: GroupedPost[];
  cursor: string;
  loading = true;
  reloadReady = false;
  reloadTimeout: ReturnType<typeof setTimeout>;

  constructor(
    private postService: PostService,
    private feedService: FeedService,
    protected dialogService: DialogService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef
  ) {
    effect(() => {
      if (this.filter()) {
        this.initData();
      }
    })

  }

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
      filter: this.filter(),
      limit: 15
    })).subscribe({
      next: response => {
        this.feed().nativeElement.scrollTo({top:0});
        this.cursor = response.data.cursor;
        this.posts = this.feedService.groupFeedViewPosts(response.data.feed);
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
      filter: this.filter(),
      cursor: this.cursor,
      limit: 15
    })).subscribe({
      next: response => {
        this.cursor = response.data.cursor;
        const newPosts = this.feedService.groupFeedViewPosts(response.data.feed);
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
          from(agent.getAuthorFeed({
            actor: this.did(),
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

  scrollToTop() {
    this.feed().nativeElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
