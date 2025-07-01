# PDF-Related Packages in This Project

This document lists all packages used for PDF functionality in the `test-cra` project, along with their purpose and current version.

---

## 1. react-pdf
- **Version:** ^7.0.0
- **Description:**
  - Provides React components to display and work with PDF files in the browser.
  - Relies on `pdfjs-dist` for parsing and rendering PDF documents.
- **Documentation:** [react-pdf on npm](https://www.npmjs.com/package/react-pdf)

## 2. pdfjs-dist
- **Version:** ^2.16.105
- **Description:**
  - The official distribution of Mozilla's PDF.js library.
  - Used by `react-pdf` to parse and render PDF files.
- **Documentation:** [pdfjs-dist on npm](https://www.npmjs.com/package/pdfjs-dist)

## 3. react-dropzone
- **Version:** ^14.3.8
- **Description:**
  - Provides drag-and-drop file upload functionality in React applications.
  - Used in this project to allow users to upload or drag-and-drop PDF files for viewing.
- **Documentation:** [react-dropzone on npm](https://www.npmjs.com/package/react-dropzone)

---

## How These Packages Work Together
- `react-dropzone` is used to let users select or drag-and-drop PDF files.
- `react-pdf` renders the selected PDF files in the browser.
- `pdfjs-dist` is the underlying engine that parses and renders the PDF content for `react-pdf`.

---

**Note:**
- All versions are as specified in `package.json` as of this document's creation.
- For updates or troubleshooting, refer to the official documentation links above. 