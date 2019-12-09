import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MultipleComponent } from './multiple.component';

@NgModule({
    declarations: [MultipleComponent],
    imports: [CommonModule, RouterModule.forChild([{ path: '', component: MultipleComponent }])]
})
export class SecondModule {}
