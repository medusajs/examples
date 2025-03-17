import { Button, Checkbox, Drawer, Label, toast } from "@medusajs/ui"
import { 
  useForm,
  FormProvider,
  Controller,
} from "react-hook-form"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

type MigrationType = "category" | "product"

const schema = z.object({
  type: z.enum(["category", "product"]).array()
})

export const MigrationForm = () => {
  const queryClient = useQueryClient()
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      type: ["product", "category"],
    },
  })

  const { mutateAsync } = useMutation({
    mutationFn: () => sdk.client.fetch("/admin/magento/migrations", {
      method: "post",
      body: {
        type: form.getValues().type
      }
      }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["magento"],
      });
      toast.success("Migration started")
    },
    onError: (e) => {
      toast.error(e.message)
    }
  })

  const handleSubmit = form.handleSubmit(async () => {
    await mutateAsync()
  })

  const onCheckboxChange = (type: MigrationType) => {
    form.setValue("type", 
      form.getValues().type.includes(type) ? form.getValues().type.filter((v) => v !== type) : [...form.getValues().type, type] as MigrationType[]
    )
  }

  return (
    <Drawer.Content>
      <FormProvider {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col overflow-hidden"
          >
            <Drawer.Header>
              <Drawer.Title>Migrate Data from Magento</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body className="p-4">
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => {
                  console.log(field)
                  return (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-x-1">
                        <Label size="small" weight="plus">
                          Type
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="category" 
                          checked={field.value.includes("category")} 
                          onCheckedChange={() => { onCheckboxChange("category") }}
                        />
                        <Label htmlFor="category">
                          Category
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="product" 
                          checked={field.value.includes("product")} 
                          onCheckedChange={() => { onCheckboxChange("product") }}
                        />
                        <Label htmlFor="product">
                          Product
                        </Label>
                      </div>
                    </div>
                  )
                }}
              />
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">
                    Cancel
                  </Button>
                </Drawer.Close>
                <Drawer.Close asChild>
                  <Button type="submit" size="small">Migrate</Button>
                </Drawer.Close>
              </div>
            </Drawer.Footer>
          </form>
      </FormProvider>
    </Drawer.Content>
  )
}