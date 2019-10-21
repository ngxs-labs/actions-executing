import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { actionsExecuting, ActionsExecuting } from '@ngxs-labs/actions-executing';
import { AddPanda, AddBear } from '../states/zoo/zoo.actions';
import { Observable } from 'rxjs';
import { ZooState } from '../states/zoo/zoo.state';
import { ZooStateModel } from '../states/zoo/zoo.model';

@Component({
    selector: 'multiple',
    templateUrl: './multiple.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultipleComponent {
    @Select(actionsExecuting([AddPanda])) public addPandaExecuting$: Observable<ActionsExecuting>;
    @Select(actionsExecuting([AddBear])) public addBearExecuting$: Observable<ActionsExecuting>;
    @Select(actionsExecuting([AddPanda, AddBear])) public addPandaAndAddBearExecuting$: Observable<ActionsExecuting>;
    @Select(ZooState) public zoo$: Observable<ZooStateModel>;

    constructor(
        private store: Store
    ) { }


    public addPanda() {
        this.store.dispatch(new AddPanda());
    }

    public addBear() {
        this.store.dispatch(new AddBear());
    }
}
