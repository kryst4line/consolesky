import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';

@Component({
  selector: 'spinner',
  imports: [],
  template: `
    <div
      class="flex h-[1em] w-[1em] items-center justify-center"
    >
      <span
        class="-translate-y-[0.1em] font-bold"
      >{{chars[index]}}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent implements OnDestroy {
  chars = ['|', '/', '–', '\\'];
  index = 0;
  loop = setInterval(() => {
    this.index = this.index == 3 ? 0 : this.index + 1;
    this.cdRef.markForCheck();
  }, 250);

  constructor(
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    clearInterval(this.loop);
  }
}
