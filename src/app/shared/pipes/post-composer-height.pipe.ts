import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'postComposerHeight',
  pure: false
})
export class PostComposerHeightPipe implements PipeTransform {
  transform(textElement: HTMLDivElement): boolean {
    return textElement.offsetHeight > parseFloat(window.getComputedStyle(textElement).fontSize) * 7;
  }
}
