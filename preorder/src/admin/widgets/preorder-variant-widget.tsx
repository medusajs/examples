import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Drawer,
  Label,
  DatePicker,
  DropdownMenu,
  IconButton,
  clx,
  usePrompt,
  StatusBadge,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { 
  DetailWidgetProps, 
  AdminProductVariant,
} from "@medusajs/framework/types"
import { Calendar, EllipsisHorizontal, Pencil, Plus, XCircle } from "@medusajs/icons"
import { usePreorderVariant } from "../hooks/use-preorder-variant"

const PreorderWidget = ({ 
  data: variant,
}: DetailWidgetProps<AdminProductVariant>) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [availableDate, setAvailableDate] = useState(
    new Date().toString()
  )

  const dialog = usePrompt()

  const {
    preorderVariant,
    isLoading,
    upsertPreorder: createPreorder,
    disablePreorder: deletePreorder,
    isUpserting: isCreating,
    isDisabling,
  } = usePreorderVariant(variant)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!availableDate) {
      return
    }

    createPreorder(
      { available_date: new Date(availableDate) },
      {
        onSuccess: () => {
          setIsDrawerOpen(false)
          setAvailableDate(new Date().toString())
        },
      }
    )
  }

  const handleDisable = async () => {
    const confirmed = await dialog({
      title: "Are you sure?",
      description: "This will remove the preorder configuration for this variant. Any existing preorders will not be automatically fulfilled.",
      variant: "danger",
    })
    if (confirmed) {
      deletePreorder()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (preorderVariant) {
      setAvailableDate(preorderVariant.available_date)
    } else {
      setAvailableDate(new Date().toString())
    }
  }, [preorderVariant])

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Heading level="h2">Pre-order</Heading>
            {preorderVariant?.status === "enabled" && (
              <StatusBadge color={"green"}>
                Enabled
              </StatusBadge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton size="small" variant="transparent">
                <EllipsisHorizontal />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                disabled={isCreating || isDisabling}
                onClick={() => setIsDrawerOpen(true)}
                className={clx(
                  "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                  {
                    "[&_svg]:text-ui-fg-disabled": isCreating || isDisabling,
                  }
                )}
              >
                { preorderVariant ? <Pencil /> : <Plus />}
                <span>
                  { preorderVariant ? "Edit" : "Add" } Pre-order Configuration
                </span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                disabled={isCreating || isDisabling || !preorderVariant}
                onClick={handleDisable}
                className={clx(
                  "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                  {
                    "[&_svg]:text-ui-fg-disabled": isCreating || isDisabling || !preorderVariant,
                  }
                )}
              >
                <XCircle />
                <span>
                  Remove Pre-order Configuration
                </span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>

          </DropdownMenu>
        </div>
        
        <div className="px-6 py-4">
          {isLoading ? (
            <Text>Loading pre-order information...</Text>
          ) : preorderVariant ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-ui-fg-subtle">
                <Calendar className="w-4 h-4" />
                <Text size="small">
                  Available: {formatDate(preorderVariant.available_date)}
                </Text>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Text className="text-ui-fg-subtle">
                This variant is not configured for pre-order
              </Text>
              <Text size="small" className="text-ui-fg-muted mt-1">
                Set up pre-order configuration to allow customers to order the product variant, then automatically fulfill it when it becomes available.
              </Text>
            </div>
          )}
        </div>
      </Container>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {preorderVariant ? "Edit" : "Add"} Pre-order Configuration
            </Drawer.Title>
          </Drawer.Header>
          
          <Drawer.Body>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="available-date">Available Date</Label>
                <DatePicker
                  id="available-date"
                  value={new Date(availableDate)}
                  onChange={(date) => setAvailableDate(date?.toString() || "")}
                  minValue={new Date()}
                  isRequired={true}
                />
                <Text size="small" className="text-ui-fg-subtle">
                  Customers can pre-order this variant until this date, when it becomes available for regular purchase.
                </Text>
              </div>
            </form>
          </Drawer.Body>

          <Drawer.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setIsDrawerOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={handleSubmit}
              isLoading={isCreating}
            >
              Save
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "product_variant.details.side.after",
})

export default PreorderWidget