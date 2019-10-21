import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { SingleComponent } from './single.component';
import { FormsModule } from '@angular/forms';
import { ZooState } from '../states/zoo/zoo.state';

@NgModule({
    declarations: [
        SingleComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgxsModule.forFeature([ZooState]),
        RouterModule.forChild([{ path: '', component: SingleComponent }])
    ]
})
export class FirstModule { }
