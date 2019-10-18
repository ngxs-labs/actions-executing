import { NgxsActionsExecutingModule } from '..';

describe('of-executing', () => {

  it('should successfully create module', () => {
    const ofExecModule = new NgxsActionsExecutingModule();

    expect(ofExecModule).toBeTruthy();
  });
});
