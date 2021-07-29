import { createSelector, getActionTypeFromInstance, ActionType } from '@ngxs/store';
import { ActionsExecutedState, ActionsExecutedStateModel } from './actions-executed.state';

export type ActionsExecuted = { [action: string]: number } | null;

export function actionsExecuted(actionTypes: ActionType[]) {
    return createSelector([ActionsExecutedState], (state: ActionsExecutedStateModel) => {
        if (!actionTypes || actionTypes.length === 0) {
            if (Object.keys(state).length === 0) {
                return null;
            }
            return state;
        }

        return actionTypes.reduce((acc: ActionsExecuted, type: ActionType) => {
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
