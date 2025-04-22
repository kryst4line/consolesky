import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  model,
  OnDestroy,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import {debounceTime, from, Subject} from 'rxjs';
import {agent} from '@core/bsky.api';
import {MessageService} from '@services/message.service';
import {AppBskyActorDefs, AppBskyFeedDefs} from '@atproto/api';
import {DialogService} from '@services/dialog.service';
import {FormsModule} from '@angular/forms';
import {CdkConnectedOverlay} from '@angular/cdk/overlay';

@Component({
  selector: 'search-view',
  imports: [
    FormsModule,
    CdkConnectedOverlay
  ],
  templateUrl: './search-view.component.html',
  styles: `
    :host ::ng-deep author-feed > div {
      scrollbar-gutter: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchViewComponent implements OnInit, OnDestroy {
  query = model<string>();
  searchType = signal<
    | 'top'
    | 'latest'
    | 'user'
    | 'generator'
  >('top');
  cursor = signal<string>(undefined);
  users = signal<AppBskyActorDefs.ProfileView[]>([]);
  feeds = signal<AppBskyFeedDefs.GeneratorView[]>([]);

  search = viewChild('search', {read: ElementRef});
  selector = viewChild('selector', {read: ElementRef});
  scroll = viewChild('scroll', {read: ElementRef});
  userTemplate = viewChild('userTemplate');
  generatorTemplate = viewChild('generatorTemplate');
  suggestionTemplate = viewChild('suggestionTemplate', {read: ElementRef});

  userSuggestions: AppBskyActorDefs.ProfileViewBasic[];
  userSubject = new Subject<string>();

  constructor(
    private messageService: MessageService,
    protected dialogService: DialogService,
    private cdRef: ChangeDetectorRef
  ) {
    effect(() => {
      if (this.userTemplate() && this.query()) {
        this.initUsers();
      }
      if (this.generatorTemplate() && this.query()) {
        this.initFeeds();
      }
    });
  }

  ngOnInit() {
    this.search().nativeElement.focus();

    this.userSubject.pipe(debounceTime(200)).subscribe(query => {
      this.searchSuggestions(query);
    });
  }

  ngOnDestroy() {
    this.userSubject.complete();
  }

  initUsers() {
    if (!this.query()) return;

    this.users.set([]);
    agent.searchActors({
      q: this.query(),
      limit: 15
    }).then(response => {
      this.users.set(response.data.actors);
      this.cursor.set(response.data.cursor);
      this.cdRef.markForCheck();
    });
  }

  nextUsers() {
    agent.searchActors({
      q: this.query(),
      limit: 15,
      cursor: this.cursor()
    }).then(response => {
      this.users.update(users => {
        users = [...users, ...response.data.actors];
        return users;
      });
      this.cursor.set(response.data.cursor);
      this.cdRef.markForCheck();
    });
  }

  initFeeds() {
    if (!this.query()) return;

    this.feeds.set([]);
    agent.app.bsky.unspecced.getPopularFeedGenerators({
      query: this.query(),
      limit: 15
    }).then(response => {
      this.feeds.set(response.data.feeds);
      this.cursor.set(response.data.cursor);
      this.cdRef.markForCheck();
    });
  }

  nextFeeds() {
    agent.app.bsky.unspecced.getPopularFeedGenerators({
      query: this.query(),
      limit: 15,
      cursor: this.cursor()
    }).then(response => {
      this.feeds.update(feeds => {
        feeds = [...feeds, ...response.data.feeds];
        return feeds;
      });
      this.cursor.set(response.data.cursor);
      this.cdRef.markForCheck();
    });
  }

  triggerSuggestion(event: KeyboardEvent, query: string) {
    if (!/^[a-z0-9]$/i.test(event.key) && event.key !== 'Backspace') return;

    this.userSubject.next(query);
  }

  searchSuggestions(query: string) {
    if (!query?.length) {
      this.userSuggestions = undefined;
      this.cdRef.markForCheck();
      return;
    }

    from(agent.searchActorsTypeahead({q: query, limit: 5})).subscribe({
      next: response => {
        if (!response.data.actors.length) {
          this.userSuggestions = undefined;
        } else {
          this.userSuggestions = response.data.actors;
        }
      }
    }).add(() => {

      this.cdRef.markForCheck();
    });
  }

  focusNext(index: number) {
    if (!this.suggestionTemplate()) return;

    if (index == -1 || index == this.suggestionTemplate().nativeElement.children.length - 1) {
      this.suggestionTemplate().nativeElement.children[0].firstChild.focus();
    } else {
      this.suggestionTemplate().nativeElement.children[index + 1].firstChild.focus();
    }
  }

  focusPrev(index: number) {
    if (!this.suggestionTemplate()) return;

    if (index == 0) {
      this.suggestionTemplate().nativeElement.children[this.suggestionTemplate().nativeElement.children.length - 1].firstChild.focus();
    } else {
      this.suggestionTemplate().nativeElement.children[index - 1].firstChild.focus();
    }
  }
}
