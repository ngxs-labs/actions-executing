import { State, NgxsOnInit, StateContext, Actions, getActionTypeFromInstance, ActionStatus } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { OnDestroy, Injectable, inject } from '@angular/core';

export interface ActionsExecutedStateModel {
    [action: string]: number;
}

@State<ActionsExecutedStateModel>({
    name: 'ngxs_actions_executed'
})
@Injectable()
export class ActionsExecutedState implements NgxsOnInit, OnDestroy {
    actions$ = inject(Actions);

    private actionsExecutedSub: Subscription = new Subscription();

    public ngxsOnInit({ patchState, getState }: StateContext<ActionsExecutedStateModel>) {
        this.actionsExecutedSub = this.actions$
            .pipe(
                tap((actionContext) => {
                    const actionType = getActionTypeFromInstance(actionContext.action);
                    if (!actionType) {
                        return;
                    }

                    let count = getState()?.[actionType] || 0;

                    if (actionContext.status !== ActionStatus.Dispatched) {
                        count++;
                    }

                    patchState({
                        [actionType]: count
                    });
                })
            )
            .subscribe();
    }

    public ngOnDestroy() {
        this.actionsExecutedSub.unsubscribe();
    }
}
