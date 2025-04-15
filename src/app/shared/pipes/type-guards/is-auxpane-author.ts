import {Pipe, PipeTransform} from '@angular/core';
import {AuthorAuxPane, AuxPaneType} from '@models/aux-pane';

@Pipe({
  name: 'isAuxPaneAuthor'
})
export class IsAuxPaneAuthorPipe implements PipeTransform {
  transform(value: unknown): value is AuthorAuxPane {
    const typedValue = value as AuthorAuxPane;
    return typedValue && typedValue.type && typedValue.type == AuxPaneType.AUTHOR;
  }
}
