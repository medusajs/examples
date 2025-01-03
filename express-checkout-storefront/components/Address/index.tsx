"use client"

import { useMemo, useState } from "react"
import { useCart } from "../../providers/cart"
import { Card } from "../Card"
import { useRegion } from "../../providers/region"
import { Button, Input, Select } from "@medusajs/ui"
import { useRouter } from "next/navigation"

type AddressProps = {
  handle: string
  isActive: boolean
}

export const Address = ({
  handle,
  isActive
}: AddressProps) => {
  const { cart, updateCart } = useCart()
  const { region } = useRegion()
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState(cart?.shipping_address?.first_name || "")
  const [lastName, setLastName] = useState(cart?.shipping_address?.last_name || "")
  const [email, setEmail] = useState(cart?.email || "")
  const [phone, setPhone] = useState(cart?.shipping_address?.phone || "")
  const [address, setAddress] = useState(cart?.shipping_address?.address_1 || "")
  const [postalCode, setPostalCode] = useState(cart?.shipping_address?.postal_code || "")
  const [city, setCity] = useState(cart?.shipping_address?.city || "")
  const [country, setCountry] = useState(cart?.shipping_address?.country_code || region?.countries?.[0]?.iso_2 || "")
  const router = useRouter()

  const isButtonDisabled = useMemo(() => {
    return loading || !firstName || !lastName || !email || !phone || !address || !postalCode || !city || !country
  }, [firstName, lastName, email, phone, address, postalCode, city, country, loading])

  const handleSubmit = () => {
    if (isButtonDisabled) {
      return
    }

    setLoading(true)

    updateCart({
      updateData: {
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          phone,
          address_1: address,
          postal_code: postalCode,
          city,
          country_code: country,
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          phone,
          address_1: address,
          postal_code: postalCode,
          city,
          country_code: country,
        },
        email,
      },
    })
    .then(() => {
      setLoading(false)
      router.push(`/${handle}?step=shipping`)
    })
  }

  return (
    <Card 
      title="Delivery Address" 
      isActive={isActive} 
      isDone={!!cart?.shipping_address}
      path={`/${handle}?step=address`}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs">Contact</span>
          <div className="flex gap-2">
            <Input
              name="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
            <Input
              name="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>
          <Input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <Input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs">Delivery</span>
          <Input
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
          />
          <div className="flex gap-2">
            <Input
              name="postal_code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal code"
            />
            <Input
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
          </div>
          <Select
            value={country}
            onValueChange={(value) => setCountry(value)}
          >
            <Select.Trigger>
              <Select.Value placeholder="Country" />
            </Select.Trigger>
            <Select.Content>
              {region?.countries?.map((country) => (
                <Select.Item
                  key={country.iso_2}
                  value={country.iso_2 || ""}
                >
                  {country.display_name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <hr className="bg-ui-bg-subtle" />
        <Button
          disabled={isButtonDisabled}
          onClick={handleSubmit}
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </Card>
  )
}