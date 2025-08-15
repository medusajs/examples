import {
  Button,
  FocusModal,
  Heading,
  toast,
  ProgressTabs
} from "@medusajs/ui"
import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { 
  CustomField, 
  ComplementaryProduct,
  ProductBuilderResponse,
  AddonProduct
} from "../types"
import { AdminProduct } from "@medusajs/framework/types"
import { ComplementaryProductsTab } from "./complementary-products-tab"
import { AddonsTab } from "./addons-tab"
import { CustomFieldsTab } from "./custom-fields-tab"

type ProductBuilderModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: AdminProduct
  initialData?: ProductBuilderResponse['product_builder']
  onSuccess: () => void
}

export const ProductBuilderModal = ({
  open,
  onOpenChange,
  product,
  initialData,
  onSuccess
}: ProductBuilderModalProps) => {
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [complementaryProducts, setComplementaryProducts] = useState<ComplementaryProduct[]>([])
  const [addonProducts, setAddonProducts] = useState<AddonProduct[]>([])
  const [currentTab, setCurrentTab] = useState("custom-fields")

  const queryClient = useQueryClient()

  // Helper function to determine tab status
  const getTabStatus = (tabName: string): "not-started" | "in-progress" | "completed" => {
    const isCurrentTab = currentTab === tabName
    switch (tabName) {
      case "custom-fields":
        return customFields.length > 0 ? isCurrentTab ? 
          "in-progress" : "completed" :
            "not-started"
      case "complementary":
        return complementaryProducts.length > 0 ? isCurrentTab ? 
          "in-progress" : "completed" :
            "not-started"
      case "addons":
        return addonProducts.length > 0 ? isCurrentTab ? 
          "in-progress" : "completed" :
            "not-started"
      default:
        return "not-started"
    }
  }

  // Load initial data when modal opens
  useEffect(() => {
    setCustomFields(initialData?.custom_fields || [])
    setComplementaryProducts(initialData?.complementary_products || [])
    setAddonProducts(initialData?.addons || [])
    
    // Reset to first tab when modal opens
    setCurrentTab("custom-fields")
  }, [open, initialData])

  const { mutateAsync: saveConfiguration, isPending: isSaving } = useMutation({
    mutationFn: async (data: any) => {
      return await sdk.client.fetch(`/admin/products/${product.id}/builder`, {
        method: "POST",
        body: data
      })
    },
    onSuccess: () => {
      toast.success("Builder configuration saved successfully")
      queryClient.invalidateQueries({
        queryKey: ["product-builder", product.id]
      })
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(`Failed to save configuration: ${error.message}`)
    }
  })

  const handleSave = async () => {
    await saveConfiguration({
      custom_fields: customFields,
      complementary_products: complementaryProducts.map(cp => ({
        id: cp.id,
        product_id: cp.product_id
      })),
      addon_products: addonProducts.map(ap => ({
        id: ap.id,
        product_id: ap.product_id
      }))
    })
  }

  const handleComplementarySelection = (productId: string, checked: boolean) => {
    setComplementaryProducts((prev) => {
      if (checked) {
        return [
          ...prev,
          {
            product_id: productId
          }
        ]
      }

      return prev.filter((cp) => cp.product_id !== productId)
    })
  }

  const handleAddonSelection = (productId: string, checked: boolean) => {
    setAddonProducts((prev) => {
      if (checked) {
        return [
          ...prev,
          {
            product_id: productId
          }
        ]
      }

      return prev.filter((ap) => ap.product_id !== productId)
    })
  }

  const handleNextTab = () => {
    if (currentTab === "custom-fields") {
      setCurrentTab("complementary")
    } else if (currentTab === "complementary") {
      setCurrentTab("addons")
    }
  }

  const isLastTab = currentTab === "addons"

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Heading level="h1">Builder Configuration</Heading>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-1 flex-col overflow-hidden">
          <ProgressTabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-1 flex-col">
            <ProgressTabs.List className="flex items-center border-b">
              <ProgressTabs.Trigger 
                value="custom-fields" 
                status={getTabStatus("custom-fields")}
              >
                Custom Fields
              </ProgressTabs.Trigger>
              <ProgressTabs.Trigger 
                value="complementary" 
                status={getTabStatus("complementary")}
              >
                Complementary Products
              </ProgressTabs.Trigger>
              <ProgressTabs.Trigger 
                value="addons" 
                status={getTabStatus("addons")}
              >
                Addon Products
              </ProgressTabs.Trigger>
            </ProgressTabs.List>

            <ProgressTabs.Content value="custom-fields" className="flex-1 overflow-hidden">
              <CustomFieldsTab
                customFields={customFields}
                onCustomFieldsChange={setCustomFields}
              />
            </ProgressTabs.Content>

            <ProgressTabs.Content value="complementary" className="flex-1 overflow-hidden">
              <ComplementaryProductsTab
                product={product}
                complementaryProducts={complementaryProducts}
                onComplementaryProductSelection={handleComplementarySelection}
              />
            </ProgressTabs.Content>

            <ProgressTabs.Content value="addons" className="flex-1 overflow-hidden">
              <AddonsTab
                addonProducts={addonProducts}
                onAddonProductSelection={handleAddonSelection}
              />
            </ProgressTabs.Content>
          </ProgressTabs>
        </FocusModal.Body>
        <FocusModal.Footer>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={isLastTab ? handleSave : handleNextTab}
                isLoading={isLastTab && isSaving}
              >
                {isLastTab ? "Save Configuration" : "Next"}
              </Button>
            </div>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}
