"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// Stub: react-hook-form is NOT installed. This file provides safe no-op exports
// so that any future component that imports from @/components/ui/form won't crash
// at build time. All form state management in this project uses plain useState + fetch.

const Form = React.forwardRef<HTMLFormElement, React.ComponentProps<"form">>(
  ({ className, ...props }, ref) => (
    <form ref={ref} className={cn("grid gap-2", className)} {...props} />
  )
)
Form.displayName = "Form"

type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormItemContext = React.createContext<{ id: string }>(
  {} as { id: string }
)

const FormField = ({ name, children }: { name: string; children: React.ReactNode }) => {
  const id = React.useId()
  return (
    <FormFieldContext.Provider value={{ name }}>
      <FormItemContext.Provider value={{ id }}>
        {children}
      </FormItemContext.Provider>
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  return {
    id: itemContext.id,
    name: fieldContext.name,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
    error: undefined as string | undefined,
    invalid: false,
  }
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { formItemId } = useFormField()
  return (
    <Label
      data-slot="form-label"
      className={className}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { formItemId, formDescriptionId } = useFormField()
  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={formDescriptionId}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="form-message"
      className={cn("text-destructive text-sm", className)}
      {...props}
    />
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}