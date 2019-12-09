import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SingleComponent } from './single.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [SingleComponent],
    imports: [CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: SingleComponent }])]
})
export class FirstModule {}
