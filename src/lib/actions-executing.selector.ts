import { createSelector, getActionTypeFromInstance, ActionType } from '@ngxs/store';
import { ActionsExecutingState, ActionsExecutingStateModel } from './actions-executing.state';

export type ActionsExecuting = { [action: string]: number } | null;

function actionsExecutingFn(actionTypes: ActionType[], state: ActionsExecutingStateModel): ActionsExecuting {
    if (!actionTypes || actionTypes.length === 0) {
        if (Object.keys(state).length === 0) {
            return null;
        }
        return state;
    }

    return actionTypes.reduce((acc: ActionsExecuting, type: ActionType) => {
        const actionType = getActionTypeFromInstance(type);

        if (!actionType) {
            return acc;
        }

        if (state[actionType]) {
            return { ...acc, [actionType]: state[actionType] };
        }

        return acc;
    }, null);
}

export function actionsExecuting(actionTypes?: ActionType[]): (state: ActionsExecutingStateModel) => ActionsExecuting {
    return createSelector(
        [ActionsExecutingState],
        (state: ActionsExecutingStateModel): ActionsExecuting => {
            return actionsExecutingFn(actionTypes, state);
        }
    );
}

export function hasActionsExecuting(actionTypes?: ActionType[]): (state: ActionsExecutingStateModel) => boolean {
    return createSelector([ActionsExecutingState], (state: ActionsExecutingStateModel): boolean => {
        const result = actionsExecutingFn(actionTypes, state);
        return result === null ? false : Object.values(result).some((value) => value > 0);
    });
}
