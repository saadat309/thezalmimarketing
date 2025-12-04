
import React, { useMemo } from "react";
import DOMPurify from "dompurify";

/**
 * Props:
 *  - data: Editor.js JSON (object)
 *
 * Notes:
 *  - tries to detect alignment from several places (block.data.alignment, block.data.align, block.data.style.textAlign)
 *  - sanitizes output via DOMPurify
 */
export default function RichTextRenderer({ data }) {
  const html = useMemo(() => {
    if (!data || !Array.isArray(data.blocks)) return "";

    const escape = (s) => (s == null ? "" : String(s));

    const getAlignment = (block) => {
      if (!block) return "left";
      // common places alignment plugin may store data
      const candidates = [
        block.data && (block.data.alignment || block.data.align || block.data.textAlign || block.data.alignmentValue),
        block.tunes && block.tunes.alignment && (block.tunes.alignment.value || block.tunes.alignment.alignment),
        block.data && block.data.style && block.data.style.textAlign,
      ];
      for (const c of candidates) {
        if (c === "left" || c === "center" || c === "right" || c === "justify") return c;
      }
      return "left";
    };

    const renderBlock = (block) => {
      const type = block.type;
      const d = block.data || {};
      const align = getAlignment(block);

      switch (type) {
        case "paragraph": {
          // Editor.js paragraph may store text as d.text (HTML fragments)
          const content = escape(d.text);
          return `<p style="text-align:${align}">${content}</p>`;
        }

        case "header": {
          const level = Math.min(6, Math.max(1, parseInt(d.level || 2, 10) || 2));
          const text = escape(d.text);
          return `<h${level} style="text-align:${align}">${text}</h${level}>`;
        }

        case "list": {
          const style = (d.style || "unordered") === "ordered" ? "ol" : "ul";
          const items = Array.isArray(d.items) ? d.items : [];
          const listItems = items.map((it) => `<li>${escape(it)}</li>`).join("");
          return `<${style} style="text-align:${align}">${listItems}</${style}>`;
        }

        case "checklist": {
          const items = Array.isArray(d.items) ? d.items : [];
          const rows = items
            .map((it) => {
              const checked = it.checked ? "checked" : "";
              return `<div class="ej-check" style="text-align:${align}"><label><input disabled type="checkbox" ${checked}/>&nbsp;${escape(it.text)}</label></div>`;
            })
            .join("");
          return `<div class="ej-checklist">${rows}</div>`;
        }

        case "quote": {
          const caption = d.caption ? `<cite>${escape(d.caption)}</cite>` : "";
          return `<blockquote style="text-align:${align}"><p>${escape(d.text)}</p>${caption}</blockquote>`;
        }

        case "table": {
          // d.content is expected to be array of rows (arrays)
          const rows = Array.isArray(d.content) ? d.content : [];
          const body = rows
            .map(
              (r) =>
                `<tr>${(Array.isArray(r) ? r : []).map((c) => `<td>${escape(c)}</td>`).join("")}</tr>`
            )
            .join("");
          return `<div style="text-align:${align}"><table class="ej-table">${body}</table></div>`;
        }

        case "embed": {
          // d.embed, d.source, d.service, d.caption, d.width, d.height
          // Render iframe for well-known services; fallback to link
          const src = escape(d.embed || d.source || d.url || d.embed_url || d.html);
          // Some embed blocks include raw html in d.html — we'll prefer iframe for known sources
          if (d.service && src) {
            return `<div style="text-align:${align}" class="ej-embed"><iframe src="${src}" frameborder="0" allowfullscreen></iframe>${
              d.caption ? `<div class="ej-embed-caption">${escape(d.caption)}</div>` : ""
            }</div>`;
          }
          // fallback: clickable link
          return `<div style="text-align:${align}"><a href="${src}" target="_blank" rel="noopener noreferrer">${escape(
            d.caption || d.embed || src
          )}</a></div>`;
        }

        case "delimiter":
          return `<hr/>`;

        case "marker": {
          const text = escape(d.text || "");
          return `<p style="text-align:${align}"><span style="background:yellow;padding:0.1em 0.2em">${text}</span></p>`;
        }

        default:
          // Fallback: show block type and its content (JSON)
          return `<pre style="text-align:${align}">[${escape(type)}] ${escape(JSON.stringify(d))}</pre>`;
      }
    };

    const parts = data.blocks.map((b) => renderBlock(b));
    return parts.join("\n");
  }, [data]);

  // sanitize with DOMPurify before injecting
  const safeHtml = typeof DOMPurify !== "undefined" ? DOMPurify.sanitize(html) : html;

  return <div className="editor-renderer" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
