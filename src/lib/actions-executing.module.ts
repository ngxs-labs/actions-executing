import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ActionsExecutedState } from './actions-executed.state';
import { ActionsExecutingState } from './actions-executing.state';

@NgModule({
    imports: [NgxsModule.forFeature([ActionsExecutingState, ActionsExecutedState])]
})
export class NgxsActionsExecutingModule {
    public static forRoot(): ModuleWithProviders<NgxsActionsExecutingModule> {
        return {
            ngModule: NgxsActionsExecutingModule
        };
    }
}
