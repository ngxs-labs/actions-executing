import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { MultipleComponent } from './multiple.component';

@NgModule({
    declarations: [
        MultipleComponent
    ],
    imports: [
        CommonModule,
        NgxsModule.forFeature([]),
        RouterModule.forChild([{ path: '', component: MultipleComponent }])
    ]
})
export class SecondModule { }
