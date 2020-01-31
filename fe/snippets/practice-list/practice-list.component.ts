import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Practice } from 'src/app/types';
import { Router } from '@angular/router';
import { APP_ROUTING_PATHS } from 'src/app/app-routing-paths';
import { ResizeService } from 'src/app/services/resize.service';
import { PracticeService } from 'src/app/services/practice.service';
import { State } from 'src/app/reducers';

interface ItemPosition {
  col: number;
  row: number;
  width: number;
  height: number;
}

interface ListItem extends Practice {
  x: number;
  y: number;
  size: number;
  style: object;
}

// TODO: memoize me
function calculatePositions(width: number, height: number, count: number): ItemPosition[] {
  const aPositions = [];
  let bestSquareness = Number.MAX_VALUE;
  for (let x = 1; x <= count; x++) {
    for (let y = 1; y <= count; y++) {
      const c = x * y;
      // only without empty rows!
      if (c >= count && c - count < x) {
        const w = width / x;
        const h = height / y;
        const squareness = w > h ? w / h : h / w;
        // perf.opt.
        if (squareness < bestSquareness) {
          aPositions.push({
            x,
            y,
            w,
            h,
            c,
            squareness
          });
          bestSquareness = squareness;
        }
      }
    }
  }
  const meta = aPositions.sort((a, b) => a.squareness - b.squareness)[0];
  return [...Array(meta.c)]
    .map((_, i) => {
      const col = i % meta.x;
      const row = Math.floor(i / meta.x);
      return {
        col,
        row,
        width: meta.w,
        height: meta.h,
      };
    });
}

function updatePosition(practices: Practice[], rect: DOMRect): ListItem[] {
  if (practices.length === 0) {
    return;
  }

  const {
    width,
    height
  } = rect;
  const positions = calculatePositions(width, height, practices.length);
  const fw = positions[0].width;
  const fh = positions[0].height;
  const size = Math.floor(Math.min(fw, fh) * .75);
  const xOffset = (fw - size) / 2;
  const yOffset = (fh - size) / 2;

  const listItems: ListItem[] = practices
    .map((p, index) => {
      const { col, row } = positions[index];
      const x = col * fw + xOffset;
      const y = row * fh + yOffset;
      return {
        ...p,
        x,
        y,
        size,
        style: {
          'width.px': size,
          'height.px': size,
          'left.px': x,
          'top.px': y,
        },
      };
    });

  return listItems;
}

@Component({
  selector: 'app-practice-list',
  templateUrl: './practice-list.component.html',
  styleUrls: ['./practice-list.component.scss']
})
export class PracticeListComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container: ElementRef;
  unsubscribe$ = new Subject();
  items: ListItem[] = [];

  constructor(
    private store: Store<State>,
    private router: Router,
    private resizeService: ResizeService,
    private practiceService: PracticeService,
  ) { }

  ngOnInit() {
    combineLatest([
      this.store.pipe(select(state => state.data)),
      this.resizeService.resizeObservable(),
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([data, size]) => {
        const rect = this.container.nativeElement.getBoundingClientRect();
        this.items = updatePosition(data.practices, rect);
      });
  }

  onPracticeClick(practice: Practice) {
    if (practice.startTime) {
      this.practiceService.stopPractice(practice);
    } else {
      this.practiceService.startPractice(practice);
    }
  }

  onPracticeDoubleClick(practice: Practice) {
    this.router.navigate([APP_ROUTING_PATHS.PRACTICE, practice.id]);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
