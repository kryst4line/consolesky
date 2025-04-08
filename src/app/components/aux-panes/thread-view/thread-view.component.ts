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

@Component({
  selector: 'thread-view',
  imports: [
    PostCardDetailComponent,
    IsFeedDefsNotFoundPostPipe,
    IsFeedDefsBlockedPostPipe,
    PostCardComponent,
    NgTemplateOutlet,
    DividerComponent
  ],
  templateUrl: './thread-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreadViewComponent implements OnInit {
  uri = input.required<string>();
  post = signal<AppBskyFeedDefs.PostView>(undefined);
  parents = signal<WritableSignal<AppBskyFeedDefs.PostView>[]>([]);

  loadReady = signal(false);
  mainCard = viewChild('mainCard', {read: ElementRef});
  scroll = viewChild('scroll', {read: ElementRef});

  constructor(
    private postService: PostService,
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
