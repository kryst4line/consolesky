import {ChangeDetectionStrategy, Component} from '@angular/core';
import {PostService} from '@services/post.service';

@Component({
  selector: 'sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  constructor(
    protected postService: PostService
  ) {}

}
