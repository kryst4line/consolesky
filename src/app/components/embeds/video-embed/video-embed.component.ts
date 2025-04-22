import {ChangeDetectionStrategy, Component, ElementRef, input, OnDestroy, OnInit, viewChild} from '@angular/core';
import {AppBskyEmbedVideo} from "@atproto/api";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";

type Options = typeof videojs.options;

@Component({
  selector: 'video-embed',
  templateUrl: './video-embed.component.html',
  styles:
    `
      ::ng-deep .video-js .vjs-control-bar {
        background: linear-gradient(to top, rgba(43, 51, 63, 0.7), transparent);
      }

      ::ng-deep .video-js > .vjs-remaining-time {
        height: 0;
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 0.75rem;
        font-family: 'Inter', sans-serif;
        opacity: 0;
      }

      ::ng-deep .video-js.vjs-user-inactive .vjs-remaining-time {
        height: 2rem;
        opacity: 1;
        transition: 1.5s opacity ease;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoEmbedComponent implements OnInit, OnDestroy {
  embed = input<AppBskyEmbedVideo.View>();
  target = viewChild('target', {read: ElementRef});

  player: Player;
  options: Options;
  interacted = false;

  ngOnInit() {
    this.options = {
      fluid: true,
      aspectRatio: this.embed().aspectRatio ? `${this.embed().aspectRatio.width}:${this.embed().aspectRatio.height}` : '16:9',
      autoplay: true,
      sources: {
        src: this.embed().playlist,
        type: 'application/x-mpegURL'
      },
      playsinline: true,
      preload: 'auto',
      loop: true,
      inactivityTimeout: 1000,
      userActions: {
        click: () => {
          if (this.interacted) {
            this.player.paused() ? this.player.play() : this.player.pause();
          } else {
            this.player.loop(false);
            this.player.muted(false);
            this.interacted = true;
          }
        }
      }
    };

    this.player = videojs(this.target().nativeElement, this.options);
    this.player.addChild('RemainingTimeDisplay', {});
  }

  ngOnDestroy() {
    this.player?.dispose();
  }
}
