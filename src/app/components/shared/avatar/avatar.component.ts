import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'avatar',
  imports: [],
  templateUrl: './avatar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent {
  src = input<string>();
  alt = input<string>();
}
