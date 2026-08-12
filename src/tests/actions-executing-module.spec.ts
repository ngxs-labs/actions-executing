import { NgxsActionsExecutingModule } from '..';

describe('actions-executing', () => {
  it('should successfully create module', () => {
    const ofExecModule = new NgxsActionsExecutingModule();

    expect(ofExecModule).toBeTruthy();
  });
});
