import { NgxsActionsExecutingModule, ActionsExecuting, actionsExecuting } from '..';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsModule, Store, Actions, State, Action } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('actionsExecuting', () => {

  let store: Store;
  let actions: Actions;

  class Action1 {
    static type = 'ACTION 1';
  }

  class Action2 {
    static type = 'ACTION 2';
  }

  class ErrorAction1 {
    static type = 'ERROR ACTION 1';
  }

  class AsyncAction1 {
    static type = 'ASYNC ACTION 1';
  }

  class AsyncAction2 {
    static type = 'ASYNC ACTION 2';
  }

  class AsyncErrorAction1 {
    static type = 'ASYNC ERROR ACTION 1';
  }

  @State({
    name: 'test'
  })
  class TestState {
    @Action([Action1])
    action1() { }

    @Action([AsyncAction1])
    asyncAction1() {
      return of({}).pipe(delay(0));
    }

    @Action([AsyncAction2])
    asyncAction2() {
      return of({}).pipe(delay(0));
    }

    @Action(AsyncErrorAction1)
    asyncError() {
      return throwError(new Error('this is a test error')).pipe(delay(0));
    }

    @Action(ErrorAction1)
    onError() {
      return throwError(new Error('this is a test error'));
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([
          TestState
        ]),
        NgxsActionsExecutingModule.forRoot()
      ]
    });

    store = TestBed.get(Store);
    actions = TestBed.get(Actions);
  });

  describe('Single Action', () => {
    describe('Sync Action', () => {
      it('should be null', () => {
        store.dispatch(Action1);


        const snapshot = store.selectSnapshot(actionsExecuting([Action1]));
        expect(snapshot).toBe(null);
      });
    });

    describe('Async Action', () => {
      it('should be null', fakeAsync(() => {
        store.dispatch(AsyncAction1);

        let snapshot = store.selectSnapshot(actionsExecuting([AsyncAction1]));
        expect(snapshot).toEqual({ 'ASYNC ACTION 1': 1 });

        tick();

        snapshot = store.selectSnapshot(actionsExecuting([AsyncAction1]));
        expect(snapshot).toBe(null);
      }));
    });
  });

  describe('Single Action', () => {
    describe('Sync', () => {
      it('should be executing between dispatch and complete', () => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting([Action1])).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new Action1());
        expect(actionStatus).toEqual([null, { [Action1.type]: 1 }, null]);
      });

      it('should be executing between dispatch and error', () => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting([ErrorAction1])).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new ErrorAction1());
        expect(actionStatus).toEqual([null, { [ErrorAction1.type]: 1 }, null]);
      });
    });
    describe('async', () => {
      it('should be executing between dispatch and complete ', fakeAsync(() => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting([AsyncAction1])).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new AsyncAction1());
        tick(1);
        expect(actionStatus).toEqual([null, { [AsyncAction1.type]: 1 }, null]);
      }));

      it('should be executing between dispatch and error', fakeAsync(() => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting([AsyncErrorAction1])).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new AsyncErrorAction1()).subscribe({
          error: err => {
            expect(err).toBeDefined();
          }
        });

        tick(1);
        expect(actionStatus).toEqual([null, { [AsyncErrorAction1.type]: 1 }, null]);
      }));
    });
  });

  describe('Multiple Actions', () => {
    describe('sync', () => {
      it('should be executing between dispatch and complete', () => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting([Action1, Action2])).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new Action1());
        store.dispatch(new Action2());
        expect(actionStatus).toEqual([
          null,
          { [Action1.type]: 1, [Action2.type]: 1 },
          null
        ]);
      });

      it('should be executing between dispatch and error', () => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting([Action1, ErrorAction1])).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new Action1());
        store.dispatch(new ErrorAction1());
        expect(actionStatus).toEqual([
          null,
          { [Action1.type]: 1, [ErrorAction1.type]: 1 },
          null
        ]);
      });
    });
    describe('async', () => {
      it('should be executing between dispatch and complete ', fakeAsync(() => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting([AsyncAction1, AsyncAction2])).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new AsyncAction1());
        tick(1);
        expect(actionStatus).toEqual([
          null, { [AsyncAction1.type]: 1 }, null
        ]);
        store.dispatch(new AsyncAction2());
        tick(1);
        expect(actionStatus).toEqual([
          null,
          { [AsyncAction1.type]: 1 },
          null,
          { [AsyncAction2.type]: 1 },
          null
        ]);
      }));

      it('should be executing between dispatch and error', fakeAsync(() => {
        const actionStatus: ActionsExecuting[] = [];

        store
          .select(actionsExecuting([AsyncAction1, AsyncErrorAction1]))
          .subscribe(actionsExecuting => {
            actionStatus.push(actionsExecuting);
          });

        store.dispatch(new AsyncAction1());
        tick(1);
        expect(actionStatus).toEqual([
          null, { [AsyncAction1.type]: 1 }, null
        ]);
        store.dispatch(new AsyncErrorAction1());
        tick(1);
        expect(actionStatus).toEqual([
          null, { [AsyncAction1.type]: 1 }, null
        ]);
      }));

      it('should be executing when action is dispatched multiple times', fakeAsync(() => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting(AsyncAction1)).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new AsyncAction1());
        expect(actionStatus).toEqual([true]);
        store.dispatch(new AsyncAction1());
        tick(1);
        expect(actionStatus).toEqual([true, true, true, false]);
      }));

      it('should be executing when action is dispatched multiple times (case 2)', fakeAsync(() => {
        const actionStatus: ActionsExecuting[] = [];

        store.select(actionsExecuting(AsyncAction1)).subscribe(actionsExecuting => {
          actionStatus.push(actionsExecuting);
        });

        store.dispatch(new AsyncAction1());
        store.dispatch(new AsyncAction1());
        expect(actionStatus).toEqual([true, true]);
        tick(1);
        expect(actionStatus).toEqual([true, true, true, false]);
      }));

      // describe('nested actions 1', () => {
      //   it('should be executing on nested actions', fakeAsync(() => {
      //     const nestedAction1Status: ActionsExecuting[] = [];
      //     const nestedAction2Status: ActionsExecuting[] = [];
      //     const nestedAction3Status: ActionsExecuting[] = [];

      //     const combinedActionStatus: ActionsExecuting[] = [];

      //     store.select(actionsExecuting(NestedAsyncAction1)).subscribe(actionsExecuting => {
      //       nestedAction1Status.push(actionsExecuting);
      //     });

      //     store.select(actionsExecuting(NestedAsyncAction2)).subscribe(actionsExecuting => {
      //       nestedAction2Status.push(actionsExecuting);
      //     });

      //     store.select(actionsExecuting(NestedAsyncAction3)).subscribe(actionsExecuting => {
      //       nestedAction3Status.push(actionsExecuting);
      //     });

      //     actions
      //       .pipe(
      //         ofActionExecuting(NestedAsyncAction1, NestedAsyncAction2, NestedAsyncAction3)
      //       )
      //       .subscribe(actionsExecuting => {
      //         combinedActionStatus.push(actionsExecuting);
      //       });

      //     store.dispatch(new NestedAsyncAction1());
      //     tick(1);
      //     expect(nestedAction1Status).toEqual([true, false]);
      //     expect(nestedAction2Status).toEqual([true, false]);
      //     expect(nestedAction3Status).toEqual([true, false]);

      //     expect(combinedActionStatus).toEqual([true, true, true, false]);
      //   }));
      // });

      // describe('nested actions 2', () => {
      //   it('should be executing on nested actions (scenario 1)', fakeAsync(() => {
      //     const nestedAction4Status: ActionsExecuting[] = [];
      //     const nestedAction5Status: ActionsExecuting[] = [];
      //     const nestedAction6Status: ActionsExecuting[] = [];

      //     const combinedAction45Status: ActionsExecuting[] = [];
      //     const combinedAction456Status: ActionsExecuting[] = [];

      //     store.select(actionsExecuting(NestedAsyncAction4)).subscribe(actionsExecuting => {
      //       nestedAction4Status.push(actionsExecuting);
      //     });

      //     store.select(actionsExecuting(NestedAsyncAction5)).subscribe(actionsExecuting => {
      //       nestedAction5Status.push(actionsExecuting);
      //     });

      //     store.select(actionsExecuting(NestedAsyncAction6)).subscribe(actionsExecuting => {
      //       nestedAction6Status.push(actionsExecuting);
      //     });

      //     actions
      //       .pipe(ofActionExecuting(NestedAsyncAction4, NestedAsyncAction5))
      //       .subscribe(actionsExecuting => {
      //         combinedAction45Status.push(actionsExecuting);
      //       });

      //     actions
      //       .pipe(
      //         ofActionExecuting(NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6)
      //       )
      //       .subscribe(actionsExecuting => {
      //         combinedAction456Status.push(actionsExecuting);
      //       });

      //     store.dispatch(new NestedAsyncAction4());
      //     tick(1);
      //     expect(nestedAction4Status).toEqual([true, false]);
      //     expect(nestedAction5Status).toEqual([]);
      //     expect(nestedAction6Status).toEqual([true, false]);

      //     expect(combinedAction45Status).toEqual([]);
      //     expect(combinedAction456Status).toEqual([]);
      //   }));

      //   it('should be executing on nested actions (scenario 2)', fakeAsync(() => {
      //     const nestedAction4Status: ActionsExecuting[] = [];
      //     const nestedAction5Status: ActionsExecuting[] = [];
      //     const nestedAction6Status: ActionsExecuting[] = [];

      //     const combinedAction45Status: ActionsExecuting[] = [];
      //     const combinedAction456Status: ActionsExecuting[] = [];

      //     store.select(actionsExecuting(NestedAsyncAction4)).subscribe(actionsExecuting => {
      //       nestedAction4Status.push(actionsExecuting);
      //     });

      //     store.select(actionsExecuting(NestedAsyncAction5)).subscribe(actionsExecuting => {
      //       nestedAction5Status.push(actionsExecuting);
      //     });

      //     store.select(actionsExecuting(NestedAsyncAction6)).subscribe(actionsExecuting => {
      //       nestedAction6Status.push(actionsExecuting);
      //     });

      //     actions
      //       .pipe(ofActionExecuting(NestedAsyncAction4, NestedAsyncAction5))
      //       .subscribe(actionsExecuting => {
      //         combinedAction45Status.push(actionsExecuting);
      //       });

      //     actions
      //       .pipe(
      //         ofActionExecuting(NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6)
      //       )
      //       .subscribe(actionsExecuting => {
      //         combinedAction456Status.push(actionsExecuting);
      //       });

      //     store.dispatch([new NestedAsyncAction4(), new NestedAsyncAction5()]);
      //     tick(1);
      //     expect(nestedAction4Status).toEqual([true, false]);
      //     expect(nestedAction5Status).toEqual([true]);
      //     expect(nestedAction6Status).toEqual([true, true, true, false]);
      //     tick(100);
      //     expect(nestedAction4Status).toEqual([true, false]);
      //     expect(nestedAction5Status).toEqual([true, false]);
      //     expect(nestedAction6Status).toEqual([true, true, true, false]);

      //     expect(combinedAction45Status).toEqual([true, true, false]);
      //     expect(combinedAction456Status).toEqual([true, true, true, true, true, false]);
      //   }));
      // });

      // it('should be executing on nested actions (scenario 3)', fakeAsync(() => {
      //   const nestedAction4Status: ActionsExecuting[] = [];
      //   const nestedAction5Status: ActionsExecuting[] = [];
      //   const nestedAction6Status: ActionsExecuting[] = [];

      //   const combinedAction45Status: ActionsExecuting[] = [];
      //   const combinedAction456Status: ActionsExecuting[] = [];

      //   store.select(actionsExecuting(NestedAsyncAction4)).subscribe(actionsExecuting => {
      //     nestedAction4Status.push(actionsExecuting);
      //   });

      //   store.select(actionsExecuting(NestedAsyncAction5)).subscribe(actionsExecuting => {
      //     nestedAction5Status.push(actionsExecuting);
      //   });

      //   store.select(actionsExecuting(NestedAsyncAction6)).subscribe(actionsExecuting => {
      //     nestedAction6Status.push(actionsExecuting);
      //   });

      //   actions
      //     .pipe(ofActionExecuting(NestedAsyncAction4, NestedAsyncAction5))
      //     .subscribe(actionsExecuting => {
      //       combinedAction45Status.push(actionsExecuting);
      //     });

      //   actions
      //     .pipe(
      //       ofActionExecuting(NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6)
      //     )
      //     .subscribe(actionsExecuting => {
      //       combinedAction456Status.push(actionsExecuting);
      //     });

      //   store.dispatch(new NestedAsyncAction5());
      //   tick(1);
      //   expect(nestedAction4Status).toEqual([]);
      //   expect(nestedAction5Status).toEqual([true]);
      //   expect(nestedAction6Status).toEqual([true, false]);
      //   tick(100);
      //   expect(nestedAction4Status).toEqual([]);
      //   expect(nestedAction5Status).toEqual([true, false]);
      //   expect(nestedAction6Status).toEqual([true, false]);

      //   expect(combinedAction45Status).toEqual([]);
      //   expect(combinedAction456Status).toEqual([]);
      // }));

      // it('should be executing on nested actions (scenario 4)', fakeAsync(() => {
      //   const nestedAction4Status: ActionsExecuting[] = [];
      //   const nestedAction5Status: ActionsExecuting[] = [];
      //   const nestedAction6Status: ActionsExecuting[] = [];

      //   const combinedAction45Status: ActionsExecuting[] = [];
      //   const combinedAction456Status: ActionsExecuting[] = [];

      //   store.select(actionsExecuting(NestedAsyncAction4)).subscribe(actionsExecuting => {
      //     nestedAction4Status.push(actionsExecuting);
      //   });

      //   store.select(actionsExecuting(NestedAsyncAction5)).subscribe(actionsExecuting => {
      //     nestedAction5Status.push(actionsExecuting);
      //   });

      //   store.select(actionsExecuting(NestedAsyncAction6)).subscribe(actionsExecuting => {
      //     nestedAction6Status.push(actionsExecuting);
      //   });

      //   actions
      //     .pipe(ofActionExecuting(NestedAsyncAction4, NestedAsyncAction5))
      //     .subscribe(actionsExecuting => {
      //       combinedAction45Status.push(actionsExecuting);
      //     });

      //   actions
      //     .pipe(
      //       ofActionExecuting(NestedAsyncAction4, NestedAsyncAction5, NestedAsyncAction6)
      //     )
      //     .subscribe(actionsExecuting => {
      //       combinedAction456Status.push(actionsExecuting);
      //     });

      //   store.dispatch([
      //     new NestedAsyncAction4(),
      //     new NestedAsyncAction5(),
      //     new NestedAsyncAction6()
      //   ]);
      //   tick(1);
      //   expect(nestedAction4Status).toEqual([true, false]);
      //   expect(nestedAction5Status).toEqual([true]);
      //   expect(nestedAction6Status).toEqual([true, true, true, true, true, false]);
      //   tick(100);
      //   expect(nestedAction4Status).toEqual([true, false]);
      //   expect(nestedAction5Status).toEqual([true, false]);
      //   expect(nestedAction6Status).toEqual([true, true, true, true, true, false]);

      //   expect(combinedAction45Status).toEqual([true, true, false]);
      //   expect(combinedAction456Status).toEqual([
      //     true,
      //     true,
      //     true,
      //     true,
      //     true,
      //     true,
      //     true,
      //     false
      //   ]);
      // }));
    });
  });
});
