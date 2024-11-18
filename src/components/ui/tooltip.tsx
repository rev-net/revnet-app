"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

type TooltipTriggerContextType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const TooltipTriggerContext = React.createContext<TooltipTriggerContextType>({
  open: false,
  setOpen: () => {},
})

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>
>(({ children, ...props }, ref) => {
  const [open, setOpen] = React.useState<boolean>(props.defaultOpen ?? false)
  const isMobile = useIsMobile()

  return (
    <TooltipPrimitive.Root
      {...props}
      delayDuration={isMobile ? 0 : props.delayDuration}
      onOpenChange={(e) => setOpen(e)}
      open={open}
    >
      <TooltipTriggerContext.Provider value={{ open, setOpen }}>
        {children}
      </TooltipTriggerContext.Provider>
    </TooltipPrimitive.Root>
  )
})
Tooltip.displayName = "Tooltip"

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ children, ...props }, ref) => {
  const isMobile = useIsMobile()
  const { setOpen } = React.useContext(TooltipTriggerContext)

  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      {...props}
      onClick={(e) => {
        if (isMobile) {
          e.preventDefault()
          setOpen(true)
        }
        props.onClick?.(e)
      }}
    >
      {children}
    </TooltipPrimitive.Trigger>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      side={isMobile ? "top" : undefined}
      align={isMobile ? "center" : undefined}
      className={cn(
        "z-50 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
        isMobile && "fixed -translate-x-1/4 w-60 max-h-64 overflow-y-auto",
        className
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
