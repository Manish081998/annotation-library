/**
 * @file unified-demo.component.ts
 * Thin demo wrapper around <annot-viewer>.
 * The <annot-viewer> component is self-contained and handles everything;
 * this component just wires up the outer page chrome.
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { Annotation } from '@adticorp/annot-core';

@Component({
  selector: 'app-unified-demo',
  templateUrl: './unified-demo.component.html',
  styleUrls: ['./unified-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnifiedDemoComponent {
  lastSavedAt: string | null = null;

  onAnnotationsChange(_annotations: ReadonlyArray<Annotation>): void {
    // Available for parent app wiring (e.g. persist to server)
  }

  onSaveComplete(): void {
    this.lastSavedAt = new Date().toLocaleTimeString();
  }
}
