import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import SmartImage from "@/components/global/SmartImage"
import { VideoPlayer } from "@/components/global/VideoPlayer"
import { cn, getEmbedUrl } from "@/lib/utils"

// This variable resets only on a hard browser refresh
let hasShownThisLoad = false;

export default function Popup({
  isVisible = false,
  delayMs = 5000,
  oncePerSession = false, // We'll keep this as an option, but the default logic will now favor "per load"
  storageKey = "popup_shown",
  title = "",
  description = "",
  mediaType = "image", // "image", "upload", "embed"
  mediaPath = "",
  children = null,
  className = "",
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isVisible) return
    
    // 1. Check persistent session storage if enabled
    if (oncePerSession && sessionStorage.getItem(storageKey) === "1") return

    // 2. Check in-memory "per load" flag
    if (hasShownThisLoad) return

    const timer = setTimeout(() => {
      setOpen(true)
      hasShownThisLoad = true;
      if (oncePerSession) sessionStorage.setItem(storageKey, "1")
    }, delayMs)

    return () => clearTimeout(timer)
  }, [isVisible, delayMs, oncePerSession, storageKey])

    const renderMedia = () => {

      if (!mediaPath) return null

  

      if (mediaType === "image") {

        return (

          <div className="relative w-full aspect-video overflow-hidden border-b border-border/5">

            <SmartImage

              src={mediaPath}

              alt={title || "Popup Image"}

              className="w-full h-full object-cover"

              priority

            />

          </div>

        )

      }

  

      if (mediaType === "upload" || mediaType === "embed") {

        const videoData = mediaType === "upload" 

          ? { path: mediaPath } 

          : { video_embed_link: getEmbedUrl(mediaPath) }

        

        return (

          <div className="overflow-hidden border-b border-border/5">

            <VideoPlayer video={videoData} className="aspect-video" />

          </div>

        )

      }

  

      return null

    }

  

        return (

  

                    <Dialog open={open} onOpenChange={setOpen}>

  

                      <DialogContent 

  

                        onPointerDownOutside={(e) => e.preventDefault()}

  

                        className={cn(

  

                          "max-w-[95vw] md:max-w-[80vw] lg:max-w-[1000px] rounded-3xl bg-background border-none shadow-2xl p-0 overflow-hidden",

  

          

  

              " [&>button:last-child]:bg-white [&>button:last-child]:text-red-600 [&>button:last-child]:opacity-100 [&>button:last-child]:hover:bg-red-50 [&>button:last-child]:rounded-full [&>button:last-child]:p-2 [&>button:last-child]:top-6 [&>button:last-child]:right-6 [&>button:last-child]:shadow-lg [&>button:last-child>svg]:h-6 [&>button:last-child>svg]:w-6",

  

              className

  

            )}>

  

              <div className="flex flex-col">

  

                {renderMedia()}

  

                

  

                {(title || description || children) && (

  

                  <div className="px-6 pb-8 pt-6 text-center">

  

                    <DialogHeader className="items-center">

  

                      {title && (

  

                        <DialogTitle className="text-2xl font-extrabold text-primary mb-2">

  

                          {title}

  

                        </DialogTitle>

  

                      )}

  

                      {description && (

  

                        <DialogDescription className="text-muted-foreground text-base leading-relaxed">

  

                          {description}

  

                        </DialogDescription>

  

                      )}

  

                    </DialogHeader>

  

      

  

                    {children && <div className="mt-6">{children}</div>}

  

                  </div>

  

                )}

  

              </div>

  

            </DialogContent>

  

          </Dialog>

  

        )

  

      }

  

      

  