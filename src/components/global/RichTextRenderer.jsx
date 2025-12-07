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