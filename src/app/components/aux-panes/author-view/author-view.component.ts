import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  input,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import {from} from 'rxjs';
import {agent} from '@core/bsky.api';
import {MessageService} from '@services/message.service';
import {AppBskyActorDefs} from '@atproto/api';
import {NgClass} from '@angular/common';
import {SpinnerComponent} from '@components/shared/spinner/spinner.component';
import {AvatarComponent} from '@components/shared/avatar/avatar.component';
import {DisplayNamePipe} from '@shared/pipes/display-name.pipe';
import {RichTextComponent} from '@components/shared/rich-text/rich-text.component';
import {AuthorFeedComponent} from '@components/feeds/author-feed/author-feed.component';
import {ScrollDirective} from '@shared/directives/scroll.directive';
import {DialogService} from '@services/dialog.service';
import {ButtonFollowComponent} from '@components/shared/button-follow/button-follow.component';

@Component({
  selector: 'author-view',
  imports: [
    SpinnerComponent,
    AvatarComponent,
    DisplayNamePipe,
    RichTextComponent,
    NgClass,
    AuthorFeedComponent,
    ScrollDirective,
    ButtonFollowComponent
  ],
  templateUrl: './author-view.component.html',
  styles: `
    :host ::ng-deep author-feed > div {
      scrollbar-gutter: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorViewComponent implements OnInit {
  did = input.required<string>();
  author = signal<AppBskyActorDefs.ProfileViewDetailed>(undefined);
  filter = signal<
    | 'posts_with_replies'
    | 'posts_no_replies'
    | 'posts_with_media'>('posts_no_replies');
  expandBio = signal(false);

  selector = viewChild('selector', {read: ElementRef});
  scroll = viewChild('scroll', {read: ElementRef});

  constructor(
    private messageService: MessageService,
    protected dialogService: DialogService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    from(agent.getProfile({
      actor: this.did()
    })).subscribe({
      next: response => {
        this.author.set(response.data);
        this.cdRef.markForCheck();
      }, error: err => this.messageService.error(err.message)
    });
  }

  setFilter(filter: 'posts_with_replies' | 'posts_no_replies' | 'posts_with_media') {
    this.scroll().nativeElement.scrollTo({
      top: this.selector().nativeElement.offsetTop
    });
    this.filter.set(filter);
  }
}
