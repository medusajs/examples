"use client"

import { clx } from "@medusajs/ui"
import { useRegion } from "../../providers/region"

export const SecondCol = () => {
  const { region, regions, setRegion } = useRegion()

  return (
    <div className={clx(
      "flex flex-col justify-center items-center gap-6",
      "lg:w-1/2 w-full"
    )}>
      <div className="flex flex-col justify-center gap-1">
        <span className="text-xs text-ui-fg-subtle">
          Powered by
        </span>
        <img 
          src="https://res.cloudinary.com/dza7lstvk/image/upload/v1735642745/Medusa%20Resources/medusa-express-logo_gqu5qy.png" 
          alt="Medusa" 
          width={67}
          height={16}
        />
      </div>
      <div className="flex justify-center gap-1">
        <span className="text-sm text-ui-fg-muted">
          Region:
        </span>
        <select
          value={region?.id}
          onChange={(e) => {
            const selectedRegion = regions.find(
              (r) => r.id === e.target.value
            )
            setRegion(selectedRegion)
          }}
          className={clx(
            "text-sm text-ui-fg-subtle",
            "select",
          )}
        >
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}