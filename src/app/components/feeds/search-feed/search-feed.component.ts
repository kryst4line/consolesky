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
  WritableSignal,
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {agent} from '@core/bsky.api';
import {ScrollDirective} from '@shared/directives/scroll.directive';
import {AppBskyFeedDefs} from '@atproto/api';
import {PostService} from '@services/post.service';
import {from} from 'rxjs';
import {PostCardComponent} from '@components/cards/post-card/post-card.component';
import {MessageService} from '@services/message.service';
import {DialogService} from '@services/dialog.service';
import {DividerComponent} from '@components/shared/divider/divider.component';
import {FeedService} from '@services/feed.service';
import {SpinnerComponent} from '@components/shared/spinner/spinner.component';

@Component({
  selector: 'search-feed',
  imports: [
    CommonModule,
    ScrollDirective,
    PostCardComponent,
    DividerComponent,
    SpinnerComponent,
  ],
  templateUrl: './search-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFeedComponent implements OnInit, OnDestroy {
  feed = viewChild<ElementRef>('feed');
  query = input.required<string>();
  sort = input.required<'top' | 'latest'>();

  posts: WritableSignal<AppBskyFeedDefs.PostView>[];
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
      if (this.query() || this.sort()) {
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
    from(agent.app.bsky.feed.searchPosts({
      q: this.query(),
      sort: this.sort(),
      limit: 25
    })).subscribe({
      next: response => {
        this.feed().nativeElement.scrollTo({top:0});
        this.cursor = response.data.cursor;
        this.posts = response.data.posts.map(this.postService.setPost);
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

    from(agent.app.bsky.feed.searchPosts({
      q: this.query(),
      sort: this.sort(),
      cursor: this.cursor,
      limit: 25
    })).subscribe({
      next: response => {
        this.cursor = response.data.cursor;
        this.posts = [...this.posts, ...response.data.posts.map(this.postService.setPost)];
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
          from(agent.app.bsky.feed.searchPosts({
            q: this.query(),
            sort: this.sort(),
            limit: 1
          })).subscribe({
            next: response => {
              const post = response.data.posts[0];
              const lastPost = this.posts[0]();
              let isNewPost = false;

              if (post.uri == lastPost.uri) {
                isNewPost = true;
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
