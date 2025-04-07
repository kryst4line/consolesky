import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  signal,
  WritableSignal
} from '@angular/core';
import {$Typed, AppBskyFeedDefs, AppBskyGraphDefs, RichText} from '@atproto/api';
import {ExternalEmbed, ImageEmbed, RecordEmbed, RecordEmbedType} from '@models/embed';
import {EmbedUtils} from '@shared/utils/embed-utils';
import {PostService} from '@services/post.service';
import {EmbedService} from '@services/embed.service';
import {agent} from '@core/bsky.api';
import {from} from 'rxjs';
import {SnippetType} from '@models/snippet';
import {SnippetUtils} from '@shared/utils/snippet-utils';
import {MentionModule} from 'angular-mentions';
import {PostComposerHeightPipe} from '@shared/pipes/post-composer-height.pipe';
import {DisplayNamePipe} from '@shared/pipes/display-name.pipe';
import {PostCardComponent} from '@components/cards/post-card/post-card.component';
import {IsMediaEmbedImagePipe} from '@shared/pipes/type-guards/is-media-embed-image';
import {IsMediaEmbedVideoPipe} from '@shared/pipes/type-guards/is-media-embed-video';
import {IsMediaEmbedExternalPipe} from '@shared/pipes/type-guards/is-media-embed-external';
import {NgTemplateOutlet, SlicePipe} from '@angular/common';
import {IsRecordEmbedPipe} from '@shared/pipes/type-guards/is-record-embed';
import {IsEmbedRecordViewRecordPipe} from '@shared/pipes/type-guards/is-embed-record-viewrecord.pipe';
import {RecordEmbedComponent} from '@components/embeds/record-embed/record-embed.component';
import {IsFeedDefsGeneratorViewPipe} from '@shared/pipes/type-guards/is-feed-defs-generator-view';
import {IsGraphDefsListViewPipe} from '@shared/pipes/type-guards/is-graph-defs-list-view';
import {IsGraphDefsStarterPackViewPipe} from '@shared/pipes/type-guards/is-graph-defs-starterpack-view';
import {ExternalEmbedComponent} from '@components/embeds/external-embed/external-embed.component';

@Component({
  selector: 'post-composer',
  imports: [
    MentionModule,
    PostComposerHeightPipe,
    DisplayNamePipe,
    PostCardComponent,
    IsMediaEmbedImagePipe,
    IsMediaEmbedVideoPipe,
    IsMediaEmbedExternalPipe,
    SlicePipe,
    IsRecordEmbedPipe,
    NgTemplateOutlet,
    IsEmbedRecordViewRecordPipe,
    RecordEmbedComponent,
    IsFeedDefsGeneratorViewPipe,
    IsGraphDefsListViewPipe,
    IsGraphDefsStarterPackViewPipe,
    ExternalEmbedComponent
  ],
  templateUrl: './post-composer.component.html',
  styles: `
    :host(::ng-deep mention-list) {
      transform: translateY(-1.25rem);
    }
    ::ng-deep mention-list ul {
      margin: 0 !important;
      padding: 0 !important;
      overflow: unset !important;
      border-radius: 0 !important;
      border: 1px solid var(--color-primary) !important;
    }
    ::ng-deep mention-list .mention-active a {
      background-color: var(--color-primary) !important;
      color: var(--color-bg) !important;
    }
    ::ng-deep mention-list .mention-item a {
      text-box: trim-both cap alphabetic !important;
      padding: 0.75em !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostComposerComponent {
  formattedText = '';
  rt: RichText;
  mentionItems = [];
  loading = false;
  embedSuggestions = signal<Array<RecordEmbed | ExternalEmbed>>([]);
  showDragOver = signal(false);
  showPopup = signal<'reply' | 'media' | 'record'>(undefined);

  constructor(
    protected postService: PostService,
    private embedService: EmbedService,
    private elementRef: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {}

  formatText(event: Event) {
    const text = (event.target as HTMLDivElement).innerText;
    this.postService.postCompose().post().text = text;

    this.rt = new RichText({text: text});
    this.rt.detectFacetsWithoutResolution();
    const segments = [...this.rt.segments()];

    this.embedSuggestions.set(EmbedUtils.findEmbedSuggestions(segments.filter(s => s.facet).map(s => s.text).join(' ')));

    let htmlText = '';

    segments.forEach(segment => {
      if (segment.isMention()) {
        htmlText += `<span class="text-blue-800">${segment.text}</span>`;
      } else if (segment.isTag()) {
        htmlText += `<span class="text-purple-800">${segment.text}</span>`;
      } else if (segment.isLink()) {
        htmlText += `<span class="text-red-800">${segment.text}</span>`;
      } else {
        htmlText += `<span>${segment.text.replace('<','&lt;').replace('>','&gt;')}</span>`;
      }
    });

    this.formattedText = htmlText;
    this.cdRef.markForCheck();
  }

  searchMentions(searchTerm: string) {
    from(agent.searchActorsTypeahead({q: searchTerm, limit: 5})).subscribe({
      next: response => {
        this.mentionItems = response.data.actors.map(actor => {
          return {
            id: actor.did,
            value: actor.handle
          }
        });
        this.cdRef.markForCheck();
      }
    });
  }

  removeImage(index: number) {
    const imageEmbed = this.postService.postCompose().mediaEmbed as WritableSignal<ImageEmbed>;

    if (imageEmbed().images.length == 1) {
      imageEmbed.set(undefined);
      if (this.showPopup() == 'media') this.showPopup.set(undefined);
    } else {
      imageEmbed.update(embed => {
        embed.images.splice(index, 1);
        return embed;
      });
    }
  }

  embedLink() {
    const embed = this.embedSuggestions()[0] as ExternalEmbed;
    if (!embed.url.startsWith('https://') && !embed.url.startsWith('http://')) {
      embed.url = 'https://' + embed.url;
    }

    embed.snippet = SnippetUtils.detectSnippet({uri: embed.url, description: ''});

    if (embed.snippet.type !== SnippetType.BLUESKY_GIF) {
      this.embedService.getUrlMetadata(embed.url).subscribe({
        next: metadata => {
          embed.metadata = metadata;
          this.postService.postCompose().mediaEmbed.set(embed);
          console.log(embed)
        },
        //TODO: MessageService
        error: err => console.log(err.message)
      });
    }
  }

  embedRecord() {
    const embed = this.embedSuggestions()[0] as RecordEmbed;
    switch (embed.recordType) {
      case RecordEmbedType.POST:
        this.embedQuote();
        break;
      case RecordEmbedType.FEED:
        this.embedFeed();
        break;
      case RecordEmbedType.LIST:
        this.embedList();
        break;
      case RecordEmbedType.STARTER_PACK:
        this.embedStarterPack();
        break;
    }
  }

  embedQuote() {
    const embed = this.embedSuggestions()[0] as RecordEmbed;
    agent.resolveHandle({
      handle: embed.author
    }).then(response => {
      this.postService.quotePost('at://' + response.data.did + '/app.bsky.feed.post/' + embed.rkey);
    });
  }

  embedFeed() {
    const embed = this.embedSuggestions()[0] as RecordEmbed;

    agent.resolveHandle({
      handle: embed.author
    }).then(response => agent.app.bsky.feed.getFeedGenerator({
      feed: 'at://' + response.data.did + '/app.bsky.feed.generator/' + embed.rkey
    })).then(response => {
      let feed = response.data.view;
      feed['$type'] = 'app.bsky.feed.defs#generatorView';
      this.postService.postCompose().recordEmbed.set(feed as $Typed<AppBskyFeedDefs.GeneratorView>);
    });
  }

  embedList() {
    const embed = this.embedSuggestions()[0] as RecordEmbed;

    agent.resolveHandle({
      handle: embed.author
    }).then(response => agent.app.bsky.graph.getList({
      list: 'at://' + response.data.did + '/app.bsky.graph.list/' + embed.rkey
    })).then(response => {
      let list = response.data.list;
      list['$type'] = 'app.bsky.graph.defs#listView';
      this.postService.postCompose().recordEmbed.set(list as $Typed<AppBskyGraphDefs.ListView>);
    });
  }

  embedStarterPack() {
    const embed = this.embedSuggestions()[0] as RecordEmbed;

    agent.resolveHandle({
      handle: embed.author
    }).then(response => agent.app.bsky.graph.getStarterPack({
      starterPack: 'at://' + response.data.did + '/app.bsky.graph.starterpack/' + embed.rkey
    })).then(response => {
      let starterPack = response.data.starterPack;
      starterPack['$type'] = 'app.bsky.graph.defs#starterPackView';
      this.postService.postCompose().recordEmbed.set(starterPack as $Typed<AppBskyGraphDefs.StarterPackView>);
    });
  }

  publishPost() {
    this.loading = true;

    this.postService.publishPost().then(
      () => {
        //TODO: MessageService
        // this.messageService.info('Your post has been successfully published');
      },
      //TODO: MessageService
      err => console.log(err.message)
    ).finally(() => this.loading = false);
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: Event) {
    event.preventDefault();

    if (this.elementRef.nativeElement.contains((event as any).currentTarget)) {
      this.showDragOver.set(true);
    }
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: Event) {
    event.preventDefault();

    if (!this.elementRef.nativeElement.contains((event as any).relatedTarget)) {
      this.showDragOver.set(false);
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: Event) {
    event.preventDefault();

    this.showDragOver.set(false);
    this.postService.attachMedia((event as any).dataTransfer.files);
  }
}
