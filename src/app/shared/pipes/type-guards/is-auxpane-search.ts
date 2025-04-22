import {Pipe, PipeTransform} from '@angular/core';
import {AuxPaneType, SearchAuxPane} from '@models/aux-pane';

@Pipe({
  name: 'isAuxPaneSearch'
})
export class IsAuxPaneSearchPipe implements PipeTransform {
  transform(value: unknown): value is SearchAuxPane {
    const typedValue = value as SearchAuxPane;
    return typedValue && typedValue.type && typedValue.type == AuxPaneType.SEARCH;
  }
}
