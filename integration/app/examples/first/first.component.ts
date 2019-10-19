import { CountState } from './count/count.state';
import { Observable } from 'rxjs';
import { Increment, Decrement } from './count/count.actions';
import { actionsExecuting, ActionsExecuting } from '@ngxs-labs/actions-executing';
import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';

@Component({
    selector: 'first',
    templateUrl: 'first.component.html'
})
export class FirstComponent {

    @Select(actionsExecuting([Increment])) public incrementExecuting$: Observable<ActionsExecuting> | undefined;
    @Select(CountState.val) public count$: Observable<ActionsExecuting> | undefined;

    constructor(
        private store: Store
    ) { }


    public increment() {
        this.store.dispatch(new Increment());
    }

    public decrement() {
        this.store.dispatch(new Decrement());
    }
}
