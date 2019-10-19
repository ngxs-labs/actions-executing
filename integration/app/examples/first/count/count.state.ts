import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CountModel } from './count.model';
import { Increment, Decrement } from './count.actions';
import { of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@State<CountModel>({
    name: 'count',
    defaults: { val: 0 }
})
export class CountState {

    @Selector() public static val(state: CountModel) { return state.val; }

    @Action([Increment])
    public increment({ patchState, getState }: StateContext<CountModel>) {
        return of().pipe(
            delay(1000),
            tap(_ => {
                patchState({ val: getState().val + 1 });
            })
        );
    }

    @Action([Decrement])
    public decrement({ patchState, getState }: StateContext<CountModel>) {
        return of().pipe(
            delay(1000),
            tap(_ => {
                patchState({ val: getState().val - 1 });
            })
        );
    }
}
