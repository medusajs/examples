import {
  Button,
  Heading,
  Input,
  Label,
  Select,
  Checkbox,
  Text
} from "@medusajs/ui"
import { Trash } from "@medusajs/icons"
import { CustomField } from "../types"

type CustomFieldsTabProps = {
  customFields: CustomField[]
  onCustomFieldsChange: (fields: CustomField[]) => void
}

export const CustomFieldsTab = ({
  customFields,
  onCustomFieldsChange
}: CustomFieldsTabProps) => {
  const addCustomField = () => {
    const newFields = [
      ...customFields,
      {
        name: "",
        type: "text" as const,
        description: "",
        is_required: false
      }
    ]
    onCustomFieldsChange(newFields)
  }

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    const updated = [...customFields]
    updated[index] = { ...updated[index], ...field }
    onCustomFieldsChange(updated)
  }

  const removeCustomField = (index: number) => {
    const filtered = customFields.filter((_, i) => i !== index)
    onCustomFieldsChange(filtered)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Heading level="h2">Custom Fields</Heading>
          <Button size="small" variant="secondary" onClick={addCustomField}>
            Add Field
          </Button>
        </div>
        
        {customFields.length === 0 ? (
          <Text className="text-ui-fg-muted">No custom fields configured.</Text>
        ) : (
          <div className="space-y-4">
            {customFields.map((field, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Field {index + 1}</Label>
                  <Button 
                    size="small" 
                    variant="transparent" 
                    onClick={() => removeCustomField(index)}
                  >
                    <Trash />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={field.name}
                      onChange={(e) => updateCustomField(index, { name: e.target.value })}
                      placeholder="Field name"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) => updateCustomField(index, { type: value as "text" | "number" })}
                    >
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="text">Text</Select.Item>
                        <Select.Item value="number">Number</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    value={field.description || ""}
                    onChange={(e) => updateCustomField(index, { description: e.target.value })}
                    placeholder="Provide helpful instructions for this field"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`required-${index}`}
                    checked={field.is_required}
                    onCheckedChange={(checked) => 
                      updateCustomField(index, { is_required: !!checked })
                    }
                  />
                  <Label htmlFor={`required-${index}`}>Required field</Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
