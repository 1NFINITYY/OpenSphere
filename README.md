# OpenSphere

OpenSphere is a Next.js-based rich text editor that implements **real-time visual pagination** using **Tiptap (ProseMirror)**.
It is designed to closely mimic **print-style documents (US Letter)** while still behaving like a modern web editor.

The core focus of this project is **layout-aware pagination**, where content dynamically flows across virtual pages as the user types.

---

## ✨ Key Features

- **Real-Time Visual Pagination**
  - Pages follow US Letter dimensions (8.5" × 11")
  - Automatic page breaks based on rendered content height

- **Tiptap-Powered Rich Text Editing**
  - Headings, paragraphs, lists
  - Bold, italic, text alignment
  - Tables with headers, rows, and cells

- **Print-Oriented Layout**
  - Accurate margins and spacing
  - Editor width matches printable documents

- **Modern UI Stack**
  - Tailwind CSS for styling
  - Clean, minimal editor interface

---

## 🛠 Tech Stack

### Frontend
- Next.js 16
- React 19
- Tiptap v3 (ProseMirror)
- Tailwind CSS
- clsx
- tailwind-merge

### Editor & Utilities
- @tiptap/starter-kit
- @tiptap/extension-table
- @tiptap/extension-text-align
- html2canvas
- jspdf

---

## 📦 Installation & Setup

Install dependencies:

    npm install

Run the development server:

    npm run dev

Open in browser:

    http://localhost:3000

---

## 🧠 Core Architecture & Approach

### Why Pagination Is Hard in Tiptap

Tiptap (built on ProseMirror) uses a **single contenteditable DOM tree**.
Unlike traditional document editors such as Microsoft Word or Google Docs, it has **no native concept of pages**.

This project simulates paged documents **without breaking ProseMirror’s document model**.

---

## 📄 Pagination Strategy

Pagination is handled through a **custom ProseMirror plugin** that measures rendered DOM content and inserts visual page breaks.

### How It Works

1. **Fixed Page Dimensions**
   - Page width matches US Letter size
   - Page height calculated in pixels
   - Margins applied using CSS

2. **DOM Measurement**
   - On every editor update:
     - Each top-level block is measured
     - Heights are accumulated until a page limit is reached

3. **Visual Page Breaks**
   - When content crosses a page boundary:
     - A widget decoration is inserted
     - This creates a visible gap between pages
   - Text continues to flow naturally

4. **No Document Mutation**
   - The ProseMirror document remains unchanged
   - Pagination is purely visual

---

## 🧩 Custom Pagination Extension

The core logic lives inside a custom pagination extension:

- Measures DOM nodes after render
- Maps DOM positions back to ProseMirror positions
- Inserts non-editable widget decorations
- Recalculates pagination on content changes

This approach ensures pagination stays **accurate, reactive, and editor-safe**.

---

## ⚠️ Trade-offs & Limitations

- **Large Paragraphs**
  - Paragraphs are treated as atomic blocks
  - If a paragraph exceeds remaining page space:
    - It may move entirely to the next page
    - Very large paragraphs can overflow a page
  - Text-level splitting is intentionally avoided

- **Performance**
  - DOM measurement runs on editor updates
  - Works well for medium-sized documents
  - Extremely large documents may require optimization

---

## 🚀 Future Improvements

- Smart paragraph splitting across pages
- Header and footer support
- True print-to-PDF parity
- Optimized pagination using observers
- Editable page size and margin presets

---

## 📁 Project Structure

    src/
    ├── app/
    │   ├── globals.css
    │   └── page.jsx
    │
    ├── components/
    │   ├── TiptapEditor.jsx
    │   └── PaginationExtension.js
    │
    └── styles/
        └── editor.css

---

## 📌 Summary

OpenSphere demonstrates how **print-style pagination** can be implemented in a modern web editor without modifying ProseMirror’s core document model.

It focuses on:
- Layout accuracy
- Real-time visual feedback
- Clean separation of concerns

This project works well as:
- A pagination proof-of-concept
- A foundation for document editors
- An advanced frontend engineering project

---

## 📄 License

This project is intended for educational and experimental purposes.
