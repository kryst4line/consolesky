import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'divider',
  template: `
    <div
      class="border-b border-b-primary/25 w-9/10"
      style="mask-image: linear-gradient(to right, transparent, #000000 50%, transparent);"
    ></div>
  `,
  styles: `
    :host {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividerComponent {}
