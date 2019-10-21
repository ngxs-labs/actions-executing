import { Observable } from 'rxjs';
import { actionsExecuting, ActionsExecuting } from '@ngxs-labs/actions-executing';
import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ZooState } from '../states/zoo/zoo.state';
import { ZooStateModel } from '../states/zoo/zoo.model';
import { AddBear, AddPanda } from '../states/zoo/zoo.actions';

@Component({
    selector: 'single',
    templateUrl: 'single.component.html'
})
export class SingleComponent {

    @Select(actionsExecuting([AddPanda])) public addPandaExecuting$: Observable<ActionsExecuting>;
    @Select(actionsExecuting([AddBear])) public addBearExecuting$: Observable<ActionsExecuting>;
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
