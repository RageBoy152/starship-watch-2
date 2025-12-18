"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronDownIcon } from "lucide-react"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    >
      <div className="flex justify-between items-center cursor-pointer group">
        <span className="select-none">{props.children}</span>
        <ChevronDownIcon className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </div>
    </CollapsiblePrimitive.CollapsibleTrigger>
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
      className="overflow-hidden duration-200 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
