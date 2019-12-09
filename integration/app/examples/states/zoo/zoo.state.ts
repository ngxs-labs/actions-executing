import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ZooStateModel } from './zoo.model';
import { AddPanda, AddBear, AddPandaAndBear } from './zoo.actions';
import { of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@State<ZooStateModel>({
    name: 'test',
    defaults: {
        pandas: [],
        bears: []
    }
})
export class ZooState {
    @Selector() public static pandas(state: ZooStateModel) {
        return state.pandas;
    }
    @Selector() public static bears(state: ZooStateModel) {
        return state.bears;
    }

    @Action([AddPanda])
    public addPanda({ patchState, getState }: StateContext<ZooStateModel>) {
        return of({}).pipe(
            delay(1000),
            tap((_) => {
                patchState({ pandas: getState().pandas.concat('🐼') });
            })
        );
    }

    @Action([AddBear])
    public addBear({ patchState, getState }: StateContext<ZooStateModel>) {
        return of({}).pipe(
            delay(2000),
            tap((_) => {
                patchState({ bears: getState().bears.concat('🐻') });
            })
        );
    }

    @Action([AddPandaAndBear])
    public addPandaAndBear({ patchState, getState, dispatch }: StateContext<ZooStateModel>) {
        return dispatch([new AddBear(), new AddPanda()]);
    }
}
