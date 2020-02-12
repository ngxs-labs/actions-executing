import { State, NgxsOnInit, StateContext, Actions, getActionTypeFromInstance } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActionStatus } from '@ngxs/store/src/actions-stream';
import { OnDestroy } from '@angular/core';

export interface ActionsExecutingStateModel {
    [action: string]: number;
}

@State<ActionsExecutingStateModel>({
    name: 'ActionsExecuting'
})
export class ActionsExecutingState implements NgxsOnInit, OnDestroy {
    private _sub: Subscription = new Subscription();

    constructor(private actions$: Actions) {}

    public ngxsOnInit({ patchState, getState }: StateContext<ActionsExecutingStateModel>) {
        this._sub = this.actions$
            .pipe(
                tap((actionContext) => {
                    const actionType = getActionTypeFromInstance(actionContext.action);
                    if (!actionType) {
                        return;
                    }

                    let count = getState()[actionType] || 0;

                    if (actionContext.status === ActionStatus.Successful && count === 0) {
                        console.log('unexpected behavior');
                    } else if (actionContext.status === ActionStatus.Dispatched) {
                        count++;
                    } else {
                        count--;
                    }

                    patchState({
                        [actionType]: count
                    });
                })
            )
            .subscribe();
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }
}
