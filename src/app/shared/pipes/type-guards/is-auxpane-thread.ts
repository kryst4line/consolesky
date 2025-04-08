import {Pipe, PipeTransform} from '@angular/core';
import {AuxPaneType, ThreadAuxPane} from '@models/aux-pane';

@Pipe({
  name: 'isAuxPaneThread'
})
export class IsAuxPaneThreadPipe implements PipeTransform {
  transform(value: unknown): value is ThreadAuxPane {
    const typedValue = value as ThreadAuxPane;
    return typedValue && typedValue.type && typedValue.type == AuxPaneType.THREAD;
  }
}
