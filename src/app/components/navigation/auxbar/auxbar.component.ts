import {ChangeDetectorRef, Component, signal} from '@angular/core';
import {from} from 'rxjs';
import {agent} from '@core/bsky.api';
import {AuthService} from '@core/auth/auth.service';
import type * as AppBskyUnspeccedDefs from '@atproto/api/src/client/types/app/bsky/unspecced/defs';
import {LoggerComponent} from '@components/shared/logger/logger.component';
import {DialogService} from '@services/dialog.service';
import {IsAuxPaneThreadPipe} from '@shared/pipes/type-guards/is-auxpane-thread';
import {ThreadViewComponent} from '@components/aux-panes/thread-view/thread-view.component';
import {NgClass, NgTemplateOutlet, SlicePipe} from '@angular/common';
import {MessageService} from '@services/message.service';
import {CdkConnectedOverlay} from '@angular/cdk/overlay';
import {IsAuxPaneAuthorPipe} from '@shared/pipes/type-guards/is-auxpane-author';
import {AuthorViewComponent} from '@components/aux-panes/author-view/author-view.component';
import {IsAuxPaneSearchPipe} from '@shared/pipes/type-guards/is-auxpane-search';
import {SearchViewComponent} from '@components/aux-panes/search-view/search-view.component';
import {IsAuxPaneGeneratorPipe} from '@shared/pipes/type-guards/is-auxpane-generator';
import {GeneratorViewComponent} from '@components/aux-panes/generator-view/generator-view.component';

@Component({
  selector: 'auxbar',
  imports: [
    LoggerComponent,
    IsAuxPaneThreadPipe,
    ThreadViewComponent,
    NgTemplateOutlet,
    NgClass,
    CdkConnectedOverlay,
    SlicePipe,
    IsAuxPaneAuthorPipe,
    AuthorViewComponent,
    IsAuxPaneSearchPipe,
    SearchViewComponent,
    IsAuxPaneGeneratorPipe,
    GeneratorViewComponent,
  ],
  templateUrl: './auxbar.component.html'
})
export class AuxbarComponent {
  topics = signal<AppBskyUnspeccedDefs.TrendingTopic[]>([]);
  showDropdown = signal(false);

  constructor(
    protected dialogService: DialogService,
    private messageService: MessageService,
    private authService: AuthService,
    protected cdRef: ChangeDetectorRef
  ) {
    this.loadTopics();
  }

  loadTopics() {
    from(agent.app.bsky.unspecced.getTrendingTopics({
      viewer: this.authService.loggedUser().did,
      limit: 10
    })).subscribe({
      next: response => {
        this.topics.set(response.data.topics);
        this.cdRef.markForCheck();
      }, error: err => this.messageService.error(err.message)
    });
  }
}
