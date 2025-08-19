import { NgxsActionsExecutingModule, actionsExecuted, ActionsExecuted } from '..';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsModule, Store, State, Action, StateContext, NgxsOnInit } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Injectable } from '@angular/core';

describe('actionsExecuted', () => {
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
    @Injectable()
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
    @Injectable()
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
    @Injectable()
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
    @Injectable()
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
        describe('Sync Action', () => {
            it('should be null when dispatching sync from ngxsOnInit', fakeAsync(() => {
                TestBed.configureTestingModule({
                    imports: [NgxsModule.forRoot([NgxsOnInitState]), NgxsActionsExecutingModule.forRoot()]
                });

                store = TestBed.inject(Store);

                tick(1);

                expect(store.selectSnapshot(actionsExecuted([Action3]))).toBe(null);
            }));
        });

        describe('Async Action', () => {
            it('should count when dispatching async from ngxsOnInit', fakeAsync(() => {
                TestBed.configureTestingModule({
                    imports: [NgxsModule.forRoot([NgxsOnInitState]), NgxsActionsExecutingModule.forRoot()]
                });

                store = TestBed.inject(Store);

                tick(1);
                expect(store.selectSnapshot(actionsExecuted([AsyncAction3]))).toEqual({ [AsyncAction3.type]: 1 });
                tick(1);
                expect(store.selectSnapshot(actionsExecuted([AsyncAction3]))).toEqual({ [AsyncAction3.type]: 1 });
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

            store = TestBed.inject(Store);
        });

        describe('Single Action', () => {
            describe('Sync Action', () => {
                it('should be 1', () => {
                    store.dispatch(Action1);

                    const snapshot = store.selectSnapshot(actionsExecuted([Action1]));
                    expect(snapshot).toEqual({ [Action1.type]: 1 });
                });

                it('should be null before dispatch and 1 after complete', () => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([Action1])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new Action1());

                    expect(actionStatus).toEqual([null, { [Action1.type]: 1 }]);
                });

                it('should be null before dispatch and 1 after error', () => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([ErrorAction1])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new ErrorAction1());
                    expect(actionStatus).toEqual([null, { [ErrorAction1.type]: 1 }]);
                });
            });

            describe('Async Action', () => {
                it('should be null before is completed', fakeAsync(() => {
                    store.dispatch(AsyncAction1);

                    let snapshot = store.selectSnapshot(actionsExecuted([AsyncAction1]));
                    expect(snapshot).toEqual(null);

                    tick();

                    snapshot = store.selectSnapshot(actionsExecuted([AsyncAction1]));
                    expect(snapshot).toEqual({ 'ASYNC ACTION 1': 1 });
                }));

                it('should be null before dispatch and 1 after complete ', fakeAsync(() => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([AsyncAction1])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([null, { [AsyncAction1.type]: 1 }]);
                }));

                it('should be null before dispatch and q after error', fakeAsync(() => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([AsyncErrorAction1])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new AsyncErrorAction1()).subscribe({
                        error: (err) => {
                            expect(err).toBeDefined();
                        }
                    });

                    tick(1);
                    expect(actionStatus).toEqual([null, { [AsyncErrorAction1.type]: 1 }]);
                }));
            });
        });

        describe('Multiple Actions', () => {
            describe('sync', () => {
                it('should count actions when completed', () => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([Action1, Action2])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new Action1());
                    store.dispatch(new Action2());
                    expect(actionStatus).toEqual([
                        null,
                        { [Action1.type]: 1 },
                        { [Action1.type]: 1 },
                        { [Action1.type]: 1, [Action2.type]: 1 }
                    ]);
                });

                it('should count action and error when completed', () => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([Action1, ErrorAction1])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new Action1());
                    store.dispatch(new ErrorAction1());
                    expect(actionStatus).toEqual([
                        null,
                        { [Action1.type]: 1 },
                        { [Action1.type]: 1 },
                        { [Action1.type]: 1, [ErrorAction1.type]: 1 }
                    ]);
                });
            });
            describe('async', () => {
                it('should count actions when completed', fakeAsync(() => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([AsyncAction1, AsyncAction2])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([null, { [AsyncAction1.type]: 1 }]);
                    store.dispatch(new AsyncAction2());
                    tick(1);
                    expect(actionStatus).toEqual([
                        null,
                        { [AsyncAction1.type]: 1 },
                        { [AsyncAction1.type]: 1 },
                        { [AsyncAction1.type]: 1, [AsyncAction2.type]: 1 }
                    ]);
                }));

                it('should count action and error when completed', fakeAsync(() => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([AsyncAction1, AsyncErrorAction1])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([null, { [AsyncAction1.type]: 1 }]);
                    store.dispatch(new AsyncErrorAction1());
                    tick(1);
                    expect(actionStatus).toEqual([
                        null,
                        { [AsyncAction1.type]: 1 },
                        { [AsyncAction1.type]: 1 },
                        { [AsyncAction1.type]: 1, [AsyncErrorAction1.type]: 1 }
                    ]);
                }));

                it('should count all actions when completed', fakeAsync(() => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([AsyncAction1])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new AsyncAction1());
                    expect(actionStatus).toEqual([null]);
                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([null, { [AsyncAction1.type]: 1 }, { [AsyncAction1.type]: 2 }]);
                }));

                it('should count all actions when completed (case 2)', fakeAsync(() => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([AsyncAction1])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new AsyncAction1());
                    store.dispatch(new AsyncAction1());
                    expect(actionStatus).toEqual([null]);
                    tick(1);
                    expect(actionStatus).toEqual([null, { [AsyncAction1.type]: 1 }, { [AsyncAction1.type]: 2 }]);
                }));

                describe('nested actions 1', () => {
                    it('should be executing on nested actions', fakeAsync(() => {
                        const nestedAction1Status: ActionsExecuted[] = [];
                        const nestedAction2Status: ActionsExecuted[] = [];
                        const nestedAction3Status: ActionsExecuted[] = [];

                        const combinedActionStatus: ActionsExecuted[] = [];

                        store.select(actionsExecuted([NestedAsyncAction1])).subscribe((_actionsExecuted) => {
                            nestedAction1Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction2])).subscribe((_actionsExecuted) => {
                            nestedAction2Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction3])).subscribe((_actionsExecuted) => {
                            nestedAction3Status.push(_actionsExecuted);
                        });

                        store
                            .select(actionsExecuted([NestedAsyncAction1, NestedAsyncAction2, NestedAsyncAction3]))
                            .subscribe((_actionsExecuted) => {
                                combinedActionStatus.push(_actionsExecuted);
                            });

                        store.dispatch(new NestedAsyncAction1());
                        tick(1);
                        expect(nestedAction1Status).toEqual([null, { [NestedAsyncAction1.type]: 1 }]);
                        expect(nestedAction2Status).toEqual([
                            null,
                            { [NestedAsyncAction2.type]: 1 },
                            { [NestedAsyncAction2.type]: 1 }
                        ]);
                        expect(nestedAction3Status).toEqual([
                            null,
                            { [NestedAsyncAction3.type]: 1 },
                            { [NestedAsyncAction3.type]: 1 },
                            { [NestedAsyncAction3.type]: 1 }
                        ]);

                        expect(combinedActionStatus).toEqual([
                            null,
                            { [NestedAsyncAction3.type]: 1 },
                            { [NestedAsyncAction2.type]: 1, [NestedAsyncAction3.type]: 1 },
                            {
                                [NestedAsyncAction1.type]: 1,
                                [NestedAsyncAction2.type]: 1,
                                [NestedAsyncAction3.type]: 1
                            }
                        ]);
                    }));
                });

                describe('nested actions 2', () => {
                    it('should be executing on nested actions (scenario 1)', fakeAsync(() => {
                        const nestedAction4Status: ActionsExecuted[] = [];
                        const nestedAction5Status: ActionsExecuted[] = [];
                        const nestedAction6Status: ActionsExecuted[] = [];

                        const combinedAction45Status: ActionsExecuted[] = [];
                        const combinedAction456Status: ActionsExecuted[] = [];

                        store.select(actionsExecuted([NestedAsyncAction4])).subscribe((_actionsExecuted) => {
                            nestedAction4Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction5])).subscribe((_actionsExecuted) => {
                            nestedAction5Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction6])).subscribe((_actionsExecuted) => {
                            nestedAction6Status.push(_actionsExecuted);
                        });

                        store
                            .select(actionsExecuted([NestedAsyncAction4, NestedAsyncAction5]))
                            .subscribe((_actionsExecuted) => {
                                combinedAction45Status.push(_actionsExecuted);
                            });

                        store
                            .select(actionsExecuted([NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6]))
                            .subscribe((_actionsExecuted) => {
                                combinedAction456Status.push(_actionsExecuted);
                            });

                        store.dispatch(new NestedAsyncAction4());
                        tick(1);
                        expect(nestedAction4Status).toEqual([null, { [NestedAsyncAction4.type]: 1 }]);
                        expect(nestedAction5Status).toEqual([null]);
                        expect(nestedAction6Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction6.type]: 1 }
                        ]);

                        expect(combinedAction45Status).toEqual([null, { [NestedAsyncAction4.type]: 1 }]);
                        expect(combinedAction456Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction4.type]: 1, [NestedAsyncAction6.type]: 1 }
                        ]);
                    }));

                    it('should be executing on nested actions (scenario 2)', fakeAsync(() => {
                        const nestedAction4Status: ActionsExecuted[] = [];
                        const nestedAction5Status: ActionsExecuted[] = [];
                        const nestedAction6Status: ActionsExecuted[] = [];

                        const combinedAction45Status: ActionsExecuted[] = [];
                        const combinedAction456Status: ActionsExecuted[] = [];

                        store.select(actionsExecuted([NestedAsyncAction4])).subscribe((_actionsExecuted) => {
                            nestedAction4Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction5])).subscribe((_actionsExecuted) => {
                            nestedAction5Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction6])).subscribe((_actionsExecuted) => {
                            nestedAction6Status.push(_actionsExecuted);
                        });

                        store
                            .select(actionsExecuted([NestedAsyncAction4, NestedAsyncAction5]))
                            .subscribe((_actionsExecuted) => {
                                combinedAction45Status.push(_actionsExecuted);
                            });

                        store
                            .select(actionsExecuted([NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6]))
                            .subscribe((_actionsExecuted) => {
                                combinedAction456Status.push(_actionsExecuted);
                            });

                        store.dispatch([new NestedAsyncAction4(), new NestedAsyncAction5()]);
                        tick(1);
                        expect(nestedAction4Status).toEqual([null, { [NestedAsyncAction4.type]: 1 }]);
                        expect(nestedAction5Status).toEqual([null]);
                        expect(nestedAction6Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction6.type]: 2 },
                            { [NestedAsyncAction6.type]: 2 }
                        ]);
                        tick(100);
                        expect(nestedAction4Status).toEqual([
                            null,
                            { [NestedAsyncAction4.type]: 1 },
                            { [NestedAsyncAction4.type]: 1 }
                        ]);
                        expect(nestedAction5Status).toEqual([null, { [NestedAsyncAction5.type]: 1 }]);
                        expect(nestedAction6Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction6.type]: 2 },
                            { [NestedAsyncAction6.type]: 2 },
                            { [NestedAsyncAction6.type]: 2 }
                        ]);

                        expect(combinedAction45Status).toEqual([
                            null,
                            { [NestedAsyncAction4.type]: 1 },
                            { [NestedAsyncAction4.type]: 1, [NestedAsyncAction5.type]: 1 }
                        ]);
                        expect(combinedAction456Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction6.type]: 2 },
                            { [NestedAsyncAction4.type]: 1, [NestedAsyncAction6.type]: 2 },
                            {
                                [NestedAsyncAction4.type]: 1,
                                [NestedAsyncAction5.type]: 1,
                                [NestedAsyncAction6.type]: 2
                            }
                        ]);
                    }));

                    it('should be executing on nested actions (scenario 3)', fakeAsync(() => {
                        const nestedAction4Status: ActionsExecuted[] = [];
                        const nestedAction5Status: ActionsExecuted[] = [];
                        const nestedAction6Status: ActionsExecuted[] = [];

                        const combinedAction45Status: ActionsExecuted[] = [];
                        const combinedAction456Status: ActionsExecuted[] = [];

                        store.select(actionsExecuted([NestedAsyncAction4])).subscribe((_actionsExecuted) => {
                            nestedAction4Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction5])).subscribe((_actionsExecuted) => {
                            nestedAction5Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction6])).subscribe((_actionsExecuted) => {
                            nestedAction6Status.push(_actionsExecuted);
                        });

                        store
                            .select(actionsExecuted([NestedAsyncAction4, NestedAsyncAction5]))
                            .subscribe((_actionsExecuted) => {
                                combinedAction45Status.push(_actionsExecuted);
                            });

                        store
                            .select(actionsExecuted([NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6]))
                            .subscribe((_actionsExecuted) => {
                                combinedAction456Status.push(_actionsExecuted);
                            });

                        store.dispatch(new NestedAsyncAction5());
                        tick(1);
                        expect(nestedAction4Status).toEqual([null]);
                        expect(nestedAction5Status).toEqual([null]);
                        expect(nestedAction6Status).toEqual([null, { [NestedAsyncAction6.type]: 1 }]);
                        tick(100);
                        expect(nestedAction4Status).toEqual([null]);
                        expect(nestedAction5Status).toEqual([null, { [NestedAsyncAction5.type]: 1 }]);
                        expect(nestedAction6Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction6.type]: 1 }
                        ]);

                        expect(combinedAction45Status).toEqual([null, { [NestedAsyncAction5.type]: 1 }]);
                        expect(combinedAction456Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction5.type]: 1, [NestedAsyncAction6.type]: 1 }
                        ]);
                    }));

                    it('should be executing on nested actions (scenario 4)', fakeAsync(() => {
                        const nestedAction4Status: ActionsExecuted[] = [];
                        const nestedAction5Status: ActionsExecuted[] = [];
                        const nestedAction6Status: ActionsExecuted[] = [];

                        const combinedAction45Status: ActionsExecuted[] = [];
                        const combinedAction456Status: ActionsExecuted[] = [];

                        store.select(actionsExecuted([NestedAsyncAction4])).subscribe((_actionsExecuted) => {
                            nestedAction4Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction5])).subscribe((_actionsExecuted) => {
                            nestedAction5Status.push(_actionsExecuted);
                        });

                        store.select(actionsExecuted([NestedAsyncAction6])).subscribe((_actionsExecuted) => {
                            nestedAction6Status.push(_actionsExecuted);
                        });

                        store
                            .select(actionsExecuted([NestedAsyncAction4, NestedAsyncAction5]))
                            .subscribe((_actionsExecuted) => {
                                combinedAction45Status.push(_actionsExecuted);
                            });

                        store
                            .select(actionsExecuted([NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6]))
                            .subscribe((_actionsExecuted) => {
                                combinedAction456Status.push(_actionsExecuted);
                            });

                        store.dispatch([new NestedAsyncAction4(), new NestedAsyncAction5(), new NestedAsyncAction6()]);
                        tick(1);
                        expect(nestedAction4Status).toEqual([null, { [NestedAsyncAction4.type]: 1 }]);
                        expect(nestedAction5Status).toEqual([null]);
                        expect(nestedAction6Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction6.type]: 2 },
                            { [NestedAsyncAction6.type]: 3 },
                            { [NestedAsyncAction6.type]: 3 }
                        ]);
                        tick(100);
                        expect(nestedAction4Status).toEqual([
                            null,
                            { [NestedAsyncAction4.type]: 1 },
                            { [NestedAsyncAction4.type]: 1 }
                        ]);
                        expect(nestedAction5Status).toEqual([null, { [NestedAsyncAction5.type]: 1 }]);
                        expect(nestedAction6Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction6.type]: 2 },
                            { [NestedAsyncAction6.type]: 3 },
                            { [NestedAsyncAction6.type]: 3 },
                            { [NestedAsyncAction6.type]: 3 }
                        ]);

                        expect(combinedAction45Status).toEqual([
                            null,
                            { [NestedAsyncAction4.type]: 1 },
                            { [NestedAsyncAction4.type]: 1, [NestedAsyncAction5.type]: 1 }
                        ]);
                        expect(combinedAction456Status).toEqual([
                            null,
                            { [NestedAsyncAction6.type]: 1 },
                            { [NestedAsyncAction6.type]: 2 },
                            {
                                [NestedAsyncAction6.type]: 3
                            },
                            {
                                [NestedAsyncAction4.type]: 1,
                                [NestedAsyncAction6.type]: 3
                            },
                            {
                                [NestedAsyncAction4.type]: 1,
                                [NestedAsyncAction5.type]: 1,
                                [NestedAsyncAction6.type]: 3
                            }
                        ]);
                    }));
                });
            });
        });

        describe('No Actions', () => {
            describe('sync', () => {
                it('should be executing between dispatch and complete', () => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new Action1());
                    store.dispatch(new Action2());
                    expect(actionStatus).toEqual([
                        null,
                        { [Action1.type]: 0 },
                        { [Action1.type]: 1 },
                        { [Action1.type]: 1, [Action2.type]: 0 },
                        { [Action1.type]: 1, [Action2.type]: 1 }
                    ]);
                });
            });

            describe('async', () => {
                it('should be executing between dispatch and complete ', fakeAsync(() => {
                    const actionStatus: ActionsExecuted[] = [];

                    store.select(actionsExecuted([])).subscribe((_actionsExecuted) => {
                        actionStatus.push(_actionsExecuted);
                    });

                    store.dispatch(new AsyncAction1());
                    tick(1);
                    expect(actionStatus).toEqual([null, { [AsyncAction1.type]: 0 }, { [AsyncAction1.type]: 1 }]);
                    store.dispatch(new AsyncAction2());
                    tick(1);
                    expect(actionStatus).toEqual([
                        null,
                        { [AsyncAction1.type]: 0 },
                        { [AsyncAction1.type]: 1 },
                        { [AsyncAction1.type]: 1, [AsyncAction2.type]: 0 },
                        { [AsyncAction1.type]: 1, [AsyncAction2.type]: 1 }
                    ]);
                }));
            });
        });
    });
});
