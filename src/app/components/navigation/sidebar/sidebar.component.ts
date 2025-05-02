import {ChangeDetectionStrategy, Component} from '@angular/core';
import {PostService} from '@services/post.service';
import {DialogService} from '@services/dialog.service';
import {ColumnService} from '@services/column.service';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  constructor(
    protected postService: PostService,
    protected dialogService: DialogService,
    protected columnService: ColumnService
  ) {}
}
