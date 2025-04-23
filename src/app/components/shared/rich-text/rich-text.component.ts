import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {Facet, RichText, RichTextSegment} from "@atproto/api";
import {agent} from '@core/bsky.api';
import {DialogService} from '@services/dialog.service';

@Component({
  selector: 'rich-text',
  templateUrl: './rich-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RichTextComponent implements OnInit {
  @Input() text: string;
  @Input() facets: Facet[];
  @Output() onMentionClick: EventEmitter<any>
  @Output() onTagClick: EventEmitter<any>
  segments: RichTextSegment[] = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    const rt = new RichText(
      {
        text: this.text,
        facets: this.facets
      }
    );

    if (!this.facets) {
      rt.detectFacets(agent).then(() => {
        this.segments = [...rt.segments()];
        this.cdRef.markForCheck();
      });
    } else {
      this.segments = [...rt.segments()];
    }
  }

  openAuthor(event: MouseEvent, segment: RichTextSegment) {
    event.preventDefault();
    event.stopPropagation();

    this.dialogService.openAuthor({did: segment.mention?.did, handle: segment.text.replace("@", "")});
  }

  openSearch(event: MouseEvent, segment: RichTextSegment) {
    event.preventDefault();
    event.stopPropagation();

    this.dialogService.openSearch(segment.text);
  }
}
