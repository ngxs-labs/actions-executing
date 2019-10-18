import { createSelector, getActionTypeFromInstance } from '@ngxs/store';
import { ActionsExecutingState, ActionsExecutingStateModel } from './actions-executing.state';

export type ActionsExecuting = { [action: string]: number } | null;

export function actionsExecuting(actionTypes: any[]) {
    return createSelector(
        [ActionsExecutingState],
        (state: ActionsExecutingStateModel): ActionsExecuting => {
            return actionTypes.reduce((acc: any, type: any) => {
                const actionType = getActionTypeFromInstance(type);

                if (!actionType) {
                    return acc;
                }

                if (state[actionType]) {
                    return { ...acc, [actionType]: state[actionType] };
                }

                return acc;
            }, null);
        });
}
