import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SidebarComponent} from '@components/navigation/sidebar/sidebar.component';
import {DeckComponent} from '@components/navigation/deck/deck.component';
import {PostComposerComponent} from '@components/navigation/post-composer/post-composer.component';
import {PostService} from '@services/post.service';
import {AuxbarComponent} from '@components/navigation/auxbar/auxbar.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarComponent,
    DeckComponent,
    PostComposerComponent,
    AuxbarComponent
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  constructor(
    protected postService: PostService
  ) {}
}
