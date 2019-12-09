import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { ActionsExecutingState } from './actions-executing.state';

@NgModule({
    imports: [NgxsModule.forFeature([ActionsExecutingState])]
})
export class NgxsActionsExecutingModule {
    public static forRoot(): ModuleWithProviders<NgxsActionsExecutingModule> {
        return {
            ngModule: NgxsActionsExecutingModule
        };
    }
}
