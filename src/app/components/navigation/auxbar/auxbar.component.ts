import {ChangeDetectionStrategy, ChangeDetectorRef, Component, signal} from '@angular/core';
import {from} from 'rxjs';
import {agent} from '@core/bsky.api';
import {AuthService} from '@core/auth/auth.service';
import type * as AppBskyUnspeccedDefs from '@atproto/api/src/client/types/app/bsky/unspecced/defs';
import {LoggerComponent} from '@components/shared/logger/logger.component';
import {DialogService} from '@services/dialog.service';
import {IsAuxPaneThreadPipe} from '@shared/pipes/type-guards/is-auxpane-thread';
import {ThreadViewComponent} from '@components/aux-panes/thread-view/thread-view.component';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import {MessageService} from '@services/message.service';

@Component({
  selector: 'auxbar',
  imports: [
    LoggerComponent,
    IsAuxPaneThreadPipe,
    ThreadViewComponent,
    NgTemplateOutlet,
    NgClass
  ],
  templateUrl: './auxbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuxbarComponent {
  topics = signal<AppBskyUnspeccedDefs.TrendingTopic[]>([]);

  constructor(
    protected dialogService: DialogService,
    private messageService: MessageService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
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

  closePane() {
    this.dialogService.auxPanes.update(panes => {
      panes.pop();
      return panes;
    });
  }
}
