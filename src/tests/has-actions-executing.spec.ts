import { NgxsActionsExecutingModule, hasActionsExecuting } from '..';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsModule, Store, State, Action, StateContext, NgxsOnInit } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('hasActionsExecuting', () => {
    let store: Store;

    class Action1 {
        public static type = 'ACTION 1';
    }

    class Action2 {
        public static type = 'ACTION 2';
    }

    class Action3 {
        public static type = 'ACTION 3';
    }

    class ErrorAction1 {
        public static type = 'ERROR ACTION 1';
    }

    class AsyncAction1 {
        public static type = 'ASYNC ACTION 1';
    }

    class AsyncAction2 {
        public static type = 'ASYNC ACTION 2';
    }

    class AsyncAction3 {
        public static type = 'ASYNC ACTION 3';
    }

    class AsyncErrorAction1 {
        public static type = 'ASYNC ERROR ACTION 1';
    }

    class NestedAsyncAction1 {
        public static type = 'NESTED ASYNC ACTION 1';
    }

    class NestedAsyncAction2 {
        public static type = 'NESTED ASYNC ACTION 2';
    }

    class NestedAsyncAction3 {
        public static type = 'NESTED ASYNC ACTION 3';
    }

    class NestedAsyncAction4 {
        public static type = 'NESTED ASYNC ACTION 4';
    }

    class NestedAsyncAction5 {
        public static type = 'NESTED ASYNC ACTION 5';
    }

    class NestedAsyncAction6 {
        public static type = 'NESTED ASYNC ACTION 6';
    }

    @State({
        name: 'test'
    })
    class TestState {
        @Action([Action1])
        public action1() {}

        @Action([AsyncAction1])
        public asyncAction1() {
            return of({}).pipe(delay(0));
        }

        @Action([AsyncAction2])
        public asyncAction2() {
            return of({}).pipe(delay(0));
        }

        @Action(AsyncErrorAction1)
        public asyncError() {
            return throwError(new Error('this is a test error')).pipe(delay(0));
        }

        @Action(ErrorAction1)
        public onError() {
            return throwError(new Error('this is a test error'));
        }
    }

    @State<{}>({
        name: 'nested_actions_1'
    })
    class NestedActions1State {
        @Action(NestedAsyncAction1)
        public nestedAsyncAction1({ dispatch }: StateContext<{}>) {
            return dispatch(new NestedAsyncAction2()).pipe(delay(0));
        }

        @Action(NestedAsyncAction2)
        public nestedAsyncAction2({ dispatch }: StateContext<{}>) {
            return dispatch(new NestedAsyncAction3()).pipe(delay(0));
        }

        @Action(NestedAsyncAction3)
        public nestedAsyncAction3() {
            return of({}).pipe(delay(0));
        }
    }

    @State({
        name: 'nested_actions_2'
    })
    class NestedActions2State {
        @Action([NestedAsyncAction4, NestedAsyncAction5])
        public combinedAction({ dispatch }: StateContext<{}>) {
            return dispatch(new NestedAsyncAction6()).pipe(delay(0));
        }

        @Action(NestedAsyncAction5)
        public nestedAsyncAction5() {
            return of({}).pipe(delay(100));
        }

        @Action(NestedAsyncAction6)
        public nestedAsyncAction6() {
            return of({}).pipe(delay(0));
        }
    }

    @State({
        name: 'ngxs_on_init_state'
    })
    class NgxsOnInitState implements NgxsOnInit {
        ngxsOnInit(ctx: StateContext<{}>) {
            ctx.dispatch(new Action3());
            ctx.dispatch(new AsyncAction3());
        }

        @Action([Action3])
        public action3() {}

        @Action([AsyncAction3])
        public asyncAction3() {
            return of({}).pipe(delay(0));
        }
    }

    describe('NgxsOnInit', () => {
        describe('Sync and Async Action', () => {
            it('should be false when dispatching async or sync from ngxsOnInit', fakeAsync(() => {
                TestBed.configureTestingModule({
                    imports: [NgxsModule.forRoot([NgxsOnInitState]), NgxsActionsExecutingModule.forRoot()]
                });

                store = TestBed.get(Store);

                tick(1);

                expect(store.selectSnapshot(hasActionsExecuting([Action3]))).toBe(false);
                expect(store.selectSnapshot(hasActionsExecuting([AsyncAction3]))).toEqual(false);
            }));
        });
    });

    describe('', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    NgxsModule.forRoot([TestState, NestedActions1State, NestedActions2State]),
                    NgxsActionsExecutingModule.forRoot()
                ]
            });

            store = TestBed.get(Store);
        });

        describe('Single Action', () => {
            describe('Sync Action', () => {
                it('should be false', () => {
                    store.dispatch(Action1);

                    const snapshot = store.selectSnapshot(hasActionsExecuting([Action1]));
                    expect(snapshot).toBe(false);
                });

                it('should be executing between dispatch and complete', () => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([Action1])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new Action1());
                    expect(actionStatus).toEqual([false, true, false]);
                });

                it('should be executing between dispatch and error', () => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([ErrorAction1])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new ErrorAction1());
                    expect(actionStatus).toEqual([false, true, false]);
                });
            });

            describe('Async Action', () => {
                it('should be false', fakeAsync(() => {
                    store.dispatch(AsyncAction1);

                    let snapshot = store.selectSnapshot(hasActionsExecuting([AsyncAction1]));
                    expect(snapshot).toEqual(true);

                    tick();

                    snapshot = store.selectSnapshot(hasActionsExecuting([AsyncAction1]));
                    expect(snapshot).toBe(false);
                }));

                it('should be executing between dispatch and complete ', fakeAsync(() => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([AsyncAction1])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false]);
                }));

                it('should be executing between dispatch and error', fakeAsync(() => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([AsyncErrorAction1])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new AsyncErrorAction1()).subscribe({
                        error: (err) => {
                            expect(err).toBeDefined();
                        }
                    });

                    tick(1);
                    expect(actionStatus).toEqual([false, true, false]);
                }));
            });
        });

        describe('Multiple Actions', () => {
            describe('sync', () => {
                it('should be executing between dispatch and complete', () => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([Action1, Action2])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new Action1());
                    store.dispatch(new Action2());
                    expect(actionStatus).toEqual([false, true, false, true, false]);
                });

                it('should be executing between dispatch and error', () => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([Action1, ErrorAction1])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new Action1());
                    store.dispatch(new ErrorAction1());
                    expect(actionStatus).toEqual([false, true, false, true, false]);
                });
            });
            describe('async', () => {
                it('should be executing between dispatch and complete ', fakeAsync(() => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([AsyncAction1, AsyncAction2])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false]);
                    store.dispatch(new AsyncAction2());
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false, true, false]);
                }));

                it('should be executing between dispatch and error', fakeAsync(() => {
                    const actionStatus: boolean[] = [];

                    store
                        .select(hasActionsExecuting([AsyncAction1, AsyncErrorAction1]))
                        .subscribe((_actionsExecuting) => {
                            actionStatus.push(_actionsExecuting);
                        });

                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false]);
                    store.dispatch(new AsyncErrorAction1());
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false, true, false]);
                }));

                it('should be executing when action is dispatched multiple times', fakeAsync(() => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([AsyncAction1])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new AsyncAction1());
                    expect(actionStatus).toEqual([false, true]);
                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false]);
                }));

                it('should be executing when action is dispatched multiple times (case 2)', fakeAsync(() => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting([AsyncAction1])).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new AsyncAction1());
                    store.dispatch(new AsyncAction1());
                    expect(actionStatus).toEqual([false, true]);
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false]);
                }));

                describe('nested actions 1', () => {
                    it('should be executing on nested actions', fakeAsync(() => {
                        const nestedAction1Status: boolean[] = [];
                        const nestedAction2Status: boolean[] = [];
                        const nestedAction3Status: boolean[] = [];

                        const combinedActionStatus: boolean[] = [];

                        store.select(hasActionsExecuting([NestedAsyncAction1])).subscribe((_actionsExecuting) => {
                            nestedAction1Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction2])).subscribe((_actionsExecuting) => {
                            nestedAction2Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction3])).subscribe((_actionsExecuting) => {
                            nestedAction3Status.push(_actionsExecuting);
                        });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction1, NestedAsyncAction2, NestedAsyncAction3]))
                            .subscribe((_actionsExecuting) => {
                                combinedActionStatus.push(_actionsExecuting);
                            });

                        store.dispatch(new NestedAsyncAction1());
                        tick(1);
                        expect(nestedAction1Status).toEqual([false, true, false]);
                        expect(nestedAction2Status).toEqual([false, true, false]);
                        expect(nestedAction3Status).toEqual([false, true, false]);
                        expect(combinedActionStatus).toEqual([false, true, false]);
                    }));
                });

                describe('nested actions 2', () => {
                    it('should be executing on nested actions (scenario 1)', fakeAsync(() => {
                        const nestedAction4Status: boolean[] = [];
                        const nestedAction5Status: boolean[] = [];
                        const nestedAction6Status: boolean[] = [];

                        const combinedAction45Status: boolean[] = [];
                        const combinedAction456Status: boolean[] = [];

                        store.select(hasActionsExecuting([NestedAsyncAction4])).subscribe((_actionsExecuting) => {
                            nestedAction4Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction5])).subscribe((_actionsExecuting) => {
                            nestedAction5Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction6])).subscribe((_actionsExecuting) => {
                            nestedAction6Status.push(_actionsExecuting);
                        });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction4, NestedAsyncAction5]))
                            .subscribe((_actionsExecuting) => {
                                combinedAction45Status.push(_actionsExecuting);
                            });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6]))
                            .subscribe((_actionsExecuting) => {
                                combinedAction456Status.push(_actionsExecuting);
                            });

                        store.dispatch(new NestedAsyncAction4());
                        tick(1);
                        expect(nestedAction4Status).toEqual([false, true, false]);
                        expect(nestedAction5Status).toEqual([false]);
                        expect(nestedAction6Status).toEqual([false, true, false]);

                        expect(combinedAction45Status).toEqual([false, true, false]);
                        expect(combinedAction456Status).toEqual([false, true, false]);
                    }));

                    it('should be executing on nested actions (scenario 2)', fakeAsync(() => {
                        const nestedAction4Status: boolean[] = [];
                        const nestedAction5Status: boolean[] = [];
                        const nestedAction6Status: boolean[] = [];

                        const combinedAction45Status: boolean[] = [];
                        const combinedAction456Status: boolean[] = [];

                        store.select(hasActionsExecuting([NestedAsyncAction4])).subscribe((_actionsExecuting) => {
                            nestedAction4Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction5])).subscribe((_actionsExecuting) => {
                            nestedAction5Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction6])).subscribe((_actionsExecuting) => {
                            nestedAction6Status.push(_actionsExecuting);
                        });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction4, NestedAsyncAction5]))
                            .subscribe((_actionsExecuting) => {
                                combinedAction45Status.push(_actionsExecuting);
                            });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6]))
                            .subscribe((_actionsExecuting) => {
                                combinedAction456Status.push(_actionsExecuting);
                            });

                        store.dispatch([new NestedAsyncAction4(), new NestedAsyncAction5()]);
                        tick(1);
                        expect(nestedAction4Status).toEqual([false, true, false]);
                        expect(nestedAction5Status).toEqual([false, true]);
                        expect(nestedAction6Status).toEqual([false, true, false]);
                        tick(100);
                        expect(nestedAction4Status).toEqual([false, true, false]);
                        expect(nestedAction5Status).toEqual([false, true, false]);
                        expect(nestedAction6Status).toEqual([false, true, false]);
                        expect(combinedAction45Status).toEqual([false, true, false]);
                        expect(combinedAction456Status).toEqual([false, true, false]);
                    }));

                    it('should be executing on nested actions (scenario 3)', fakeAsync(() => {
                        const nestedAction4Status: boolean[] = [];
                        const nestedAction5Status: boolean[] = [];
                        const nestedAction6Status: boolean[] = [];

                        const combinedAction45Status: boolean[] = [];
                        const combinedAction456Status: boolean[] = [];

                        store.select(hasActionsExecuting([NestedAsyncAction4])).subscribe((_actionsExecuting) => {
                            nestedAction4Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction5])).subscribe((_actionsExecuting) => {
                            nestedAction5Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction6])).subscribe((_actionsExecuting) => {
                            nestedAction6Status.push(_actionsExecuting);
                        });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction4, NestedAsyncAction5]))
                            .subscribe((_actionsExecuting) => {
                                combinedAction45Status.push(_actionsExecuting);
                            });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6]))
                            .subscribe((_actionsExecuting) => {
                                combinedAction456Status.push(_actionsExecuting);
                            });

                        store.dispatch(new NestedAsyncAction5());
                        tick(1);
                        expect(nestedAction4Status).toEqual([false]);
                        expect(nestedAction5Status).toEqual([false, true]);
                        expect(nestedAction6Status).toEqual([false, true, false]);
                        tick(100);
                        expect(nestedAction4Status).toEqual([false]);
                        expect(nestedAction5Status).toEqual([false, true, false]);
                        expect(nestedAction6Status).toEqual([false, true, false]);
                        expect(combinedAction45Status).toEqual([false, true, false]);
                        expect(combinedAction456Status).toEqual([false, true, false]);
                    }));

                    it('should be executing on nested actions (scenario 4)', fakeAsync(() => {
                        const nestedAction4Status: boolean[] = [];
                        const nestedAction5Status: boolean[] = [];
                        const nestedAction6Status: boolean[] = [];

                        const combinedAction45Status: boolean[] = [];
                        const combinedAction456Status: boolean[] = [];

                        store.select(hasActionsExecuting([NestedAsyncAction4])).subscribe((_actionsExecuting) => {
                            nestedAction4Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction5])).subscribe((_actionsExecuting) => {
                            nestedAction5Status.push(_actionsExecuting);
                        });

                        store.select(hasActionsExecuting([NestedAsyncAction6])).subscribe((_actionsExecuting) => {
                            nestedAction6Status.push(_actionsExecuting);
                        });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction4, NestedAsyncAction5]))
                            .subscribe((_actionsExecuting) => {
                                combinedAction45Status.push(_actionsExecuting);
                            });

                        store
                            .select(hasActionsExecuting([NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6]))
                            .subscribe((_actionsExecuting) => {
                                combinedAction456Status.push(_actionsExecuting);
                            });

                        store.dispatch([new NestedAsyncAction4(), new NestedAsyncAction5(), new NestedAsyncAction6()]);
                        tick(1);
                        expect(nestedAction4Status).toEqual([false, true, false]);
                        expect(nestedAction5Status).toEqual([false, true]);
                        expect(nestedAction6Status).toEqual([false, true, false]);
                        tick(100);
                        expect(nestedAction4Status).toEqual([false, true, false]);
                        expect(nestedAction5Status).toEqual([false, true, false]);
                        expect(nestedAction6Status).toEqual([false, true, false]);

                        expect(combinedAction45Status).toEqual([false, true, false]);
                        expect(combinedAction456Status).toEqual([false, true, false]);
                    }));
                });
            });
        });

        describe('No Actions', () => {
            describe('sync', () => {
                it('should be executing between dispatch and complete', () => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting()).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new Action1());
                    store.dispatch(new Action2());
                    expect(actionStatus).toEqual([false, true, false, true, false]);
                });
            });

            describe('async', () => {
                it('should be executing between dispatch and complete ', fakeAsync(() => {
                    const actionStatus: boolean[] = [];

                    store.select(hasActionsExecuting()).subscribe((_actionsExecuting) => {
                        actionStatus.push(_actionsExecuting);
                    });

                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false]);
                    store.dispatch(new AsyncAction2());
                    tick(1);
                    expect(actionStatus).toEqual([false, true, false, true, false]);
                }));
            });
        });
    });
});
