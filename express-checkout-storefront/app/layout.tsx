import { clx } from "@medusajs/ui"
import { Inter, Roboto_Mono } from "next/font/google"
import { RegionProvider } from "../providers/region"
import "./globals.css"
import { SecondCol } from "../components/SecondCol"
import { CartProvider } from "../providers/cart"

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
})

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
})


export default function Layout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={clx(inter.variable, robotoMono.variable)}>
      <body className="bg-ui-bg-subtle w-full h-full">
        <div className={clx(
          "flex justify-center items-center min-h-screen w-full",
        )}>
          <RegionProvider>
            <CartProvider>
              <div className={clx(
                "flex gap-2 lg:my-16 my-4",
                "lg:w-[758px] lg:mx-auto w-full mx-4"
              )}>
                <div className="flex flex-col gap-2 lg:w-1/2 w-full">
                  {children}
                </div>
                <SecondCol />
              </div>
            </CartProvider>
          </RegionProvider>
        </div>
      </body>
    </html>
  )
}