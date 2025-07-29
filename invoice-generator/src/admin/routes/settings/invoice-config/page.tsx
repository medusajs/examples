import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { sdk } from "../../../lib/sdk"
import { useForm } from "react-hook-form"
import * as zod from "zod"
import { 
  FormProvider,
  Controller,
} from "react-hook-form"
import { useCallback, useEffect } from "react"

type InvoiceConfig = {
  id: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_logo?: string;
  notes?: string;
}

const schema = zod.object({
  company_name: zod.string().optional(),
  company_address: zod.string().optional(),
  company_phone: zod.string().optional(),
  company_email: zod.string().email().optional(),
  company_logo: zod.string().url().optional(),
  notes: zod.string().optional(),
})

const InvoiceConfigPage = () => {
  const { data, isLoading, refetch } = useQuery<{
    invoice_config: InvoiceConfig
  }>({
    queryFn: () => sdk.client.fetch("/admin/invoice-config"),
    queryKey: ["invoice-config"],
  })
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: zod.infer<typeof schema>) => 
      sdk.client.fetch("/admin/invoice-config", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      refetch()
      toast.success("Invoice config updated successfully")
    },
  })

  const getFormDefaultValues = useCallback(() => {
    return {
      company_name: data?.invoice_config.company_name || "",
      company_address: data?.invoice_config.company_address || "",
      company_phone: data?.invoice_config.company_phone || "",
      company_email: data?.invoice_config.company_email || "",
      company_logo: data?.invoice_config.company_logo || "",
      notes: data?.invoice_config.notes || "",
    }
  }, [data])

  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: getFormDefaultValues(),
  })

  const handleSubmit = form.handleSubmit((formData) => mutateAsync(formData))

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const { files } = await sdk.admin.upload.create({
      files: [file],
    })

    form.setValue("company_logo", files[0].url)
  }

  useEffect(() => {
    form.reset(getFormDefaultValues())
  }, [getFormDefaultValues])


  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Invoice Config</Heading>
      </div>
      <FormProvider {...form}>
        <form 
          onSubmit={handleSubmit}
          className="flex h-full flex-col overflow-hidden p-2 gap-2"
        >
          <Controller
            control={form.control}
            name="company_name"
            render={({ field }) => {
              return (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Company Name
                    </Label>
                  </div>
                  <Input {...field} onChange={field.onChange} value={field.value} />
                </div>
              )
            }}
          />
          <Controller
            control={form.control}
            name="company_address"
            render={({ field }) => {
              return (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Company Address
                    </Label>
                  </div>
                  <Textarea {...field} />
                </div>
              )
            }}
          />
          <Controller
            control={form.control}
            name="company_phone"
            render={({ field }) => {
              return (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Company Phone
                    </Label>
                  </div>
                  <Input {...field} />
                </div>
              )
            }}
          />
          <Controller
            control={form.control}
            name="company_email"
            render={({ field }) => {
              return (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Company Email
                    </Label>
                  </div>
                  <Input {...field} />
                </div>
              )
            }}
          />
          <Controller
            control={form.control}
            name="notes"
            render={({ field }) => {
              return (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Notes
                    </Label>
                  </div>
                  <Textarea {...field} />
                </div>
              )
            }}
          />
          <Controller
            control={form.control}
            name="company_logo"
            render={({ field }) => {
              return (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-x-1">
                    <Label size="small" weight="plus">
                      Company Logo
                    </Label>
                  </div>
                  <Input type="file" onChange={uploadLogo} className="py-1" />
                  {field.value && (
                    <img
                      src={field.value}
                      alt="Company Logo"
                      className="mt-2 h-24 w-24"
                    />
                  )}
                </div>
              )
            }}
          />
          <Button type="submit" disabled={isLoading || isPending}>
            Save
          </Button>
        </form>
      </FormProvider>
    </Container>
  ) 
}

export const config = defineRouteConfig({
  label: "Default Invoice Config",
})

export default InvoiceConfigPage