import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Star, PlusCircle, StarOff, FileText, Video } from 'lucide-react'; // Added FileText and Video icons
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Helper for deep comparison of media item arrays
function areMediaItemsEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        // Compare relevant properties for equality (excluding `file` object and URL.createObjectURL generated URLs)
        if (arr1[i].id !== arr2[i].id || arr1[i].isPrimary !== arr2[i].isPrimary || arr1[i].type !== arr2[i].type || arr1[i].url !== arr2[i].url) {
            return false;
        }
    }
    return true;
}

// Sortable Media Item Component (renamed from SortableImageItem)
const SortableMediaItem = ({ id, url, type, isPrimary, onRemove, onTogglePrimary, showPrimaryOption }) => {
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
        zIndex: isDragging ? 1 : 'auto',
    };

    const renderMediaPreview = () => {
        if (type === 'image') {
            return <img src={url} alt={`media-${id}`} className="object-cover w-10 h-10 sm:w-16 sm:h-16 rounded-md" />;
        } else if (type === 'video') {
            return (
                <video src={url} className="object-cover w-10 h-10 sm:w-16 sm:h-16 rounded-md" controls={false} preload="metadata">
                    Your browser does not support the video tag.
                </video>
            );
        } else if (type === 'pdf' || type === 'file') {
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
            className="relative p-2 border rounded-md shadow-sm bg-background"
        >
            <div className="flex flex-wrap items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="cursor-grab"
                    {...listeners}
                >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
                {renderMediaPreview()}
                <div className="flex-1 min-w-0 max-w-full">
                    <p className="text-sm truncate">{url.substring(url.lastIndexOf('/') + 1)}</p>
                    {isPrimary && <Badge className="mt-1" variant="secondary">Primary</Badge>}
                </div>
                {(showPrimaryOption && (type === 'image' || type === 'video')) && (
                    <div className="flex items-center space-x-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onTogglePrimary(id); }}
                            className="hover:text-yellow-500"
                        >
                            {isPrimary ? <Star fill="currentColor" className="w-4 h-4 text-yellow-500" /> : <StarOff className="w-4 h-4" />}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                {(!showPrimaryOption || !(type === 'image' || type === 'video')) && ( // If primary option not shown or not image/video, only show delete
                    <div className="flex items-center space-x-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
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
    allowedTypes = ['image/*', 'video/*', 'application/pdf'],
    showPrimaryOption = true,
}) {
    const [mediaItems, setMediaItems] = useState([]);

    // Ref to track the 'initialMedia' prop value that was last used to update internal 'mediaItems' state
    const lastSyncedInitialMedia = useRef([]);
    // Ref to track the 'mediaItems' state value that was last propagated to the parent via 'onMediaChange'
    const lastPropagatedMedia = useRef([]);

    // Effect to synchronize internal mediaItems state with initialMedia prop
    useEffect(() => {
        // Only proceed if initialMedia has actually changed content-wise from what was last synced
        if (!areMediaItemsEqual(initialMedia, lastSyncedInitialMedia.current)) {
            let processedMedia = initialMedia.map(item => ({
                id: item.id || uuidv4(),
                url: item.url,
                type: item.type || (item.url && (item.url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? 'image' : (item.url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : (item.url.match(/\.pdf$/i) ? 'pdf' : 'file')))), // Infer type if not provided
                isPrimary: item.isPrimary || false,
                file: item.file || null,
            }));

            // Ensure only one item is primary (or make first eligible one primary if none)
            if (showPrimaryOption) {
                const primaryCount = processedMedia.filter(item => item.isPrimary && (item.type === 'image' || item.type === 'video')).length;
                if (primaryCount > 1) {
                    let firstPrimaryFound = false;
                    processedMedia = processedMedia.map(item => {
                        if (item.isPrimary && (item.type === 'image' || item.type === 'video') && !firstPrimaryFound) {
                            firstPrimaryFound = true;
                            return item;
                        }
                        return { ...item, isPrimary: false };
                    });
                } else if (primaryCount === 0 && processedMedia.length > 0) {
                    const firstEligible = processedMedia.find(item => item.type === 'image' || item.type === 'video');
                    if (firstEligible) {
                        firstEligible.isPrimary = true;
                    }
                }
            } else {
                processedMedia = processedMedia.map(item => ({ ...item, isPrimary: false }));
            }


            // Update internal state only if it's genuinely different
            if (!areMediaItemsEqual(mediaItems, processedMedia)) {
                setMediaItems(processedMedia);
            }
            lastSyncedInitialMedia.current = processedMedia; // Store the processed version
        }
    }, [initialMedia, mediaItems, areMediaItemsEqual, showPrimaryOption]); // Add mediaItems, areMediaItemsEqual, showPrimaryOption to dependencies

    // Effect to notify parent about media item changes
    useEffect(() => {
        if (!areMediaItemsEqual(mediaItems, lastPropagatedMedia.current)) {
            onMediaChange(mediaItems);
            lastPropagatedMedia.current = mediaItems;
        }
    }, [mediaItems, onMediaChange, areMediaItemsEqual]);


    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        setMediaItems(currentMediaItems => {
            if (!allowMultiple && acceptedFiles.length > 0) {
                // If only single file is allowed and a new file is dropped, replace existing one
                if (currentMediaItems.length > 0) {
                    toast.warning("Replacing existing file as only one file is allowed.");
                    // Revoke URL for existing file if it was a blob URL
                    if (currentMediaItems[0].file) {
                        URL.revokeObjectURL(currentMediaItems[0].url);
                    }
                    currentMediaItems = [];
                }
            }

            if (allowMultiple && currentMediaItems.length + acceptedFiles.length > maxFiles) {
                toast.error(`You can only upload a maximum of ${maxFiles} files.`);
                return currentMediaItems;
            } else if (!allowMultiple && acceptedFiles.length > 1) { // If single and multiple files are dropped
                toast.error(`Only one file is allowed.`);
                return currentMediaItems;
            }


            fileRejections.forEach(({ file, errors }) => {
                errors.forEach(err => {
                    if (err.code === 'file-too-large') {
                        toast.error(`File ${file.name} is larger than ${maxFileSizeMb}MB.`);
                    } else if (err.code === 'file-invalid-type') {
                        toast.error(`File ${file.name} is not an accepted type.`);
                    } else {
                        toast.error(`Error with file ${file.name}: ${err.message}`);
                    }
                });
            });

            const newItems = acceptedFiles.map(file => {
                let mediaType = 'file';
                if (file.type.startsWith('image/')) {
                    mediaType = 'image';
                } else if (file.type.startsWith('video/')) {
                    mediaType = 'video';
                } else if (file.type === 'application/pdf') {
                    mediaType = 'pdf';
                }

                return {
                    ...file, // Spread properties of the original file object
                    id: uuidv4(),
                    url: URL.createObjectURL(file),
                    type: mediaType,
                    isPrimary: false,
                    file: file, // Keep a reference to the actual file object if needed
                };
            });

            let updatedMedia = [...currentMediaItems, ...newItems];

            // If single file upload, ensure isPrimary is set correctly for the new item
            if (!allowMultiple && updatedMedia.length > 0 && showPrimaryOption && (updatedMedia[0].type === 'image' || updatedMedia[0].type === 'video')) {
                updatedMedia[0].isPrimary = true;
            } else if (allowMultiple && updatedMedia.length > 0 && !updatedMedia.some(item => item.isPrimary && (item.type === 'image' || item.type === 'video')) && showPrimaryOption) {
                // For multiple files, if no primary is set, make the first eligible one primary
                const firstEligible = updatedMedia.find(item => item.type === 'image' || item.type === 'video');
                if (firstEligible) {
                    firstEligible.isPrimary = true;
                }
            }
            return updatedMedia;
        });
    }, [maxFiles, maxFileSizeMb, allowMultiple, showPrimaryOption, areMediaItemsEqual]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: allowedTypes.reduce((acc, type) => {
            const [mainType, subType] = type.split('/');
            if (!acc[mainType]) {
                acc[mainType] = [];
            }
            acc[mainType].push(type);
            return acc;
        }, {}),
        maxFiles: allowMultiple ? (maxFiles - mediaItems.length) : (mediaItems.length > 0 ? 0 : 1), // Max 1 if not multiple and already has one
        maxSize: maxFileSizeMb * 1024 * 1024,
    });

    const handleRemoveMedia = useCallback((idToRemove) => {
        setMediaItems(currentMediaItems => {
            let updatedMedia = currentMediaItems.filter(item => item.id !== idToRemove);
            // If the removed item was primary, and there are other eligible items, make the first one primary
            if (showPrimaryOption && currentMediaItems.find(item => item.id === idToRemove)?.isPrimary && updatedMedia.length > 0) {
                const firstEligible = updatedMedia.find(item => item.type === 'image' || item.type === 'video');
                if (firstEligible) {
                    firstEligible.isPrimary = true;
                }
            }
            // If single upload and the only item is removed, ensure no primary is left
            if (!allowMultiple && updatedMedia.length > 0) { // If single upload and previous item was replaced
                updatedMedia = updatedMedia.map(item => ({ ...item, isPrimary: false }));
            }
            return updatedMedia;
        });
    }, [allowMultiple, showPrimaryOption]);

    const handleTogglePrimary = useCallback((idToToggle) => {
        setMediaItems(currentMediaItems =>
            currentMediaItems.map(item => {
                if (showPrimaryOption && (item.type === 'image' || item.type === 'video')) { // Only allow image/video to be primary
                    return {
                        ...item,
                        isPrimary: item.id === idToToggle ? !item.isPrimary : false, // Only one can be primary
                    };
                }
                return item;
            })
        );
    }, [showPrimaryOption]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setMediaItems((currentMediaItems) => {
                const oldIndex = currentMediaItems.findIndex((item) => item.id === active.id);
                const newIndex = currentMediaItems.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(currentMediaItems, oldIndex, newIndex);

                // Re-evaluate primary if the primary item's position changed or a new primary is needed
                if (showPrimaryOption && !newOrder.some(item => item.isPrimary && (item.type === 'image' || item.type === 'video')) && newOrder.length > 0) {
                    const firstEligible = newOrder.find(item => item.type === 'image' || item.type === 'video');
                    if (firstEligible) {
                        firstEligible.isPrimary = true;
                    }
                }
                return newOrder;
            });
        }
    }, [showPrimaryOption]);

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            mediaItems.forEach(item => {
                if (item.file) {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    }, [mediaItems]); // Depend on mediaItems to revoke URLs as items are added/removed

    return (
        <div className="grid gap-4">
            <div
                {...getRootProps()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200"
            >
                <input {...getInputProps()} />
                <PlusCircle className="w-8 h-8 mb-2" />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag 'n' drop {allowMultiple ? 'some files' : 'a file'} here, or click to select {allowMultiple ? 'files' : 'a file'}</p>
                )}
                <p className="text-xs mt-1">Max {allowMultiple ? `${maxFiles} files` : '1 file'}, up to {maxFileSizeMb}MB each.</p>
            </div>

            {mediaItems.length > 0 && (
                <div className="grid gap-2">
                    <h3 className="text-base font-semibold">Uploaded</h3>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={mediaItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                            <div className="grid gap-2">
                                {mediaItems.map((item) => (
                                    <SortableMediaItem // This will be renamed to SortableMediaItem
                                        key={item.id}
                                        id={item.id}
                                        url={item.url}
                                        type={item.type} // Pass type
                                        isPrimary={item.isPrimary}
                                        onRemove={handleRemoveMedia}
                                        onTogglePrimary={handleTogglePrimary}
                                        showPrimaryOption={showPrimaryOption}
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
