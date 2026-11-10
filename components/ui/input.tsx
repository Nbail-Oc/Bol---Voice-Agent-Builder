import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-none border border-white/15 bg-[#0a0a0a] px-3 py-1.5 text-sm text-white placeholder:text-neutral-500 transition-colors outline-none focus-visible:border-white/40 focus-visible:ring-1 focus-visible:ring-white/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
