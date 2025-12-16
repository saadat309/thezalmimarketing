  Plan for Manual Execution of CRUD Refactoring

  This document outlines the necessary steps to refactor the Map CRUD functionality to correctly implement a one-to-many relationship (from
  City/Society/Phase to Map, meaning a Map can have one City/Society/Phase). This plan assumes the database schema has been updated as confirmed,
  where map_docs directly contains city_id, society_id, and phase_id foreign keys, and junction tables are removed.

  Current State Summary

   * The database schema is confirmed to have map_docs with direct city_id, society_id, phase_id foreign keys. Junction tables have been dropped.
   * Backend (`api/routes/maps.php`): I have already executed the write_file operation to update this file to reflect the direct foreign key
     relationship. It should now contain the correct list_maps, get_map, create_map, update_map, and delete_map functions that directly interact
     with city_id, society_id, phase_id columns in the map_docs table, and remove all junction table logic.
   * Frontend (`src/components/dashboard/map-form/validation.jsx`): This file has been updated to use city_id, society_id, phase_id as single
     optional numbers. This is in the correct state.
   * Frontend (`src/components/dashboard/map-form/MapForm.jsx`): This file is currently in an incorrect state. It still contains logic related to
     multi-select and many-to-many relationships (e.g., setValue, watch, array-based city_ids, addEntity helpers, updateEntityMapLink). This is the
     primary file that needs correction.
   * Frontend (`src/routes/dashboard/maps.jsx`): This file likely still passes array-based IDs (city_ids) to MapForm and uses columns for
     linked_cities which are arrays. This also needs correction.
   * Backend (`api/routes/cities.php`, `api/routes/societies.php`, `api/routes/phases.php`): These files were reverted correctly and no longer
     handle map_id updates, which is appropriate given the new schema.

  What Has Been Done (Confirmed/Overwritten)

   1. `api/routes/maps.php`: This file has been completely overwritten with the correct logic for direct foreign keys.
   2. `src/components/dashboard/map-form/validation.jsx`: This file has been updated to use single optional numeric IDs (city_id, society_id,
      phase_id).
   3. `src/components/dashboard/MediaUpload.jsx`: Restored correct imports, areMediaItemsEqual moved out, useEffect dependencies fixed, and
      SortableMediaItem defensively checks url for substring call. This should be in a good state.

  What Needs To Be Done (Manual Execution Required)

  Please perform the following steps manually in your project.

  Step 1: Correct src/components/dashboard/map-form/MapForm.jsx

  This file is the most problematic and needs significant manual correction.

   1. Open `src/components/dashboard/map-form/MapForm.jsx`.
   2. Replace the ENTIRE content of this file with the content provided below. This ensures all old multi-select logic, helper functions, and state
      are correctly removed and the file aligns with direct foreign keys.

     1     import {
     2       Select,
     3       SelectContent,
     4       SelectItem,
     5       SelectTrigger,
     6       SelectValue,
     7     } from "@/components/ui/select";
     8     import {useEffect, useState} from "react";
     9     import {useForm, Controller} from "react-hook-form";
    10     import {zodResolver} from "@hookform/resolvers/zod";
    11     import {toast} from "sonner";
    12     import { MediaUpload } from "../MediaUpload";
    13     import { mapFormSchema } from "./validation";
    14     import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    15     import { Input } from "@/components/ui/input";
    16     import { Label } from "@/components/ui/label";
    17     import { Textarea } from "@/components/ui/textarea";
    18     import { Switch } from "@/components/ui/switch";
    19     import { Button } from "@/components/ui/button";
    20
    21     export default function MapForm({ initialData, onSuccess, onCancel, isDuplicating }) {
    22       const [mapImage, setMapImage] = useState([]);
    23       const [mapPdf, setMapPdf] = useState([]);
    24       const [cities, setCities] = useState([]); // State for cities
    25       const [societies, setSocieties] = useState([]); // State for societies
    26       const [phases, setPhases] = useState([]); // State for phases
    27
    28       const {
    29         register,
    30         handleSubmit,
    31         control,
    32         reset,
    33         formState: { errors },
    34       } = useForm({
    35         resolver: zodResolver(mapFormSchema),
    36         defaultValues: {
    37           title: "",
    38           description: "",
    39           hide: false,
    40           mapImage: [],
    41           mapPdf: [],
    42           city_id: "",
    43           society_id: "",
    44           phase_id: "",
    45           ...(initialData || {}),
    46         },
    47       });
    48
    49       useEffect(() => {
    50         const fetchData = async () => {
    51           try {
    52             const [citiesResponse, societiesResponse, phasesResponse] = await Promise.all([
    53               fetch('/api/cities'),
    54               fetch('/api/societies'),
    55               fetch('/api/phases'),
    56             ]);
    57
    58             if (!citiesResponse.ok) throw new Error('Failed to fetch cities.');
    59             if (!societiesResponse.ok) throw new Error('Failed to fetch societies.');
    60             if (!phasesResponse.ok) throw new Error('Failed to fetch phases.');
    61
    62             const citiesData = await citiesResponse.json();
    63             const societiesData = await societiesResponse.json();
    64             const phasesData = await phasesResponse.json();
    65
    66             setCities(citiesData);
    67             setSocieties(societiesData);
    68             setPhases(phasesData);
    69
    70           } catch (error) {
    71             console.error("Failed to fetch relations data:", error);
    72             toast.error("Failed to load related data: " + error.message);
    73           }
    74         };
    75
    76         fetchData();
    77
    78         if (initialData) {
    79           const formDataToSet = isDuplicating
    80             ? { ...initialData, id: undefined }
    81             : {
    82                 ...initialData,
    83                 city_id: initialData.city_id ? initialData.city_id.toString() : "",
    84                 society_id: initialData.society_id ? initialData.society_id.toString() : "",
    85                 phase_id: initialData.phase_id ? initialData.phase_id.toString() : "",
    86               };
    87           reset(formDataToSet);
    88           // Format existing map_pic for MediaUpload
    89           if (initialData.map_pic) {
    90             setMapImage([{ url: initialData.map_pic, thumb_path: initialData.map_thumb, type: 'image' }]);
    91           } else {
    92             setMapImage([]);
    93           }
    94           // Format existing pdf for MediaUpload
    95           if (initialData.pdf) {
    96             setMapPdf([{ url: initialData.pdf, type: 'pdf' }]);
    97           } else {
    98             setMapPdf([]);
    99           }
   100         } else {
   101           reset({
   102             title: "",
   103             description: "",
   104             hide: false,
   105             mapImage: [],
   106             mapPdf: [],
   107             city_id: "",
   108             society_id: "",
   109             phase_id: "",
   110           });
   111           setMapImage([]);
   112           setMapPdf([]);
   113         }
   114       }, [initialData, reset, isDuplicating]);
   115
   116       const onSubmit = async (data) => {
   117         const finalData = {
   118           ...data,
   119           mapImage,
   120           mapPdf,
   121           id: (isDuplicating || !initialData) ? undefined : initialData.id,
   122           // Ensure null is passed for empty selects instead of ""
   123           city_id: data.city_id === "" ? null : data.city_id,
   124           society_id: data.society_id === "" ? null : data.society_id,
   125           phase_id: data.phase_id === "" ? null : data.phase_id,
   126         };
   127         onSuccess(finalData);
   128       };
   129
   130       return (
   131         <div className="max-w-3xl p-6 mx-auto space-y-8">
   132           <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
   133             <Card>
   134               <CardHeader>
   135                 <CardTitle>Map Information</CardTitle>
   136               </CardHeader>
   137               <CardContent className="space-y-6">
   138                 <div className="space-y-2">
   139                   <Label htmlFor="title">
   140                     Title <span className="text-red-500">*</span>
   141                   </Label>
   142                   <Input
   143                     id="title"
   144                     placeholder="Enter map title"
   145                     {...register("title")}
   146                   />
   147                   {errors.title && (
   148                     <p className="text-sm text-red-500">{errors.title.message}</p>
   149                   )}
   150                 </div>
   151                 <div className="space-y-2">
   152                   <Label htmlFor="description">Description</Label>
   153                   <Textarea
   154                     id="description"
   155                     placeholder="Brief overview of the map"
   156                     className="min-h-[100px]"
   157                     {...register("description")}
   158                   />
   159                 </div>
   160               </CardContent>
   161             </Card>
   162
   163             {/* Relations Card */}
   164             <Card>
   165               <CardHeader>
   166                 <CardTitle>Relations</CardTitle>
   167               </CardHeader>
   168               <CardContent className="space-y-6">
   169                 <div className="space-y-2">
   170                   <Label htmlFor="city_id">City</Label>
   171                   <Controller
   172                     name="city_id"
   173                     control={control}
   174                     render={({ field }) => (
   175                       <Select
   176                         value={field.value || ""}
   177                         onValueChange={(value) => {
   178                           field.onChange(value === "" ? null : value); // Convert empty string to null
   179                         }}
   180                       >
   181                         <SelectTrigger>
   182                           <SelectValue placeholder="Select a city" />
   183                         </SelectTrigger>
   184                         <SelectContent>
   185                           <SelectItem value="">None</SelectItem>
   186                           {cities.map((city) => (
   187                             <SelectItem key={city.id} value={city.id.toString()}>
   188                               {city.name}
   189                             </SelectItem>
   190                           ))}
   191                         </SelectContent>
   192                       </Select>
   193                     )}
   194                   />
   195                 </div>
   196
   197                 <div className="space-y-2">
   198                   <Label htmlFor="society_id">Society</Label>
   199                   <Controller
   200                     name="society_id"
   201                     control={control}
   202                     render={({ field }) => (
   203                       <Select
   204                         value={field.value || ""}
   205                         onValueChange={(value) => {
   206                           field.onChange(value === "" ? null : value); // Convert empty string to null
   207                         }}
   208                       >
   209                         <SelectTrigger>
   210                           <SelectValue placeholder="Select a society" />
   211                         </SelectTrigger>
   212                         <SelectContent>
   213                           <SelectItem value="">None</SelectItem>
   214                           {societies.map((soc) => (
   215                             <SelectItem key={soc.id} value={soc.id.toString()}>
   216                               {soc.name}
   217                             </SelectItem>
   218                           ))}
   219                         </SelectContent>
   220                       </Select>
   221                     )}
   222                   />
   223                 </div>
   224
   225                 <div className="space-y-2">
   226                   <Label htmlFor="phase_id">Phase</Label>
   227                   <Controller
   228                     name="phase_id"
   229                     control={control}
   230                     render={({ field }) => (
   231                       <Select
   232                         value={field.value || ""}
   233                         onValueChange={(value) => {
   234                           field.onChange(value === "" ? null : value); // Convert empty string to null
   235                         }}
   236                       >
   237                         <SelectTrigger>
   238                           <SelectValue placeholder="Select a phase" />
   239                         </SelectTrigger>
   240                         <SelectContent>
   241                           <SelectItem value="">None</SelectItem>
   242                           {phases.map((phase) => (
   243                             <SelectItem key={phase.id} value={phase.id.toString()}>
   244                               {phase.name}
   245                             </SelectItem>
   246                           ))}
   247                         </SelectContent>
   248                       </Select>
   249                     )}
   250                   />
   251                 </div>
   252               </CardContent>
   253             </Card>
   254
   255             <Card>
   256               <CardHeader>
   257                 <CardTitle>Map Media</CardTitle>
   258               </CardHeader>
   259               <CardContent className="grid gap-4 py-4">
   260                 <h4 className="text-sm font-medium leading-none">Map Image (Max 1)</h4>
   261                 <MediaUpload
   262                   initialMedia={mapImage}
   263                   onMediaChange={setMapImage}
   264                   maxFiles={1}
   265                   allowedTypes={['image/*']}
   266                   allowMultiple={false}
   267                   showPrimaryOption={false}
   268                 />
   269                 <h4 className="text-sm font-medium leading-none">Map PDF (Max 1)</h4>
   270                 <MediaUpload
   271                   initialMedia={mapPdf}
   272                   onMediaChange={setMapPdf}
   273                   maxFiles={1}
   274                   allowedTypes={['application/pdf']}
   275                   allowMultiple={false}
   276                   showPrimaryOption={false}
   277                 />
   278               </CardContent>
   279             </Card>
   280
   281             <Card>
   282               <CardHeader>
   283                 <CardTitle>Publishing Settings</CardTitle>
   284               </CardHeader>
   285               <CardContent>
   286                 <div className="flex items-center justify-between">
   287                   <Label htmlFor="hide">Hide from public</Label>
   288                   <Controller
   289                     name="hide"
   290                     control={control}
   291                     render={({ field }) => (
   292                       <Switch
   293                         id="hide"
   294                         checked={field.value}
   295                         onCheckedChange={field.onChange}
   296                       />
   297                     )}
   298                   />
   299                 </div>
   300               </CardContent>
   301             </Card>
   302
   303             <div className="sticky bottom-0 flex gap-3 p-6 bg-white border-t">
   304               <Button type="submit" size="lg">
   305                 Save Map
   306               </Button>
   307               <Button type="button" variant="outline" size="lg" onClick={onCancel}>
   308                 Cancel
   309               </Button>
   310             </div>
   311           </form>
   312         </div>
   313       );
   314     }

  Step 2: Correct src/routes/dashboard/maps.jsx

   1. Open `src/routes/dashboard/maps.jsx`.
   2. Modify the `columns` array to reflect the direct foreign key names (city_id, society_id, phase_id) and their corresponding display names
      (city_name, etc.). Remove linked_city_id etc.
   3. Modify `handleAddMap` and `handleEditMap` to send city_id, society_id, phase_id (single values) to the backend.

     1     import { createFileRoute } from '@tanstack/react-router';
     2     import React, { useState, useEffect } from 'react';
     3     import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
     4     import { Checkbox } from "@/components/ui/checkbox";
     5     import { Button } from '@/components/ui/button';
     6     import { Badge } from "@/components/ui/badge";
     7     import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
     8     import { toast } from "sonner";
     9     import { Spinner } from '@/components/ui/spinner';
    10     import MapForm from '@/components/dashboard/map-form/MapForm';
    11
    12     export const Route = createFileRoute('/dashboard/maps')({
    13       component: DashboardMaps,
    14       staticData: {
    15         title: 'Maps',
    16       },
    17     });
    18
    19     const columns = [
    20         {
    21             id: 'select',
    22             header: ({ table }) => (
    23               <Checkbox
    24                 checked={
    25                   table.getIsAllPageRowsSelected() ||
    26                   (table.getIsSomePageRowsSelected() && 'indeterminate')
    27                 }
    28                 onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    29                 aria-label="Select all"
    30               />
    31             ),
    32             cell: ({ cell }) => (
    33               <Checkbox
    34                 key={`checkbox-${cell.id}-${cell.getContext().isChecked}`}
    35                 checked={cell.getContext().isChecked}
    36                 onCheckedChange={(value) => cell.row.toggleSelected(!!value)}
    37                 aria-label="Select row"
    38               />
    39             ),
    40             enableSorting: false,
    41             enableHiding: false,
    42           },
    43         {
    44           id: "count",
    45           header: "ID",
    46           cell: ({ row }) => row.index + 1,
    47           enableSorting: false,
    48           enableHiding: false,
    49         },
    50         { accessorKey: 'title', header: 'Title' },
    51         { accessorKey: 'description', header: 'Description' },
    52         {
    53           accessorKey: 'map_pic', // Display map image if available
    54           header: 'Image',
    55           cell: ({ row }) => row.original.map_pic ? (
    56             <img src={row.original.map_pic} alt={row.original.title} className="object-cover w-10 h-10 rounded-md" />
    57           ) : (
    58             <span className="text-muted-foreground">No Image</span>
    59           ),
    60           enableSorting: false,
    61           enableHiding: true,
    62         },
    63         {
    64           accessorKey: 'pdf', // Display PDF link if available
    65           header: 'PDF',
    66           cell: ({ row }) => row.original.pdf ? (
    67             <a href={row.original.pdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View PDF</a>
    68           ) : (
    69             <span className="text-muted-foreground">No PDF</span>
    70           ),
    71           enableSorting: false,
    72           enableHiding: true,
    73         },
    74         {
    75           accessorKey: 'city_name',
    76           header: 'City',
    77           cell: ({ row }) => row.original.city_name || 'N/A',
    78           enableSorting: true,
    79           enableHiding: true,
    80         },
    81         {
    82           accessorKey: 'society_name',
    83           header: 'Society',
    84           cell: ({ row }) => row.original.society_name || 'N/A',
    85           enableSorting: true,
    86           enableHiding: true,
    87         },
    88         {
    89           accessorKey: 'phase_name',
    90           header: 'Phase',
    91           cell: ({ row }) => row.original.phase_name || 'N/A',
    92           enableSorting: true,
    93           enableHiding: true,
    94         },
    95         {
    96             accessorKey: 'hide',
    97             header: 'Status',
    98             cell: ({ row }) => {
    99                 const isHidden = row.original.hide;
   100                 return (
   101                     <Badge variant={isHidden ? 'destructive' : 'secondary'}>
   102                         {isHidden ? 'Hidden' : 'Public'}
   103                     </Badge>
   104                 );
   105             },
   106         },
   107         {
   108           accessorKey: 'updated_at',
   109           header: ({ column }) => {
   110             const sorted = column.getIsSorted();
   111             return (
   112               <Button
   113                 variant="ghost"
   114                 onClick={() => column.toggleSorting()}
   115               >
   116                 Last Updated
   117                 {sorted === "asc" && <ArrowUp className="w-4 h-4 ml-2" />}
   118                 {sorted === "desc" && <ArrowDown className="w-4 h-4 ml-2" />}
   119                 {!sorted && <ArrowUpDown className="w-4 h-4 ml-2" />}
   120               </Button>
   121             )
   122           },
   123           enableSorting: true,
   124           enableHiding: true,
   125         },
   126     ];
   127
   128     function DashboardMaps() {
   129       const [maps, setMaps] = useState([]);
   130       const [isLoading, setIsLoading] = useState(true);
   131       const [error, setError] = useState(null);
   132       const [selectedRows, setSelectedRows] = useState([]);
   133       const [tableInstance, setTableInstance] = useState(null);
   134       const [isSubmitting, setIsSubmitting] = useState(false);
   135
   136       const fetchMaps = async () => {
   137         setIsLoading(true);
   138         setError(null);
   139         try {
   140           const response = await fetch('/api/maps');
   141           if (!response.ok) {
   142             throw new Error(`HTTP error! status: ${response.status}`);
   143           }
   144           const data = await response.json();
   145           setMaps(data);
   146         } catch (e) {
   147           setError(e.message);
   148           toast.error("Failed to load maps: " + e.message);
   149         } finally {
   150           setIsLoading(false);
   151         }
   152       };
   153
   154       useEffect(() => {
   155         fetchMaps();
   156       }, []);
   157
   158       const handleAddMap = async (newItem) => {
   159         setIsSubmitting(true);
   160         try {
   161           const formData = new FormData();
   162           formData.append('title', newItem.title);
   163           formData.append('description', newItem.description || '');
   164           formData.append('hide', newItem.hide ? '1' : '0');
   165           formData.append('city_id', newItem.city_id || ''); // Single ID
   166           formData.append('society_id', newItem.society_id || ''); // Single ID
   167           formData.append('phase_id', newItem.phase_id || ''); // Single ID
   168
   169           if (newItem.mapImage && newItem.mapImage.length > 0 && newItem.mapImage[0].file) {
   170             formData.append('mapImage', newItem.mapImage[0].file);
   171           }
   172           if (newItem.mapPdf && newItem.mapPdf.length > 0 && newItem.mapPdf[0].file) {
   173             formData.append('mapPdf', newItem.mapPdf[0].file);
   174           }
   175
   176           const response = await fetch('/api/maps', {
   177             method: 'POST',
   178             body: formData,
   179           });
   180
   181           if (!response.ok) {
   182             const errorData = await response.json();
   183             throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
   184           }
   185
   186           const newMap = await response.json(); // Get the returned map data
   187           toast.success("Map added successfully!");
   188           fetchMaps();
   189           return newMap; // Return the new map object
   190         } catch (e) {
   191           toast.error("Failed to add map: " + e.message);
   192           return false;
   193         } finally {
   194           setIsSubmitting(false);
   195         }
   196       };
   197
   198       const handleEditMap = async (editedItem) => {
   199         setIsSubmitting(true);
   200         try {
   201           const formData = new FormData();
   202           formData.append('title', editedItem.title);
   203           formData.append('description', editedItem.description || '');
   204           formData.append('hide', editedItem.hide ? '1' : '0');
   205           formData.append('city_id', editedItem.city_id || ''); // Single ID
   206           formData.append('society_id', editedItem.society_id || ''); // Single ID
   207           formData.append('phase_id', editedItem.phase_id || ''); // Single ID
   208           formData.append('_method', 'PATCH'); // Method override
   209
   210           // Handle mapImage
   211           if (editedItem.mapImage && editedItem.mapImage.length > 0 && editedItem.mapImage[0].file) {
   212             formData.append('mapImage', editedItem.mapImage[0].file);
   213           } else if (editedItem.mapImage_removed === true) { // Check for explicit removal
   214             formData.append('mapImage_removed', 'true');
   215           }
   216
   217           // Handle mapPdf
   218           if (editedItem.mapPdf && editedItem.mapPdf.length > 0 && editedItem.mapPdf[0].file) {
   219             formData.append('mapPdf', editedItem.mapPdf[0].file);
   220           } else if (editedItem.mapPdf_removed === true) { // Check for explicit removal
   221             formData.append('mapPdf_removed', 'true');
   222           }
   223
   224           const response = await fetch(`/api/maps/${editedItem.id}`, {
   225             method: 'POST', // Use POST for FormData with method override
   226             body: formData,
   227           });
   228
   229           if (!response.ok) {
   230             const errorData = await response.json();
   231             throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
   232           }
   233
   234           const updatedMap = await response.json(); // Get the updated map data
   235           toast.success("Map updated successfully!");
   236           fetchMaps();
   237           return updatedMap; // Return the updated map object
   238         } catch (e) {
   239           toast.error("Failed to update map: " + e.message);
   240           return false;
   241         } finally {
   242           setIsSubmitting(false);
   243         }
   244       };
   245
   246       const handleDeleteMap = async (id) => {
   247         setIsSubmitting(true);
   248         try {
   249           const response = await fetch(`/api/maps/${id}`, {
   250             method: 'DELETE',
   251           });
   252           if (!response.ok) {
   253             const errorData = await response.json();
   254             throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
   255           }
   256           toast.success("Map deleted successfully!");
   257           fetchMaps();
   258         } catch (e) {
   259           toast.error("Failed to delete map: " + e.message);
   260         } finally {
   261           setIsSubmitting(false);
   262         }
   263       };
   264
   265       const handleDeleteSelected = async () => {
   266         if (selectedRows.length === 0) {
   267           toast.warning("No rows selected for deletion.");
   268           return;
   269         }
   270         setIsSubmitting(true);
   271         try {
   272           const deletePromises = selectedRows.map(row =>
   273             fetch(`/api/maps/${row.original.id}`, { method: 'DELETE' })
   274           );
   275
   276           const results = await Promise.allSettled(deletePromises);
   277
   278           const failedDeletes = [];
   279           results.forEach((result, index) => {
   280             if (result.status === 'rejected') {
   281               failedDeletes.push(`ID ${selectedRows[index].original.id}: Network or server error`);
   282             } else if (!result.value.ok) {
   283               const errorPromise = result.value.json().then(err => `ID ${selectedRows[index].original.id}: ${err.detail ||
       result.value.statusText}`).catch(() => `ID ${selectedRows[index].original.id}: ${result.value.statusText}`);
   284               failedDeletes.push(errorPromise);
   285             }
   286           });
   287
   288           const finalFailedMessages = await Promise.all(failedDeletes);
   289
   290           if (finalFailedMessages.length === 0) {
   291             toast.success("Selected maps deleted successfully!");
   292           } else {
   293             toast.error(`Failed to delete ${finalFailedMessages.length} map(s): ${finalFailedMessages.join(', ')}`);
   294           }
   295
   296           setSelectedRows([]);
   297           fetchMaps();
   298
   299         } catch (e) {
   300           toast.error("Error during batch deletion: " + e.message);
   301         } finally {
   302           setIsSubmitting(false);
   303         }
   304       };
   305
   306       const handleExportCsv = () => {
   307         const selectedData = selectedRows.map(row => row.original);
   308         if (selectedData.length === 0) {
   309             toast.warning("No rows selected for export.");
   310             return;
   311         }
   312         if (!tableInstance) {
   313             toast.error("Table instance not available for export.");
   314             return;
   315         }
   316
   317         const visibleColumns = tableInstance.getAllColumns().filter(
   318             column => column.getIsVisible() && column.columnDef.accessorKey
   319         );
   320
   321         // Create header row
   322         const headers = visibleColumns.map(col => typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id);
   323         let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
   324
   325         // Create data rows
   326         selectedData.forEach(item => {
   327             const row = visibleColumns.map(col => {
   328                 let value = item[col.columnDef.accessorKey];
   329                 value = value === null || value === undefined ? "" : String(value);
   330                 if (/[",\n]/.test(value)) {
   331                     value = `"${value.replace(/"/g, '""')}"`;
   332                 }
   333                 return value;
   334             });
   335             csvContent += row.join(",") + "\n";
   336         });
   337
   338         const encodedUri = encodeURI(csvContent);
   339         const link = document.createElement("a");
   340         link.setAttribute("href", encodedUri);
   341         link.setAttribute("download", "maps.csv");
   342         document.body.appendChild(link);
   343         link.click();
   344         document.body.removeChild(link);
   345         toast.success("Maps exported as CSV.");
   346       };
   347
   348       const handleExportPdf = () => {
   349         toast.info("Exporting as PDF...");
   350       };
   351
   352       if (isLoading) {
   353         return (
   354           <div className="flex items-center justify-center h-full">
   355             <Spinner size="lg" />
   356             <p className="ml-2">Loading maps...</p>
   357           </div>
   358         );
   359       }
   360
   361       if (error) {
   362         return (
   363           <div className="p-4 text-center text-red-500">
   364             Error: {error}
   365           </div>
   366         );
   367       }
   368
   369       return (
   370         <div>
   371           <CrudDataTable
   372             title="Manage Maps"
   373             description="Here you can manage your society maps."
   374             searchPlaceholder="Filter maps..."
   375             data={maps}
   376             onAddItem={handleAddMap}
   377             onEditItem={handleEditMap}
   378             columns={columns}
   379             FormComp={MapForm}
   380             entityName="Map"
   381             handleDeleteItem={handleDeleteMap}
   382             handleDeleteSelected={handleDeleteSelected}
   383             handleExportCsv={handleExportCsv}
   384             handleExportPdf={handleExportPdf}
   385             routePath="/dashboard/maps"
   386             onSelectionChange={(rows, table) => {
   387                 setSelectedRows(rows);
   388                 setTableInstance(table);
   389             }}
   390             isSubmitting={isSubmitting}
   391           />
   392         </div>
   393       );
   394     }

  Step 3: Run Linter

   1. After performing all manual changes, run the linter to fix any formatting issues:

   1     npm run lint -- --fix

  Once you have completed these manual steps, please let me know.