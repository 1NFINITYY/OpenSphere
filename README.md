# OpenSphere - Tiptap Pagination Assignment

This project implements a Tiptap-based document editor with real-time visual pagination, designed to match US Letter print output.

## Features

- **Visual Page Breaks**: Shows distinct pages (8.5" x 11") with 1-inch margins.
- **Real-time Pagination**: Automatically calculates content height and inserts visual separation between pages.
- **Standard Formatting**: Supports Headings, Lists, Bold, Italic, and Alignment.
- **Tech Stack**: Next.js, Tailwind CSS, Tiptap, ProseMirror.

## Setup Instructions

1.  **Installation**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Open Browser**:
    Navigate to `http://localhost:3000`.

## Architecture & approach

### Pagination Strategy
The core challenge was to display page breaks content using Tiptap (which uses a single `contenteditable` element) while mimicking a paged document.

My approach involved:
1.  **Visual Layout**: The editor container is styled to match US Letter dimensions (816px width).
2.  **Custom Extension (`PaginationExtension`)**: I created a ProseMirror plugin that hooks into the editor's update cycle.
    - It measures the rendered height of top-level blocks in the DOM.
    - It accumulates height relative to the page height (1056px).
    - When a block crosses a page boundary, it inserts a **Widget Decoration** (a visual spacer) that creates the appearance of a gap between pages.
    - This ensures that text flows naturally while giving the user feedback on where page breaks will occur.

### Trade-offs & Limitations
- **Splitting Paragraphs**: Currently, if a single paragraph exceeds the remaining space on a page, the *entire* paragraph is pushed to the next page (or cuts across if it's larger than a full page). I chose this trade-off to avoid the complexity of splitting text nodes or implementing a paged content model, which would significantly increase scope.
- **Performance**: Measuring DOM height on every update can be expensive for very large documents. I implemented basic throttling/checks, but for a production app, I would implement a more robust intersection observer or incremental measurement system.

### Future Improvements
1.  **Content Splitting**: Implement a sophisticated `Slice` logic to split long paragraphs across pages visually.
2.  **Header/Footer Support**: Use the widget decorations to render editable headers/footers in the gaps.
3.  **PDF Export**: Use `pagedjs` or Puppeteer to generate a PDF that matches the editor view exactly.

## Project Structure

- `src/components/TiptapEditor.jsx`: The main editor component.
- `src/components/PaginationExtension.js`: The custom logic for pagination measurements.
- `src/app/globals.css`: Global styles and print media queries.
