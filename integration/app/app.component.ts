import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AppComponent {
  store = inject(Store);

  store$ = this.store.select((state: unknown) => state);
}
