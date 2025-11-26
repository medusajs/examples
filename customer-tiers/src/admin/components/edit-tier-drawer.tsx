import { Drawer, Heading, Label, Input, Button, Select, IconButton, toast } from "@medusajs/ui"
import { useForm, Controller, FormProvider } from "react-hook-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { useState, useEffect } from "react"
import { Tier } from "../routes/tiers/page"
import { Trash } from "@medusajs/icons"

type EditTierFormData = {
  name: string
  promo_id: string | null
  tier_rules: Array<{
    min_purchase_value: number
    currency_code: string
  }>
}

type EditTierDrawerProps = {
  tier: Tier | undefined
}

export const EditTierDrawer = ({ tier }: EditTierDrawerProps) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [tierRules, setTierRules] = useState<{
    currency_code: string
    min_purchase_value: number
  }[]>([])

  const form = useForm<EditTierFormData>({
    defaultValues: {
      name: "",
      promo_id: null,
      tier_rules: [],
    },
  })

  const { data: promotionsData } = useQuery({
    queryFn: () => sdk.admin.promotion.list(),
    queryKey: ["promotions", "list"],
    enabled: open,
  })

  const { data: storeData } = useQuery({
    queryFn: () =>
      sdk.admin.store.list({
        fields: "id,supported_currencies.*,supported_currencies.currency.*",
      }),
    queryKey: ["store"],
    enabled: open,
  })

  const updateTierMutation = useMutation({
    mutationFn: async (data: EditTierFormData) => {
      if (!tier) return
      return await sdk.client.fetch(`/admin/tiers/${tier.id}`, {
        method: "POST",
        body: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tier", tier?.id] })
      queryClient.invalidateQueries({ queryKey: ["tiers"] })
      setOpen(false)
      toast.success("Success", {
        description: "Tier updated successfully",
        position: "top-right",
      })
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
        position: "top-right",
      })
    },
  })

  // Initialize form when tier data is available
  useEffect(() => {
    if (tier && open) {
      form.reset({
        name: tier.name,
        promo_id: tier.promotion?.id || null,
        tier_rules: tier.tier_rules || [],
      })
      setTierRules(
        tier.tier_rules?.map((rule) => ({
          currency_code: rule.currency_code,
          min_purchase_value: rule.min_purchase_value,
        })) || []
      )
    }
  }, [tier, open, form])

  const handleSubmit = form.handleSubmit((data) => {
    updateTierMutation.mutate({
      ...data,
      tier_rules: tierRules,
    })
  })

  const promotions = promotionsData?.promotions || []
  const store = storeData?.stores?.[0]
  const supportedCurrencies = store?.supported_currencies || []

  const getAvailableCurrencies = () => {
    const usedCurrencies = new Set(tierRules.map((rule) => rule.currency_code))
    return supportedCurrencies.filter((sc) => !usedCurrencies.has(sc.currency_code))
  }

  const addTierRule = () => {
    const availableCurrencies = getAvailableCurrencies()
    if (availableCurrencies.length > 0) {
      const firstCurrency = availableCurrencies[0].currency_code
      setTierRules([
        ...tierRules,
        {
          currency_code: firstCurrency,
          min_purchase_value: 0,
        },
      ])
    }
  }

  const removeTierRule = (index: number) => {
    setTierRules(tierRules.filter((_, i) => i !== index))
  }

  const updateTierRule = (
    index: number,
    field: "currency_code" | "min_purchase_value",
    value: string | number
  ) => {
    const updated = [...tierRules]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    setTierRules(updated)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="secondary" size="small">
          Edit
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading level="h1">Edit Tier</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
              <Controller
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <div className="flex flex-col space-y-2">
                    <Label size="small" weight="plus">
                      Name
                    </Label>
                    <Input {...field} placeholder="e.g., Bronze, Silver, Gold" />
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="promo_id"
                render={({ field }) => (
                  <div className="flex flex-col space-y-2">
                    <Label size="small" weight="plus">
                      Promotion (Optional)
                    </Label>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => field.onChange(value || null)}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select a promotion" />
                      </Select.Trigger>
                      <Select.Content>
                        {promotions.map((promo) => (
                          <Select.Item key={promo.id} value={promo.id}>
                            {promo.code}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                )}
              />

              <div className="flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                  <Label size="small" weight="plus">
                    Tier Rules
                  </Label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={addTierRule}
                    disabled={getAvailableCurrencies().length === 0}
                  >
                    Add Rule
                  </Button>
                </div>

                {tierRules.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No tier rules added. Click "Add Rule" to add a rule for a currency.
                  </div>
                )}

                {tierRules.map((rule, index) => (
                  <div key={index} className="flex items-end gap-x-2 rounded-lg border p-4">
                    <div className="flex flex-1 flex-col gap-y-2">
                      <Label size="small">Currency</Label>
                      <Select
                        value={rule.currency_code}
                        onValueChange={(value) => updateTierRule(index, "currency_code", value)}
                      >
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {supportedCurrencies
                            .filter((sc) => {
                              return (
                                sc.currency_code === rule.currency_code ||
                                !tierRules.some(
                                  (r, i) => i !== index && r.currency_code === sc.currency_code
                                )
                              )
                            })
                            .map((sc) => (
                              <Select.Item key={sc.currency_code} value={sc.currency_code}>
                                {sc.currency.code.toUpperCase()} - {sc.currency.name}
                              </Select.Item>
                            ))}
                        </Select.Content>
                      </Select>
                    </div>
                    <div className="flex flex-1 flex-col gap-y-2">
                      <Label size="small">Minimum Purchase Value</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={rule.min_purchase_value}
                        onChange={(e) =>
                          updateTierRule(index, "min_purchase_value", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <IconButton
                      type="button"
                      variant="transparent"
                      size="small"
                      onClick={() => removeTierRule(index)}
                    >
                      <Trash />
                    </IconButton>
                  </div>
                ))}
              </div>
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button size="small" type="submit" isLoading={updateTierMutation.isPending}>
                  Save
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  )
}

