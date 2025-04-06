import {Pipe, PipeTransform} from '@angular/core';
import {EmbedType, RecordEmbed} from "@models/embed";

@Pipe({
  name: 'isRecordEmbed'
})
export class IsRecordEmbedPipe implements PipeTransform {
  transform(value: unknown): value is RecordEmbed {
    return (value as RecordEmbed)?.type == EmbedType.RECORD;
  }
}
