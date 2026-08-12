import { createSelector } from '@ngxs/store';
import { ZooState } from './zoo.state';
import { ZooStateModel } from './zoo.model';

export const zooSelectors = {
    pandas: createSelector([ZooState], (state: ZooStateModel) => state.pandas),
    bears: createSelector([ZooState], (state: ZooStateModel) => state.bears)
};
