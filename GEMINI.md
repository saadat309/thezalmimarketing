# Project Overview

This is a web application built with [React](https://react.dev/) and [Vite](https://vitejs.dev/). It's a marketing website for a company called "The Zalmi Marketing".

## Technologies Used

*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **UI Components:** Radix UI, shadcn-ui
*   **Routing:** TanStack Router
*   **Linting:** ESLint

## Building and Running

To get the project up and running, use the following commands:

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Start the development server:**
    ```bash
    npm run dev
    ```
*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Lint the code:**
    ```bash
    npm run lint
    ```
*   **Preview the production build:**
    ```bash
    npm run preview
    ```

## Development Conventions

*   **Component-Based Architecture:** The project follows a component-based architecture. Components are organized in the `src/components` directory.
*   **File-Based Routing:** Routing is handled by [TanStack Router](https://tanstack.com/router/v1), which uses a file-based routing system. The routes are defined in the `src/routes` directory.
*   **Path Aliases:** The project uses path aliases to simplify imports. The `@` alias points to the `src` directory.
*   **Styling:** The project uses [Tailwind CSS](https://tailwindcss.com/) for styling. Utility classes are used to style the components.
*   **UI Components:** The project uses a combination of custom components and components from the [Radix UI](https://www.radix-ui.com/) and [shadcn-ui](https://ui.shadcn.com/) libraries.

## Rendering Rich Text Content

The rich text editor used in this project is based on [Quill](https://quilljs.com/) (via the `react-quill-new` package). It outputs HTML content. To render this content on the frontend, you need to use React's `dangerouslySetInnerHTML` and ensure Quill's stylesheet is available.

### Rich Text Renderer Component

It's recommended to create a dedicated component for rendering the rich text content. This ensures that the necessary styles and structure are applied consistently. A `RichTextRenderer.jsx` component has been created in `src/components/global/` for this purpose.

Here is the code for the `RichTextRenderer` component:

```jsx
// src/components/global/RichTextRenderer.jsx
import React from 'react';
import 'react-quill-new/dist/quill.snow.css';

const RichTextRenderer = ({ htmlContent }) => {
  return (
    <div className="ql-container ql-snow" style={{ border: 'none' }}>
      <div
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default RichTextRenderer;
```

### Usage

You can then use this component anywhere you need to display the rich text content.

```jsx
import RichTextRenderer from '@/components/global/RichTextRenderer';

// ...

const myRichTextData = "<p>This is some <strong>rich text</strong> content.</p>";

// ...

<RichTextRenderer htmlContent={myRichTextData} />
```

**Key Points:**

*   **`dangerouslySetInnerHTML`**: This is React's mechanism for rendering raw HTML. Use it with caution and only with trusted content to avoid XSS vulnerabilities.
*   **Quill Stylesheet**: The `import 'react-quill-new/dist/quill.snow.css';` line is crucial. It imports the necessary CSS for headings, lists, quotes, etc., to be styled correctly.
*   **CSS Classes**: The `.ql-container`, `.ql-snow`, and `.ql-editor` classes are required to apply the Quill styles to the rendered content.
*   **Border**: The `style={{ border: 'none' }}` is used to remove the default border that the `.ql-snow` class applies to the container, which is desirable for display-only purposes.
