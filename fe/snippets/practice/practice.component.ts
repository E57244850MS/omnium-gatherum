import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { buffer, debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss']
})
export class PracticeComponent implements OnInit, OnChanges {
  @Input() color: string;
  @Input() size: number;
  @Input() symbol: string;
  @Input() startTime: number;
  @Output() singleClick = new EventEmitter<MouseEvent>();
  @Output() doubleClick = new EventEmitter<MouseEvent>();

  fontSize = 16;
  containerStyles = {};
  bgStyles = {};
  aniStyles = {};

  clicks$ = new Subject<MouseEvent>();

  constructor() {
    this.clicks$.pipe(
      buffer(
        this.clicks$.pipe(
          debounceTime(250),
        )
      ),
    )
    .subscribe(events => {
      if (events.length === 1) {
        this.singleClick.emit(events[0]);
      } else {
        // emit with the latest event
        this.doubleClick.emit(events[events.length - 1]);
      }
    });
  }

  ngOnInit() {
  }

  onClick(event: MouseEvent) {
    this.clicks$.next(event);
  }

  ngOnChanges(changes: SimpleChanges) {
    const rgb = this.color.match(/.{2}/g).map(c => Math.round(parseInt(c, 16))).join(',');
    this.fontSize = Math.round(this.size * .75);
    this.containerStyles = {
      // 'background-color': '#' + this.color,
      'width.px': this.size,
      'height.px': this.size,
    };
    this.bgStyles = {
      'background-color': '#' + this.color,
    };
    this.aniStyles = {
      // tslint:disable-next-line: max-line-length
      'background-image': `linear-gradient(rgba(${rgb},1), rgba(${rgb},.25)), linear-gradient(transparent, rgba(${rgb},.25)), linear-gradient(rgba(${rgb},.25), rgba(${rgb},1)), linear-gradient(rgba(${rgb},.25), transparent)`,
    };
  }
}
