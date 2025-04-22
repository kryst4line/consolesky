import {Injectable, signal} from '@angular/core';
import {Dialog} from '@angular/cdk/dialog';
import {GalleryComponent} from '@components/dialogs/gallery/gallery.component';
import {AppBskyEmbedImages, AppBskyEmbedRecord} from '@atproto/api';
import {AuthorAuxPane, AuxPane, SearchAuxPane, ThreadAuxPane} from '@models/aux-pane';
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

  openThread(uri: string) {
    // Cancel action if user is selecting text
    if (window.getSelection().toString().length) return;
    // Bring pane to front if thread is already open
    const pane = this.auxPanes().find(p => (p as ThreadAuxPane).uri && (p as ThreadAuxPane).uri == uri);
    if (pane) {
      this.reorderAuxPane(pane.uuid);
      return;
    }
    // Mute all video players on auxbar
    document.querySelector('auxbar').querySelectorAll('video').forEach((video: HTMLVideoElement) => {
      video.muted = true;
    });

    this.auxPanes.update(panes => {
      return [new ThreadAuxPane(uri), ...panes];
    });
  }

  openAuthor(author: Partial<{did: string, handle: string}>) {
    // Cancel action if user is selecting text
    if (window.getSelection().toString().length) return;
    // Bring pane to front if author is already open
    const pane = this.auxPanes().find(p => (p as AuthorAuxPane).did && (p as AuthorAuxPane).did == author.did);
    if (pane) {
      this.reorderAuxPane(pane.uuid);
      return;
    }
    // Mute all video players on auxbar
    document.querySelector('auxbar').querySelectorAll('video').forEach((video: HTMLVideoElement) => {
      video.muted = true;
    });

    this.auxPanes.update(panes => {
      return [new AuthorAuxPane(author), ...panes];
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

  openSearch(query?: string) {
    // Cancel action if user is selecting text
    if (window.getSelection().toString().length) return;
    // Bring pane to front if author is already open
    const pane = this.auxPanes().find(p => (p as SearchAuxPane).type == 'SEARCH');
    if (pane) {
      this.reorderAuxPane(pane.uuid);
      return;
    }

    this.auxPanes.update(panes => {
      return [new SearchAuxPane(query), ...panes];
    });
  }
}
