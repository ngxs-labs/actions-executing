import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'first',
    templateUrl: './second.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecondComponent {

}
