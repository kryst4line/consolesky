import {Injectable, signal} from '@angular/core';
import {Dialog} from '@angular/cdk/dialog';
import {GalleryComponent} from '@components/dialogs/gallery/gallery.component';
import {AppBskyEmbedImages, AppBskyEmbedRecord} from '@atproto/api';
import {AuxPane, ThreadAuxPane} from '@models/aux-pane';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  auxPanes = signal<AuxPane[]>([]);

  constructor(
    private dialog: Dialog
  ) {}

  openImage(images: AppBskyEmbedImages.ViewImage[], index: number) {
    this.dialog.open(GalleryComponent, {
      data: {images: images, index: index},
      hasBackdrop: true
    });
  }

  openThread(uri: string) {
    // Cancel action if user is selecting text
    if (window.getSelection().toString().length) return;
    // Cancel action if post is the same than the last opened thread
    if (
      this.auxPanes().length &&
      (this.auxPanes()[this.auxPanes().length-1] as ThreadAuxPane).uri &&
      (this.auxPanes()[this.auxPanes().length-1] as ThreadAuxPane).uri == uri
    ) return;
    // Mute all video players on auxbar
    document.querySelector('auxbar').querySelectorAll('video').forEach((video: HTMLVideoElement) => {
      video.muted = true;
    });

    const pane = new ThreadAuxPane();
    pane.uri = uri;
    this.auxPanes.update(panes => {
      return [...panes, pane];
    });
  }

  openRecord(record: AppBskyEmbedRecord.View) {
    switch (record.record.$type) {
      case 'app.bsky.embed.record#viewRecord':
        this.openThread((record.record as AppBskyEmbedRecord.ViewRecord).uri);
        break;
      case 'app.bsky.graph.defs#listView':
        break;
      case 'app.bsky.feed.defs#generatorView':
        break;
      case 'app.bsky.graph.defs#starterPackViewBasic':
        break;
      case 'app.bsky.labeler.defs#labelerView':
        break;
    }
  }
}
