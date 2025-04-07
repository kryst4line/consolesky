import {ChangeDetectionStrategy, ChangeDetectorRef, Component, signal} from '@angular/core';
import {PostService} from '@services/post.service';
import {from} from 'rxjs';
import {agent} from '@core/bsky.api';
import {AuthService} from '@core/auth/auth.service';
import type * as AppBskyUnspeccedDefs from '@atproto/api/src/client/types/app/bsky/unspecced/defs';
import {LoggerComponent} from '@components/shared/logger/logger.component';

@Component({
  selector: 'auxbar',
  imports: [
    LoggerComponent
  ],
  templateUrl: './auxbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuxbarComponent {
  topics = signal<AppBskyUnspeccedDefs.TrendingTopic[]>([]);

  constructor(
    protected postService: PostService,
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
      }
    })
  }
}
