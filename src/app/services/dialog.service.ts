import {Injectable, signal} from '@angular/core';
import {Dialog} from '@angular/cdk/dialog';
import {GalleryComponent} from '@components/dialogs/gallery/gallery.component';
import {AppBskyEmbedImages, AppBskyEmbedRecord} from '@atproto/api';
import {AuxPane, ThreadAuxPane} from '@models/aux-pane';
import {moveItemInArray} from '@angular/cdk/drag-drop';

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

  reorderAuxPane(uuid: string) {
    this.auxPanes.update(panes => {
      moveItemInArray(panes, panes.findIndex(p => p.uuid == uuid), 0);
      return panes;
    });
  }

  closeAuxPane() {
    this.auxPanes.update(panes => {
      panes.shift();
      return panes;
    })
  }

  closeAuxPaneChildren() {
    this.auxPanes.update(panes => {
      panes[0].children.shift();
      return panes;
    })
  }

  openThread(uri: string, children?: boolean) {
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

    if (children) {
      this.auxPanes.update(panes => {
        panes[0].children.unshift(pane);
        return panes;
      });
    } else {
      this.auxPanes.update(panes => {
        return [pane, ...panes];
      });
    }
  }

  openRecord(record: AppBskyEmbedRecord.View, children?: boolean) {
    switch (record.record.$type) {
      case 'app.bsky.embed.record#viewRecord':
        this.openThread((record.record as AppBskyEmbedRecord.ViewRecord).uri, children);
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
