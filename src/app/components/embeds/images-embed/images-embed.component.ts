import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {AppBskyEmbedImages} from '@atproto/api';
import {NgOptimizedImage} from '@angular/common';
import {DialogService} from '@services/dialog.service';

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

  constructor(
    private dialogService: DialogService
  ) {}

  imgClick(index: number, event: Event) {
    event.stopPropagation();
    this.dialogService.openImage(this.images(), index);
  }
}
