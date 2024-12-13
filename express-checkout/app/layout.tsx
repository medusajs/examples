import { clx } from "@medusajs/ui"
import { Inter, Roboto_Mono } from "next/font/google"

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
      <body className="bg-ui-bg-subtle">
        <div className={clx(
          "lg:max-w-lg lg:mx-auto mx-4",
          "lg:mt-8 mt-4",
          "flex justify-center items-center"
        )}>{children}</div>
      </body>
    </html>
  )
}