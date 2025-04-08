import {Injectable} from '@angular/core';
import {Dialog} from '@angular/cdk/dialog';
import {GalleryComponent} from '@components/dialogs/gallery/gallery.component';
import {AppBskyEmbedImages} from '@atproto/api';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: Dialog
  ) {}

  openImage(images: AppBskyEmbedImages.ViewImage[], index: number) {
    const dialogRef = this.dialog.open(GalleryComponent, {
      data: {images: images, index: index},
      hasBackdrop: true
    });
  }
}
