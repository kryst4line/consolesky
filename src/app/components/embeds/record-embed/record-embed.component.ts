import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {
  $Typed,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyFeedDefs,
  AppBskyGraphDefs,
  AppBskyLabelerDefs
} from '@atproto/api';
import {DisplayNamePipe} from '@shared/pipes/display-name.pipe';
import {IsEmbedRecordViewRecordPipe} from '@shared/pipes/type-guards/is-embed-record-viewrecord.pipe';
import {NgTemplateOutlet} from '@angular/common';
import {IsFeedPostRecordPipe} from '@shared/pipes/type-guards/is-feed-post-record';
import {RichTextComponent} from '@components/shared/rich-text/rich-text.component';
import {IsEmbedImagesViewPipe} from '@shared/pipes/type-guards/is-embed-images-view.pipe';
import {ImagesEmbedComponent} from '@components/embeds/images-embed/images-embed.component';
import {IsEmbedVideoViewPipe} from '@shared/pipes/type-guards/is-embed-video-view.pipe';
import {VideoEmbedComponent} from '@components/embeds/video-embed/video-embed.component';
import {IsEmbedRecordWithMediaViewPipe} from '@shared/pipes/type-guards/is-embed-recordwithmedia-view.pipe';
import {IsEmbedRecordViewBlockedPipe} from '@shared/pipes/type-guards/is-embed-record-viewblocked.pipe';
import {IsEmbedRecordViewNotFoundPipe} from '@shared/pipes/type-guards/is-embed-record-viewnotfound.pipe';
import {IsEmbedRecordViewDetachedPipe} from '@shared/pipes/type-guards/is-embed-record-viewdetached.pipe';
import {IsFeedDefsGeneratorViewPipe} from '@shared/pipes/type-guards/is-feed-defs-generator-view';
import {IsGraphDefsListViewPipe} from '@shared/pipes/type-guards/is-graph-defs-list-view';
import {IsLabelerDefsLabelerViewPipe} from '@shared/pipes/type-guards/is-labeler-defs-labeler-view';
import {IsGraphDefsStarterPackViewBasicPipe} from '@shared/pipes/type-guards/is-graph-defs-starterpack-viewbasic';
import {IsEmbedExternalViewPipe} from '@shared/pipes/type-guards/is-embed-external-view.pipe';
import {ExternalEmbedComponent} from '@components/embeds/external-embed/external-embed.component';

@Component({
  selector: 'record-embed',
  imports: [
    DisplayNamePipe,
    IsEmbedRecordViewRecordPipe,
    NgTemplateOutlet,
    IsFeedPostRecordPipe,
    RichTextComponent,
    IsEmbedImagesViewPipe,
    ImagesEmbedComponent,
    IsEmbedVideoViewPipe,
    VideoEmbedComponent,
    IsEmbedRecordWithMediaViewPipe,
    IsEmbedRecordViewBlockedPipe,
    IsEmbedRecordViewNotFoundPipe,
    IsEmbedRecordViewDetachedPipe,
    IsFeedDefsGeneratorViewPipe,
    IsGraphDefsListViewPipe,
    IsLabelerDefsLabelerViewPipe,
    IsGraphDefsStarterPackViewBasicPipe,
    IsEmbedExternalViewPipe,
    ExternalEmbedComponent
  ],
  templateUrl: './record-embed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordEmbedComponent {
  record = input<
    | $Typed<AppBskyEmbedRecord.ViewRecord>
    | $Typed<AppBskyEmbedRecord.ViewNotFound>
    | $Typed<AppBskyEmbedRecord.ViewBlocked>
    | $Typed<AppBskyEmbedRecord.ViewDetached>
    | $Typed<AppBskyFeedDefs.GeneratorView>
    | $Typed<AppBskyGraphDefs.ListView>
    | $Typed<AppBskyLabelerDefs.LabelerView>
    | $Typed<AppBskyGraphDefs.StarterPackViewBasic>
    | { $type: string }
  >();
  protected readonly AppBskyFeedDefs = AppBskyFeedDefs;
  protected readonly AppBskyGraphDefs = AppBskyGraphDefs;

  onClick = output();
  onImgClick = output<{images: AppBskyEmbedImages.ViewImage[], index: number}>();

  recordClick(event: Event) {
    event.stopPropagation();
    this.onClick.emit();
  }
}
