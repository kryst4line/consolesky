import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  input,
  OnInit,
  signal,
  viewChild,
  WritableSignal
} from '@angular/core';
import {PostService} from '@services/post.service';
import {from} from 'rxjs';
import {agent} from '@core/bsky.api';
import {MessageService} from '@services/message.service';
import {$Typed, AppBskyFeedDefs} from '@atproto/api';
import {PostCardDetailComponent} from '@components/cards/post-card-detail/post-card-detail.component';
import {IsFeedDefsNotFoundPostPipe} from '@shared/pipes/type-guards/is-feed-defs-notfoundpost';
import {IsFeedDefsBlockedPostPipe} from '@shared/pipes/type-guards/is-feed-defs-blockedpost';
import {PostCardComponent} from '@components/cards/post-card/post-card.component';
import {DialogService} from '@services/dialog.service';
import {NgTemplateOutlet} from '@angular/common';
import {DividerComponent} from '@components/shared/divider/divider.component';
import {SpinnerComponent} from '@components/shared/spinner/spinner.component';
import {GroupedPost} from '@models/grouped-post';
import {FeedService} from '@services/feed.service';

@Component({
  selector: 'thread-view',
  imports: [
    PostCardDetailComponent,
    IsFeedDefsNotFoundPostPipe,
    IsFeedDefsBlockedPostPipe,
    PostCardComponent,
    NgTemplateOutlet,
    DividerComponent,
    SpinnerComponent
  ],
  templateUrl: './thread-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreadViewComponent implements OnInit {
  uri = input.required<string>();
  post = signal<AppBskyFeedDefs.PostView>(undefined);
  parents = signal<WritableSignal<AppBskyFeedDefs.PostView>[]>([]);
  replies = signal<GroupedPost[]>([]);

  loadReady = signal(false);
  mainCard = viewChild('mainCard', {read: ElementRef});
  scroll = viewChild('scroll', {read: ElementRef});

  constructor(
    private postService: PostService,
    private feedService: FeedService,
    protected dialogService: DialogService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    from(agent.getPostThread({
      uri: this.uri(),
      depth: 3
    })).subscribe({
      next: response => {
        if (AppBskyFeedDefs.isThreadViewPost(response.data.thread)) {
          const thread = response.data.thread as AppBskyFeedDefs.ThreadViewPost;

          //Set main post
          this.post = this.postService.setPost(response.data.thread.post);

          //Set parents
          if (thread.parent && AppBskyFeedDefs.isThreadViewPost(thread.parent)) {
            const parents: WritableSignal<AppBskyFeedDefs.PostView>[] = [];
            let parent: $Typed<AppBskyFeedDefs.ThreadViewPost> | $Typed<AppBskyFeedDefs.NotFoundPost> | $Typed<AppBskyFeedDefs.BlockedPost> = thread.parent as $Typed<AppBskyFeedDefs.ThreadViewPost>;
            parents.unshift(this.postService.setPost(parent.post));

            while (AppBskyFeedDefs.isThreadViewPost(parent.parent)) {
              parent = parent.parent;
              parents.unshift(this.postService.setPost(parent.post));
            }
            this.parents.set(parents);
          }

          //Set grouped replies
          if (thread.replies) {
            const replies = thread.replies
              .filter(reply => AppBskyFeedDefs.isThreadViewPost(reply))
              .sort((a, b) => new Date((a.post.record as any)?.createdAt).getTime() - new Date((b.post.record as any)?.createdAt).getTime());

            replies.forEach(reply => {
              if (AppBskyFeedDefs.isThreadViewPost(reply)) {
                const group = new GroupedPost();
                group.thread.push(this.feedService.parseFeedViewPost({
                  $type: 'app.bsky.feed.defs#feedViewPost',
                  post: reply.post
                }));

                if (reply.replies) {
                  const firstDeep = reply.replies
                    .filter(reply => AppBskyFeedDefs.isThreadViewPost(reply))
                    .sort((a, b) => b.post.likeCount - a.post.likeCount);

                  if (firstDeep[0]) {
                    group.thread.push(this.feedService.parseFeedViewPost({
                      $type: 'app.bsky.feed.defs#feedViewPost',
                      post: firstDeep[0].post
                    }));

                    if (firstDeep[0].replies) {
                      const secondDeep = firstDeep[0].replies
                        .filter(reply => AppBskyFeedDefs.isThreadViewPost(reply))
                        .sort((a, b) => b.post.likeCount - a.post.likeCount);

                      if (secondDeep[0]) {
                        group.thread.push(this.feedService.parseFeedViewPost({
                          $type: 'app.bsky.feed.defs#feedViewPost',
                          post: secondDeep[0].post
                        }));
                      }
                    }
                  }
                }

                this.replies.update(replies => {
                  replies.push(group);
                  return replies;
                })
              }
            });
          }

          this.loadReady.set(true);
          this.cdRef.markForCheck();

          if (thread.parent) {
            setTimeout(() => {
              this.scroll().nativeElement.scrollTo({
                top: this.mainCard().nativeElement.offsetTop,
                behavior: 'smooth'
              });
            }, 50);
          }
        }
      }, error: err => this.messageService.error(err.message)
    });
  }
}
