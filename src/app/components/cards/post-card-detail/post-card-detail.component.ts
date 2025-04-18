import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  input,
  model,
  OnDestroy,
  OnInit
} from '@angular/core';
import {AppBskyEmbedImages, AppBskyFeedDefs} from '@atproto/api';
import {AvatarComponent} from '@components/shared/avatar/avatar.component';
import {DisplayNamePipe} from '@shared/pipes/display-name.pipe';
import {IsFeedPostRecordPipe} from '@shared/pipes/type-guards/is-feed-post-record';
import {RichTextComponent} from '@components/shared/rich-text/rich-text.component';
import {DatePipe, NgClass, NgTemplateOutlet} from '@angular/common';
import {IsEmbedRecordViewPipe} from '@shared/pipes/type-guards/is-embed-record-view.pipe';
import {RecordEmbedComponent} from '@components/embeds/record-embed/record-embed.component';
import {IsEmbedImagesViewPipe} from '@shared/pipes/type-guards/is-embed-images-view.pipe';
import {ImagesEmbedComponent} from '@components/embeds/images-embed/images-embed.component';
import {LinkExtractorPipe} from '@shared/pipes/link-extractor.pipe';
import {IsEmbedVideoViewPipe} from '@shared/pipes/type-guards/is-embed-video-view.pipe';
import {VideoEmbedComponent} from '@components/embeds/video-embed/video-embed.component';
import {IsEmbedRecordWithMediaViewPipe} from '@shared/pipes/type-guards/is-embed-recordwithmedia-view.pipe';
import {NumberFormatterPipe} from '@shared/pipes/number-formatter.pipe';
import {PostService} from '@services/post.service';
import {OverlayModule} from '@angular/cdk/overlay';
import {ExternalEmbedComponent} from '@components/embeds/external-embed/external-embed.component';
import {IsEmbedExternalViewPipe} from '@shared/pipes/type-guards/is-embed-external-view.pipe';
import {MessageService} from '@services/message.service';
import {DialogService} from '@services/dialog.service';

@Component({
  selector: 'post-card-detail',
  imports: [
    AvatarComponent,
    DisplayNamePipe,
    IsFeedPostRecordPipe,
    RichTextComponent,
    NgTemplateOutlet,
    IsEmbedRecordViewPipe,
    RecordEmbedComponent,
    IsEmbedImagesViewPipe,
    ImagesEmbedComponent,
    LinkExtractorPipe,
    IsEmbedVideoViewPipe,
    VideoEmbedComponent,
    IsEmbedRecordWithMediaViewPipe,
    NumberFormatterPipe,
    OverlayModule,
    NgClass,
    ExternalEmbedComponent,
    IsEmbedExternalViewPipe,
    DatePipe
  ],
  templateUrl: './post-card-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DatePipe
  ]
})
export class PostCardDetailComponent implements OnInit, OnDestroy {
  post = model<AppBskyFeedDefs.PostView>();
  reply = input<AppBskyFeedDefs.ReplyRef>();
  reason = input<AppBskyFeedDefs.ReasonRepost | AppBskyFeedDefs.ReasonPin | { [k: string]: unknown; $type: string; }>();
  hideButtons = input(false, {transform: booleanAttribute});

  refreshInterval: ReturnType<typeof setInterval>;
  processingAction = false;
  rtMenuVisible = false;
  moreMenuVisible = false;

  constructor(
    private postService: PostService,
    private messageService: MessageService,
    protected dialogService: DialogService,
    private cdRef: ChangeDetectorRef
  ) {
    effect(() => {
      if (this.post()) cdRef.markForCheck()
    })
  }

  ngOnInit() {
    this.refreshInterval = setInterval(() => this.cdRef.markForCheck(), 5e3);
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
  }

  replyAction(event: Event) {
    event.stopPropagation();
    this.postService.replyPost(this.post().uri);
  }

  likeAction(event: Event) {
    event.stopPropagation();
    if (this.processingAction) return;
    this.processingAction = true;
    let promise: Promise<void>;

    if (this.post().viewer.like) {
      promise = this.postService.deleteLike(this.post);
    } else {
      promise = this.postService.like(this.post);
    }

    promise
      .then(() => {
        this.cdRef.markForCheck();
      })
      .catch(err => this.messageService.error(err.message))
      .finally(() => this.processingAction = false);
  }

  repostAction(event: Event) {
    event.stopPropagation();
    if (this.processingAction) return;
    this.rtMenuVisible = false;
    this.processingAction = true;
    let promise: Promise<void>;

    if (this.post().viewer.repost) {
      promise = this.postService.deleteRepost(this.post);
    } else {
      promise = this.postService.repost(this.post);
    }

    promise
      .then(() => {
        this.cdRef.markForCheck();
      })
      .catch(err => this.messageService.error(err.message))
      .finally(() => this.processingAction = false);
  }

  refreshRepostAction(event: Event) {
    event.stopPropagation();
    if (this.processingAction) return;
    this.rtMenuVisible = false;
    this.processingAction = true;

    this.postService.refreshRepost(this.post)
      .then(() => {
        this.cdRef.markForCheck();
      })
      .catch(err => this.messageService.error(err.message))
      .finally(() => this.processingAction = false);
  }

  quotePost() {
    this.postService.quotePost(this.post().uri);
    this.rtMenuVisible = false;
  }

  openImage(images: AppBskyEmbedImages.ViewImage[], index: number) {
    this.dialogService.openImage(images, index);
  }
}
