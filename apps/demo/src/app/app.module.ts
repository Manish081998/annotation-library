import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AnnotAngularModule } from '@adticorp/annot-angular';

import { AppComponent } from './app.component.js';
import { UnifiedDemoComponent } from './demos/unified-demo/unified-demo.component.js';

const ROUTES: Routes = [
  { path: '',       redirectTo: 'viewer', pathMatch: 'full' },
  { path: 'viewer', component: UnifiedDemoComponent },
  { path: '**',     redirectTo: 'viewer' },
];

@NgModule({
  declarations: [AppComponent, UnifiedDemoComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(ROUTES),
    AnnotAngularModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
