import {Pipe, PipeTransform} from '@angular/core';
import {GroupedPost} from '@models/grouped-post';

@Pipe({
  name: 'postCardParentPipe'
})
export class PostCardParentPipe implements PipeTransform {
  transform(group: GroupedPost, index: number): boolean {
    if (group.thread.length < 2) return false;
    if (index == group.thread.length-1) return false;
    if (group.thread.length > 2 &&
      index == 0 &&
      group.thread[0].post().uri == (group.thread[1].post().record as any)?.reply?.parent?.uri
    ) return false;

    return true;
  }
}
