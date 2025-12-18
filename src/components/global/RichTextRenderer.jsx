// src/components/global/RichTextRenderer.jsx
import React from 'react';
import 'react-quill-new/dist/quill.snow.css';

const RichTextRenderer = ({ htmlContent }) => {
  return (
    <div className="ql-container ql-snow" style={{ border: 'none', fontFamily: 'inherit' }}>
      <div
        className="ql-editor"
        style={{ fontFamily: 'inherit', padding: 0 }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default RichTextRenderer;