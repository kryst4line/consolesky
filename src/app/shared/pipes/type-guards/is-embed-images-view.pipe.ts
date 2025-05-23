import {Pipe, PipeTransform} from '@angular/core';
import {AppBskyEmbedImages} from "@atproto/api";

@Pipe({
  name: 'isEmbedImagesView'
})
export class IsEmbedImagesViewPipe implements PipeTransform {
  transform(value: unknown): value is AppBskyEmbedImages.View {
    return AppBskyEmbedImages.isView(value);
  }
}
