import {Pipe, PipeTransform} from '@angular/core';
import {AuxPaneType, GeneratorAuxPane} from '@models/aux-pane';

@Pipe({
  name: 'isAuxPaneGenerator'
})
export class IsAuxPaneGeneratorPipe implements PipeTransform {
  transform(value: unknown): value is GeneratorAuxPane {
    const typedValue = value as GeneratorAuxPane;
    return typedValue && typedValue.type && typedValue.type == AuxPaneType.GENERATOR;
  }
}
