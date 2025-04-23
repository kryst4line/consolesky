import {booleanAttribute, Component, input, output} from '@angular/core';
import {IsLoggedUserPipe} from '@shared/pipes/is-logged-user.pipe';
import {AppBskyActorDefs} from '@atproto/api';

@Component({
  selector: 'button-follow',
  imports: [
    IsLoggedUserPipe
  ],
  templateUrl: './button-follow.component.html'
})
export class ButtonFollowComponent {
  author = input.required<Partial<{
    did: string,
    viewer?: AppBskyActorDefs.ViewerState
  }>>();
  compact = input(false, {transform: booleanAttribute});

  onFollow = output();
  onUnfollow = output();
}
