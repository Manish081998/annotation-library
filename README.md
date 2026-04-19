# @adticorp/annotation-library

Enterprise-grade document annotation system for Angular applications.  
**Zero third-party runtime dependencies** — built on browser-native APIs only.

---

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────────┐
│  Host Application (Angular, React, vanilla, …)               │
│                                                              │
│  ┌───────────────┐   implements   ┌───────────────────────┐  │
│  │  Document     │ ─────────────▶ │  ViewportAdapter      │  │
│  │  Renderer     │               │  (coordinate bridge)  │  │
│  │  (PDF/image/  │               └──────────┬────────────┘  │
│  │   HTML/email) │                          │               │
│  └───────────────┘                          ▼               │
│                                  ┌───────────────────────┐  │
│  <company-annotator>             │  @adticorp/annot-core   │  │
│  ┌────────────┐                  │  AnnotationStore       │  │
│  │ Toolbar    │ ◀── Angular ──▶  │  CommandStack          │  │
│  │ Panel      │    signals/      │  Tools (Select/Draw/…) │  │
│  │ Overlay    │    events        │  Geometry engine       │  │
│  └──────────┬─┘                  └───────────┬────────────┘  │
│             │                                │               │
│             └──── @adticorp/annot-renderer ◀──┘               │
│                   (Canvas 2D, 3 layers,                      │
│                    RAF loop, hit testing)                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Packages

| Package | Description |
|---------|-------------|
| `@adticorp/annot-core` | Pure TypeScript engine — data model, geometry, commands, tools, adapters |
| `@adticorp/annot-renderer` | Canvas 2D renderer, layer manager, pointer handler |
| `@adticorp/annot-angular` | Angular components, services, module |
| `apps/demo` | Demo Angular app (image, PDF, email demos) |

---

## Quick Start

### 1. Install

```bash
npm install @adticorp/annot-core @adticorp/annot-renderer @adticorp/annot-angular
```

### 2. Import the module

```typescript
// app.module.ts
import { AnnotAngularModule } from '@adticorp/annot-angular';

@NgModule({
  imports: [AnnotAngularModule],
})
export class AppModule {}
```

### 3. Implement an adapter

```typescript
import { SingleSurfaceAdapter } from '@adticorp/annot-core';

// For a simple image or HTML surface:
const adapter = new SingleSurfaceAdapter({
  docWidth: 1200,   // document native width (image pixels, PDF units, etc.)
  docHeight: 800,
});

// Notify the adapter when zoom/pan changes in the host:
adapter.notifyViewportChanged();
```

### 4. Use the component

```html
<company-annotator
  [adapter]="adapter"
  [docId]="'my-document-001'"
  [author]="currentUser.name"
  [showToolbar]="true"
  [showPanel]="true"
  [autoSave]="true"
  (annotationsChange)="onAnnotationsChange($event)"
  (save)="onSave($event)"
  style="width: 100%; height: 600px;">
</company-annotator>
```

---

## Features

| Feature | Status |
|---------|--------|
| Select / Move / Resize | ✅ |
| Highlight (rect) | ✅ |
| Pen / Freehand strokes | ✅ |
| Text box (with inline edit) | ✅ |
| Comment / Sticky note | ✅ |
| Rectangle | ✅ |
| Ellipse | ✅ |
| Arrow | ✅ |
| Line | ✅ |
| Eraser (whole-annotation) | ✅ |
| Colour / stroke width / opacity | ✅ |
| Zoom / pan / rotate integration | ✅ |
| Multi-page support | ✅ |
| Undo / Redo (Ctrl+Z / Ctrl+Y) | ✅ |
| Keyboard accessibility | ✅ |
| Touch / Pointer Events | ✅ |
| JSON import / export | ✅ |
| localStorage auto-save | ✅ |
| 500+ annotations per page | ✅ (layered Canvas) |
| High-DPI (devicePixelRatio) | ✅ |
| Schema versioning / migrations | ✅ |
| XSS prevention (text sanitisation) | ✅ |
| PDF byte-embedding | 🔲 Phase 2 (server-side) |

---

## Coordinate System

All annotation geometry is stored in **document coordinates** — the native
unit space of the document (image pixels, PDF user units, etc.).

The `ViewportAdapter` translates between document ↔ screen coordinates on
every render frame and pointer event.

```
Document coordinates           Screen coordinates
(stored in JSON)               (rendered on canvas)

(0,0) ─────────────────        (panX, panY)
  │                               │
  │  docPoint                     │  docPoint × zoom + pan
  │                               │
  └─────────────────────         └─────────────────────
```

---

## Adapter Interface

```typescript
interface ViewportAdapter {
  getViewportTransform(): { zoom, panX, panY, rotation };
  screenToDoc(screenPoint, pageIndex): Point;
  docToScreen(docPoint, pageIndex): Point;
  getPageInfo(pageIndex): { width, height, screenOffsetX, screenOffsetY };
  getActivePageIndex(): number;
  getVisiblePageIndices(): number[];
  onViewportChange?(listener: () => void): () => void;
}
```

Two built-in adapters are provided:
- `SingleSurfaceAdapter` — single image / HTML surface
- `MultiPageScrollAdapter` — vertically scrolled multi-page document

---

## Annotation JSON Schema

```json
{
  "schemaVersion": 1,
  "id": "uuid",
  "docId": "string",
  "pageIndex": 0,
  "type": "highlight | freehand | text | comment | rectangle | ellipse | arrow | line",
  "author": "string",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "isLocked": false,
  "style": {
    "strokeColor": "#RRGGBB or rgba(...)",
    "fillColor": "...",
    "opacity": 0.0–1.0,
    "strokeWidth": 2,
    "fontSize": 14,
    "fontFamily": "Arial, sans-serif",
    "fontColor": "#000",
    "dashPattern": [],
    "lineJoin": "round",
    "lineCap": "round"
  },
  "geometry": {
    "kind": "rect | path | point | line",
    "rect": { "x": 0, "y": 0, "width": 100, "height": 50 },
    "points": [{ "x": 0, "y": 0 }, ...],
    "bounds": { "x": 0, "y": 0, "width": 100, "height": 50 },
    "closed": false,
    "point": { "x": 0, "y": 0 },
    "startPoint": { "x": 0, "y": 0 },
    "endPoint": { "x": 100, "y": 0 },
    "hasArrowHead": true,
    "hasArrowTail": false
  },
  "meta": {
    "text": "sanitised plain text",
    "tags": ["string"],
    "status": "open | resolved | wontfix",
    "comments": [{ "id": "...", "author": "...", "text": "...", "createdAt": "..." }]
  }
}
```

See `example-annotations.json` for a full multi-type example.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Ctrl+A` | Select all |
| `Escape` | Clear selection |
| `Delete` / `Backspace` | Delete selected |
| `Arrow keys` | Nudge selected (1 unit) |
| `Shift+Arrow` | Nudge selected (10 units) |
| `V` | Select tool |
| `H` | Highlight tool |
| `D` / `P` | Draw/Pen tool |
| `T` | Text tool |
| `C` | Comment tool |
| `R` | Rectangle tool |
| `E` | Ellipse tool |
| `A` | Arrow tool |
| `L` | Line tool |
| `X` | Eraser tool |

---

## How to Integrate in Angular

### With autoSave to localStorage

```typescript
@Component({
  template: `
    <company-annotator
      [adapter]="adapter"
      docId="invoice-2026-001"
      author="John Smith"
      [autoSave]="true"
      (save)="onSave($event)">
    </company-annotator>
  `
})
export class MyComponent implements AfterViewInit {
  adapter = new SingleSurfaceAdapter({ docWidth: 1200, docHeight: 900 });

  onSave(json: string): void {
    // Send to your API
    this.http.post('/api/annotations', { json }).subscribe();
  }
}
```

### Load annotations from server

```typescript
@Component({
  template: `<company-annotator [adapter]="adapter" [initialAnnotations]="annotations">`
})
export class MyComponent implements OnInit {
  annotations: Annotation[] = [];
  adapter = new SingleSurfaceAdapter({ docWidth: 800, docHeight: 1100 });

  ngOnInit(): void {
    this.http.get<AnnotationDocument>('/api/annotations/doc-1').subscribe(doc => {
      const { document } = importFromJson(JSON.stringify(doc));
      this.annotations = [...document.annotations];
    });
  }
}
```

---

## How to Write a New Tool

1. Implement the `Tool` interface from `@adticorp/annot-core`:

```typescript
import type { Tool, ToolContext, ToolPointerEvent, Command } from '@adticorp/annot-core';

export class MyCustomTool implements Tool {
  readonly id = 'my-tool';
  readonly name = 'My Tool';
  readonly cursor = 'crosshair';

  activate(ctx: ToolContext): void {}
  deactivate(ctx: ToolContext): void {}

  onPointerDown(evt: ToolPointerEvent, ctx: ToolContext): Command | null {
    // Create an annotation using buildAnnotation() helper, return AddAnnotationCommand
    return null;
  }
  onPointerMove(evt: ToolPointerEvent, ctx: ToolContext): Command | null { return null; }
  onPointerUp(evt: ToolPointerEvent, ctx: ToolContext): Command | null { return null; }

  drawOverlay(ctx2d: CanvasRenderingContext2D, ctx: ToolContext): void {
    // Draw preview graphics on the overlay canvas
  }
}
```

2. Register it in `AnnotationEngineService`:

```typescript
this.tools.set('my-tool' as ToolId, new MyCustomTool());
```

3. Add a toolbar button for it.

**Rules:**
- Never mutate the store directly — return a `Command`.
- All geometry in document coordinates.
- Call `ctx.requestRedraw()` for live preview (not on every event — only when visual state changes).
- Clean up any subscriptions in `deactivate()`.

---

## Performance Notes

- **Layered canvas**: base (non-selected), selection, overlay — only dirty layers rerender.
- **RAF loop**: overlay repaints every frame; base/selection only when store/selection changes.
- **Douglas–Peucker simplification**: freehand strokes are simplified on pointer-up.
- **AABB quick-reject**: hit-testing skips annotations whose bounding box misses the point.
- **500+ annotations**: verified design — base layer is a single drawImage call per frame
  when unchanged.

---

## Phase 2 – Server-Side PDF Embedding

Embedding annotations directly into PDF bytes is deliberately out of scope for
this browser library because:

1. PDF binary editing requires a complete parser/writer for the PDF spec.
2. No compliant implementation exists without significant native code.
3. Server-side rendering produces archival-quality, verifiable output.

**Recommended Phase 2 approach:**
- POST the annotation JSON to a server endpoint.
- Server uses a PDF library (iText, PDFBox, Aspose) to merge annotations.
- Return the annotated PDF blob.

The annotation JSON schema is designed for this: document coordinates map
directly to PDF user units when the adapter is configured with the PDF page
dimensions.

---

## Build Instructions

```bash
# Install all workspace dependencies
npm install

# Build packages in dependency order
npm run build:core      # packages/annot-core
npm run build:renderer  # packages/annot-renderer
npm run build:angular   # packages/annot-angular

# Run tests
npm run test:core

# Start the demo app
npm run demo
```

---

## Repository Structure

```
annotation-library/
├── packages/
│   ├── annot-core/          # Pure TS: model, geometry, commands, tools, adapters
│   │   ├── src/
│   │   │   ├── model/       # Annotation types, JSON schema, migrations
│   │   │   ├── geometry/    # Point/rect ops, hit-testing
│   │   │   ├── commands/    # Command pattern (undo/redo)
│   │   │   ├── store/       # Observable annotation store
│   │   │   ├── tools/       # All tool implementations
│   │   │   ├── adapter/     # ViewportAdapter interface + defaults
│   │   │   ├── events/      # TypedEventEmitter
│   │   │   └── serialization/  # Import/export
│   │   └── tests/           # Jest unit tests
│   │
│   ├── annot-renderer/      # Canvas 2D renderer
│   │   └── src/
│   │       ├── canvas/      # LayerManager, painters, main renderer
│   │       └── interaction/ # PointerHandler
│   │
│   └── annot-angular/       # Angular integration
│       └── src/lib/
│           ├── components/  # AnnotatorComponent, Toolbar, Panel
│           └── services/    # AnnotationEngineService, KeyboardHandlerService
│
├── apps/
│   └── demo/                # Angular demo app
│       └── src/app/
│           ├── adapters/    # ImageAdapter, EmailAdapter, PdfViewerAdapter
│           └── demos/       # image-demo, pdf-demo, email-demo components
│
├── example-annotations.json # Sample annotation JSON
├── tsconfig.base.json
├── package.json             # npm workspaces root
└── README.md
```

---

## Security

- **XSS prevention**: all user-entered text is HTML-entity-escaped in `sanitiseText()`
  before storage and de-escaped only at paint time via `desanitiseText()`.
- **No innerHTML**: text rendering uses Canvas `fillText()` only — no DOM injection.
- **CSP friendly**: no `eval()`, no dynamic script loading.
- **Memory safety**: `ResizeObserver`, event listeners, and RAF loops are all
  removed in `destroy()` / `ngOnDestroy()`.
