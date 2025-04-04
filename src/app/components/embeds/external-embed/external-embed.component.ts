import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
  viewChildren
} from '@angular/core';
import {AppBskyEmbedExternal} from "@atproto/api";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import {NgOptimizedImage} from "@angular/common";
import {BlueskyGifSnippet, IframeSnippet, LinkSnippet, SnippetSource, SnippetType} from '@models/snippet';
import {SnippetUtils} from '@shared/utils/snippet-utils';
import {YouTubePlayer} from '@angular/youtube-player';

type Options = typeof videojs.options;

@Component({
  selector: 'external-embed',
  imports: [
    YouTubePlayer,
    NgOptimizedImage
  ],
  templateUrl: './external-embed.component.html',
  styles: `
    :host(::ng-deep youtube-player) {
      display: flex;
    }
    :host(::ng-deep youtube-player) youtube-player-placeholder {
      width: 100% !important;
      height: unset !important;
    }
    :host(::ng-deep youtube-player) > div {
      width: 100%;
    }
    :host(::ng-deep youtube-player) > div iframe {
      height: unset;
      width: 100%;
      aspect-ratio: 16 / 9;
    }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalEmbedComponent implements OnInit, OnDestroy, AfterViewInit {
  external = input<AppBskyEmbedExternal.ViewExternal>();
  target = viewChildren<ElementRef<HTMLVideoElement>>('target');

  player: Player;
  options: Options;
  snippet: LinkSnippet | BlueskyGifSnippet | IframeSnippet;
  safeURL: SafeResourceUrl;

  protected readonly LinkSnippetType = SnippetType.LINK;
  protected readonly BlueskyGifSnippetType = SnippetType.BLUESKY_GIF;
  protected readonly IframeSnippetType = SnippetType.IFRAME;
  protected readonly YoutubeSnippetSource = SnippetSource.YOUTUBE;

  constructor(
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.snippet = SnippetUtils.detectSnippet(this.external());

    if (this.snippet.type === SnippetType.IFRAME) {
      this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.snippet.url);
    }
  }

  ngAfterViewInit() {
    if (this.snippet.type === SnippetType.BLUESKY_GIF) {
      this.options = {
        fluid: true,
        aspectRatio: this.snippet.ratio,
        autoplay: true,
        loop: true,
        sources: {
          src: this.snippet.url,
          type: 'video/webm'
        },
        controls: true,
        muted: true,
        playsinline: true,
        preload: 'none',
        bigPlayButton: true,
        controlBar: false,
      };

      this.player = videojs(this.target()[0].nativeElement, this.options);
    }
  }

  ngOnDestroy() {
    this.player?.dispose();
  }

}
