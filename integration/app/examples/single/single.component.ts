import { actionsExecuting } from '@ngxs-labs/actions-executing';
import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { zooSelectors } from '../states/zoo/zoo.selectors';
import { AddBear, AddPanda } from '../states/zoo/zoo.actions';
import { map } from 'rxjs/operators';

@Component({
    selector: 'single',
    templateUrl: 'single.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SingleComponent implements OnInit {
    store = inject(Store);

    addPandaExecuting$ = this.store.select(actionsExecuting([AddPanda]));
    addBearExecuting$ = this.store.select(actionsExecuting([AddBear]));
    zoo$ = this.store.select(zooSelectors.pandas);
    addBearExecutingCount$ = this.addBearExecuting$.pipe(
        map((_actionsExecuting) => _actionsExecuting?.[AddBear.type] ?? 0)
    );

    ngOnInit() {}

    public addPanda() {
        this.store.dispatch(new AddPanda());
    }

    public addBear() {
        this.store.dispatch(new AddBear());
    }
}
