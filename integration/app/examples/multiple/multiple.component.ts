import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { actionsExecuting } from '@ngxs-labs/actions-executing';
import { AddPanda, AddBear } from '../states/zoo/zoo.actions';
import { zooSelectors } from '../states/zoo/zoo.selectors';

@Component({
    selector: 'multiple',
    templateUrl: './multiple.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MultipleComponent {
    store = inject(Store);

    addPandaExecuting$ = this.store.select(actionsExecuting([AddPanda]));
    addBearExecuting$ = this.store.select(actionsExecuting([AddBear]));
    addPandaOrAddBearExecuting$ = this.store.select(actionsExecuting([AddPanda, AddBear]));
    zoo$ = this.store.select(zooSelectors.pandas);

    public addPanda() {
        this.store.dispatch(new AddPanda());
    }

    public addBear() {
        this.store.dispatch(new AddBear());
    }
}
