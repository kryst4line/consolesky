import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {AppBskyEmbedImages} from '@atproto/api';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'images-embed',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './images-embed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagesEmbedComponent {
  images = input<AppBskyEmbedImages.ViewImage[]>();
  onClick = output<number>();

  imgClick(index: number, event: Event) {

  }
}
