import {ChangeDetectionStrategy, Component} from '@angular/core';
import {PostService} from '@services/post.service';

@Component({
  selector: 'auxbar',
  imports: [],
  templateUrl: './auxbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuxbarComponent {
  constructor(
    protected postService: PostService
  ) {}

}
