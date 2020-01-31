import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

interface WindowSize {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResizeService {
  resizeSubject = new BehaviorSubject<WindowSize>(this.windowSize);

  constructor() {
    window.addEventListener(
      'resize',
      () => this.resizeSubject.next(this.windowSize),
    );
  }

  public resizeObservable(): Observable<WindowSize> {
    return this.resizeSubject
      .asObservable()
      .pipe(throttleTime(100));
    }

  public get windowSize(): WindowSize {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
}
