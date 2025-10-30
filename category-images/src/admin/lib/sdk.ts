import Medusa from "@medusajs/js-sdk"

// Initialize the Medusa SDK client for admin use
export const sdk = new Medusa({
  baseUrl: typeof window !== "undefined" 
    ? window.location.origin 
    : "http://localhost:9000",
  auth: {
    type: "session",
  },
})

