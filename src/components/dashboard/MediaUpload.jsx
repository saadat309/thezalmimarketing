import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  PlusCircle,
  FileText,
  Video,
} from "lucide-react"; // Added FileText and Video icons
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Helper for deep comparison of media item arrays (Moved outside component)
function areMediaItemsEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    // Compare relevant properties for equality (excluding `file` object and URL.createObjectURL generated URLs)
    // Ensure `item.url` is treated as a string for comparison.
    const url1 = arr1[i].url === null || arr1[i].url === undefined ? '' : String(arr1[i].url);
    const url2 = arr2[i].url === null || arr2[i].url === undefined ? '' : String(arr2[i].url);

    if (
      arr1[i].id !== arr2[i].id ||
      arr1[i].type !== arr2[i].type ||
      url1 !== url2
    ) {
      return false;
    }
  }
  return true;
}

// Sortable Media Item Component
const SortableMediaItem = ({ item, onRemove }) => {
  const { id, url, type, file } = item;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : "auto",
  };

  const fileName = file?.name || (typeof url === 'string' ? url.substring(url.lastIndexOf("/") + 1) : "Unknown File");

  const renderMediaPreview = () => {
    if (type === "image") {
      return (
        <img
          src={url}
          alt={`media-${id}`}
          className="object-cover w-10 h-10 sm:w-16 sm:h-16 rounded-md"
        />
      );
    } else if (type === "video") {
      return (
        <video
          src={url}
          className="object-cover w-10 h-10 sm:w-16 sm:h-16 rounded-md bg-black"
          controls={false}
          preload="metadata"
          muted
          onLoadedMetadata={(e) => {
            // Try to seek to 0.1s to show a frame if metadata doesn't show anything
            e.target.currentTime = 0.1;
          }}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (type === "pdf" || type === "file") {
      return (
        <div className="flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-md bg-muted text-muted-foreground">
          <FileText className="w-6 h-6" />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative p-2 border rounded-md shadow-sm bg-background w-full overflow-hidden"
    >
      <div
        className="flex items-center gap-2 w-full min-w-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cursor-grab flex-shrink-0"
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
        <div className="flex-shrink-0">{renderMediaPreview()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={fileName}>
            {fileName}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {type}
          </p>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export function MediaUpload({
  initialMedia = [],
  onMediaChange,
  maxFiles = 5,
  maxFileSizeMb = 5,
  allowMultiple = true,
  allowedTypes = ["image/*", "video/*", "application/pdf"],
}) {
  const [mediaItems, setMediaItems] = useState([]);

  const lastSyncedInitialMedia = useRef([]);
  const lastPropagatedMedia = useRef([]);

  useEffect(() => {
    // Only update internal state if initialMedia has genuinely changed content
    if (!areMediaItemsEqual(initialMedia, lastSyncedInitialMedia.current)) {
      let processedMedia = initialMedia.map((item) => ({
        id: item.id || uuidv4(),
        url: item.url,
        type:
          item.type ||
          (item.url &&
            (item.url.match(/\.(jpeg|jpg|png|gif|webp)$/i)
              ? "image"
              : item.url.match(/\.(mp4|webm|ogg)$/i)
                ? "video"
                : item.url.match(/\.pdf$/i)
                  ? "pdf"
                  : "file")),
        file: item.file || null,
      }));

      setMediaItems(processedMedia); // Set state directly
      lastSyncedInitialMedia.current = processedMedia;
    }
  }, [initialMedia]); // Removed mediaItems from dependencies

  useEffect(() => {
    if (!areMediaItemsEqual(mediaItems, lastPropagatedMedia.current)) {
      onMediaChange(mediaItems);
      lastPropagatedMedia.current = mediaItems;
    }
  }, [mediaItems, onMediaChange]);

  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      setMediaItems((currentMediaItems) => {
        if (!allowMultiple && acceptedFiles.length > 0) {
          if (currentMediaItems.length > 0) {
            toast.warning(
              "Replacing existing file as only one file is allowed."
            );
            if (currentMediaItems[0].file) {
              URL.revokeObjectURL(currentMediaItems[0].url);
            }
            currentMediaItems = [];
          }
        }

        if (
          allowMultiple &&
          currentMediaItems.length + acceptedFiles.length > maxFiles
        ) {
          toast.error(`You can only upload a maximum of ${maxFiles} files.`);
          return currentMediaItems;
        } else if (!allowMultiple && acceptedFiles.length > 1) {
          toast.error(`Only one file is allowed.`);
          return currentMediaItems;
        }

        fileRejections.forEach(({ file, errors }) => {
          errors.forEach((err) => {
            if (err.code === "file-too-large") {
              toast.error(
                `File ${file.name} is larger than ${maxFileSizeMb}MB.`
              );
            } else if (err.code === "file-invalid-type") {
              toast.error(`File ${file.name} is not an accepted type.`);
            } else {
              toast.error(`Error with file ${file.name}: ${err.message}`);
            }
          });
        });

        const newItems = acceptedFiles.map((file) => {
          let mediaType = "file";
          if (file.type.startsWith("image/")) {
            mediaType = "image";
          } else if (file.type.startsWith("video/")) {
            mediaType = "video";
          } else if (file.type === "application/pdf") {
            mediaType = "pdf";
          }

          return {
            ...file,
            id: uuidv4(),
            url: URL.createObjectURL(file),
            type: mediaType,
            file: file,
          };
        });

        return [...currentMediaItems, ...newItems];
      });
    },
    [maxFiles, maxFileSizeMb, allowMultiple]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      const [mainType, subType] = type.split("/");
      if (!acc[mainType]) {
        acc[mainType] = [];
      }
      acc[mainType].push(type);
      return acc;
    }, {}),
    maxFiles: allowMultiple
      ? maxFiles - mediaItems.length
      : mediaItems.length > 0
        ? 0
        : 1,
    maxSize: maxFileSizeMb * 1024 * 1024,
  });

  const handleRemoveMedia = useCallback((idToRemove) => {
    setMediaItems((currentMediaItems) => {
      return currentMediaItems.filter((item) => item.id !== idToRemove);
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMediaItems((currentMediaItems) => {
        const oldIndex = currentMediaItems.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = currentMediaItems.findIndex(
          (item) => item.id === over.id
        );
        return arrayMove(currentMediaItems, oldIndex, newIndex);
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.file) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [mediaItems]);

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200 w-full"
      >
        <input {...getInputProps()} />
        <PlusCircle className="w-8 h-8 mb-2" />
        {isDragActive ? (
          <p className="text-center">Drop the files here ...</p>
        ) : (
          <p className="text-center text-sm px-2">
            Drag 'n' drop {allowMultiple ? "some files" : "a file"} here, or
            click to select {allowMultiple ? "files" : "a file"}
          </p>
        )}
        <p className="text-xs mt-1 text-center">
          Max {allowMultiple ? `${maxFiles} files` : "1 file"}, up to{" "}
          {maxFileSizeMb}MB each.
        </p>
      </div>

      {mediaItems.length > 0 && (
        <div className="space-y-2 w-full">
          <h3 className="text-base font-semibold">Uploaded</h3>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={mediaItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 w-full">
                {mediaItems.map((item) => (
                  <SortableMediaItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveMedia}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}