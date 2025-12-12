"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { MouseEventHandler } from "react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  dialogContentClassName,
  darkBackground,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { dialogContentClassName?: string, darkBackground?: boolean }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className={darkBackground?"bg-black/90":""} />
      <div className={cn("fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]", className)}>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "bg-bg-secondary/50 backdrop-blur-lg border border-label-primary/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 mx-auto grid w-6xl p-4 py-8 md:py-4 h-full gap-3 shadow-lg duration-200",
            dialogContentClassName
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("uppercase font-bold", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  title,
  subheading,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & { title: string, subheading: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <DialogPrimitive.Title
          data-slot="dialog-title"
          className={cn("text-2xl", className)}
          {...props}
        >{title}</DialogPrimitive.Title>

        <DialogPrimitive.Description
          data-slot="dialog-description"
          className={cn("text-label-secondary font-consolas", className)}
          {...props}
        >{subheading}</DialogPrimitive.Description>
      </div>

      <DialogPrimitive.Close
        data-slot="dialog-close"
        className="ring-offset-bg-primary cursor-pointer focus:ring-label-primary data-[state=open]:bg-accent data-[state=open]:text-label-secondary h-fit p-2 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      >
        <XIcon />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </div>
  )
}


export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
