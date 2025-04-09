import {Pipe, PipeTransform} from '@angular/core';
import {GroupedPost} from '@models/grouped-post';

@Pipe({
  name: 'postCardGrandParentPipe'
})
export class PostCardGrandParentPipe implements PipeTransform {
  transform(group: GroupedPost, index: number): boolean {
    if (group.thread.length < 3) return false;
    if (index !== 0) return false;
    if (
      group.thread[0].post().uri !== (group.thread[1].post().record as any)?.reply?.parent?.uri
    ) return true;

    return false;
  }
}
