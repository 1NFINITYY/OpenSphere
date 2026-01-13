# Pagination & Editor System Documentation

This document explains the technical implementation of the pagination logic, print scaling, and editor features in the OpenSphere Tiptap editor.

## 1. Pagination Logic (`PaginationExtension.js`)

The pagination system is a custom Prosemirror plugin wrapped in a Tiptap extension. It calculates where page breaks should occur based on a fixed US Letter page height.

### Core Constants
-   **Page Height**: `1056px` (Standard US Letter height at 96 DPI).
-   **Margins**: `96px` top and bottom.
-   **Visual Gap**: `48px` between pages (in editor view).
-   **Content Height**: `864px` (1056px - 192px margins).

### How It Works
The plugin runs a `measureAndDecorate` function whenever the document changes:

1.  **Node Iteration**: It loops through every top-level node in the document.
2.  **Height Calculation**: It measures the `offsetHeight` of each node (including margins).
3.  **Accumulation**: It adds the node height to an `accumulatedHeight` counter for the current page.
4.  **Overflow Check**:
    -   **Atomic Nodes**: If a standard paragraph or element fits on the page, it stays. If adding it would exceed `864px`, the *entire node* is pushed to the next page.
        -   *Mechanism**: A `page-spacer` widget is inserted *before* the node. This spacer has a height equal to the remaining space on the previous page plus the visual gap.
    -   **Massive Nodes**: If a single node is taller than the entire page (e.g., a huge block of text), the logic switches to "Massive Node" mode.
        -   It uses binary search (`findSplitPosAbsolute`) to find the exact character offset where the page end occurs.
        -   It inserts an internal spacer at that split point to visually break the node across pages.

## 2. Print & Visual Styling (`globals.css`)

The system uses CSS to ensure the editor looks like a document on screen and prints perfectly to A4/Letter paper.

### Editor View
-   **Visual Page Breaks**: Achieved via the `.page-spacer` class. It creates a transparent block that pushes content to the next "visual page".
-   **Background**: A repeating linear gradient on `.print-container` creates the white page effect with transparent gaps.

### Print View (`@media print`)
-   **Scaling**: Since browsers often force A4, and our defined size is US Letter (816px wide), we apply a scale transform:
    ```css
    transform: scale(0.90);
    ```
    This shrinks the 816px content to fit within the printable area of an A4 sheet.
-   **Gap Removal**: The 48px visual gap seen in the editor is collapsed using negative margins (`margin-bottom: -48px`) so that content flows continuously from the bottom of Page 1 to the top of Page 2 without a white gap.
-   **Page Numbers**: Currently hidden via `display: none` on pseudo-elements.

## 3. Editor Features (`TiptapEditor.jsx`)

### Zoom
-   **State**: Managed via a `zoom` state variable (default 1.0).
-   **Implementation**: A CSS `transform: scale(zoom)` is applied to the `.print-container`.
-   **Controls**: +/- buttons increment/decrement the scale by 0.1.

### Toolbar
-   **Buttons**: Bold, Italic, Alignment (Left, Center, Right), Headings (H1, H2), Paragraph, Bullet List.
-   **Active State**: Buttons light up when your cursor is inside a supported format (using `editor.isActive()`).

### Print Button
-   Triggers a standard `window.print()`. The CSS `@media print` rules take over to format the output.
