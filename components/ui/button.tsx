import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva("btn", {
  variants: {
    variant: {
      default: "btn--default",
      outline: "btn--outline",
      secondary: "btn--secondary",
      ghost: "btn--ghost",
      destructive: "btn--destructive",
      link: "btn--link",
    },
    size: {
      default: "btn--size-default",
      xs: "btn--size-xs",
      sm: "btn--size-sm",
      lg: "btn--size-lg",
      icon: "btn--size-icon",
      "icon-xs": "btn--size-icon-xs",
      "icon-sm": "btn--size-icon-sm",
      "icon-lg": "btn--size-icon-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
