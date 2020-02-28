import { State, NgxsOnInit, StateContext, Actions, getActionTypeFromInstance } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActionStatus } from '@ngxs/store/src/actions-stream';
import { OnDestroy, Injectable } from '@angular/core';

export interface ActionsExecutingStateModel {
    [action: string]: number;
}

@State<ActionsExecutingStateModel>({
    name: 'ActionsExecuting'
})
@Injectable()
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

                    if (actionContext.status === ActionStatus.Dispatched) {
                        count++;
                    } else if (count > 0) {
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
