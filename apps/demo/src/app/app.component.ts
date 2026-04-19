import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="demo-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`:host { display:flex; flex-direction:column; height:100%; }`],
})
export class AppComponent {}
