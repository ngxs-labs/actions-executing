<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

# NGXS Actions Executing

## Description

This plugin allows you to easily know if an action is being executed and control UI elements or control flow of your code to execute.
The most common scenarios for using this plugin are to display loading spinner or disable a button while an action is executing.

## Quick start

Install the plugin:

* npm

```console
npm install --save @ngxs-labs/actions-executing
```

* yarn

```console
yarn add @ngxs-labs/actions-executing
```

Next, include it in you `app.module.ts`

```ts
//...
import { NgxsModule } from '@ngxs/store';
import { NgxsActionsExecutingModule } from '@ngxs-labs/actions-executing';

@NgModule({
    //...
    imports: [
        //...
        NgxsModule.forRoot([
          //... your states
        ]),
        NgxsActionsExecutingModule.forRoot(),
    ],
    //...
})
export class AppModule { }
```

To use it on your components you just need to include the following `@Select()`

```ts
//...
import { actionsExecuting, ActionsExecuting } from '@ngxs-labs/actions-executing';

//...
export class SingleComponent {

  @Select(actionsExecuting([MyAction])) myActionIsExecuting$: Observable<ActionsExecuting>;

}

```

then you can disable a button or display a loading indicator very easily

```html

<button [disabled]="myActionIsExecuting$ | async"
        (click)="doSomething()"> 
  My Action 
</button>

<span *ngIf="myActionIsExecuting$ | async">
  Loading...
</span>

```
