import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import EditorJS from "@editorjs/editorjs";

import Header from "@editorjs/header";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";
import Table from "@editorjs/table";
import Checklist from "@editorjs/checklist";
import Delimiter from "@editorjs/delimiter";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";

import AlignmentTune from "editorjs-text-alignment-blocktune";

/**
 * RichEditor (no Image tool)
 *
 * Props:
 * - holderId (string) default "editorjs"
 * - initialData (object) editorjs initial data
 * - onChange (fn) called with JSON when editor changes
 * - readOnly (bool)
 * - autofocus (bool)
 *
 * Ref API:
 * - save(): Promise<editorJson>
 * - destroy()
 */
const RichText = forwardRef(function RichText(
  {
    holderId = "editorjs",
    initialData = null,
    onChange = null,
    readOnly = false,
    autofocus = false,
  },
  ref
) {
  const editorInstanceRef = useRef(null);

  useImperativeHandle(ref, () => ({
    async save() {
      if (!editorInstanceRef.current) return null;
      try {
        return await editorInstanceRef.current.save();
      } catch (err) {
        console.error("Editor save error:", err);
        throw err;
      }
    },
    async destroy() {
      if (editorInstanceRef.current) {
        await editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    },
  }));

  useEffect(() => {
    // Initialize editor (editable mode)
    const editor = new EditorJS({
      holder: holderId,
      data: initialData || {},
      autofocus,
      readOnly: !!readOnly,

      onReady: () => {
        editorInstanceRef.current = editor;
      },

      tools: {
        header: { class: Header, tunes: ["alignment"] },
        list: { class: List, inlineToolbar: true, tunes: ["alignment"] },
        embed: { class: Embed, tunes: ["alignment"] },
        table: { class: Table },
        checklist: { class: Checklist },
        delimiter: { class: Delimiter },
        marker: { class: Marker },
        quote: { class: Quote, tunes: ["alignment"] },

        // alignment tool registration
        alignment: {
          class: AlignmentTune,
          config: {
            default: "left",
            blocks: {
              header: "center",
              paragraph: "left",
              list: "left",
              quote: "left",
            },
          },
        },
      },

      /**
       * onChange: call api.saver.save() and forward JSON to parent onChange
       */
      onChange: async (api) => {
        if (typeof onChange !== "function") return;
        try {
          const savedData = await api.saver.save();
          onChange(savedData);
        } catch (err) {
          // ignore transient save failures but log
          console.warn("EditorJS onChange save failed:", err);
        }
      },
    });

    return () => {
      // cleanup editor instance
      if (editorInstanceRef.current) {
        editorInstanceRef.current.isReady
          .then(() => editorInstanceRef.current.destroy())
          .catch(() => {})
          .finally(() => (editorInstanceRef.current = null));
      } else {
        editor.isReady.then(() => editor.destroy()).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holderId, initialData, readOnly, autofocus]);

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <div id={holderId} className="min-h-[220px]" />
    </div>
  );
});

export default RichText;
