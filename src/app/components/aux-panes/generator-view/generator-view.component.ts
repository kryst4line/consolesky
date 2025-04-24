import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild
} from '@angular/core';
import {AppBskyFeedDefs} from '@atproto/api';
import {AvatarComponent} from '@components/shared/avatar/avatar.component';
import {RichTextComponent} from '@components/shared/rich-text/rich-text.component';
import {ScrollDirective} from '@shared/directives/scroll.directive';
import {DialogService} from '@services/dialog.service';
import {GeneratorFeedComponent} from '@components/feeds/generator-feed/generator-feed.component';
import {DividerComponent} from '@components/shared/divider/divider.component';

@Component({
  selector: 'generator-view',
  imports: [
    AvatarComponent,
    RichTextComponent,
    ScrollDirective,
    GeneratorFeedComponent,
    DividerComponent
  ],
  templateUrl: './generator-view.component.html',
  styles: `
    :host ::ng-deep generator-feed > div {
      scrollbar-gutter: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneratorViewComponent {
  generator = input.required<AppBskyFeedDefs.GeneratorView>();
  filter = signal<
    | 'posts_with_replies'
    | 'posts_no_replies'
    | 'posts_with_media'>('posts_no_replies');

  selector = viewChild('selector', {read: ElementRef});
  scroll = viewChild('scroll', {read: ElementRef});

  constructor(
    protected dialogService: DialogService,
  ) {}
}
