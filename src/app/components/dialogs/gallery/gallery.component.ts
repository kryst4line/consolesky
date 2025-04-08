import {ChangeDetectionStrategy, Component, HostListener, inject} from '@angular/core';
import {AppBskyEmbedImages} from '@atproto/api';
import {DIALOG_DATA, DialogRef} from '@angular/cdk/dialog';

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent {
  images: AppBskyEmbedImages.ViewImage[];
  index: number;

  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  data = inject(DIALOG_DATA);

  constructor() {
    this.images = this.data.images;
    this.index = this.data.index;
  }

  @HostListener('keydown.arrowLeft', ['$event'])
  prevImage() {
    if (this.index == 0) {
      this.index = this.images.length - 1;
    } else {
      this.index = this.index - 1;
    }
  }

  @HostListener('keydown.arrowRight', ['$event'])
  nextImage() {
    if (this.index + 1 == this.images.length) {
      this.index = 0;
    } else {
      this.index = this.index + 1;
    }
  }
}
