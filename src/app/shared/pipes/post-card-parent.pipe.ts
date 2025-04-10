import {Pipe, PipeTransform} from '@angular/core';
import {GroupedPost} from '@models/grouped-post';

@Pipe({
  name: 'postCardParentPipe'
})
export class PostCardParentPipe implements PipeTransform {
  transform(group: GroupedPost, index: number): boolean {
    if (group.thread.length < 2) return false;
    if (index == group.thread.length-1) return false;

    return true;
  }
}
