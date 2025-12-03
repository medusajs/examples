import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, toast } from "@medusajs/ui"
import { decodeToken } from "react-jwt"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"
import { useEffect, useMemo } from "react"
import OktaIcon from "../components/okta-icon"

const OKTA_AUTH_PROVIDER = "okta"

const LoginWithOkta = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Handle custom login button click
  const oktaLogin = async () => {
    const result = await sdk.auth.login("user", OKTA_AUTH_PROVIDER, {})

    if (typeof result === "object" && result.location) {
      // Redirect to okta for authentication
      window.location.href = result.location
      return
    }
    
    if (typeof result !== "string") {
      // Result failed, show an error
      toast.error("Authentication failed")
      return
    }

    // User is authenticated
    navigate("/orders")
  }
  
  const sendCallback = async () => {
    try {
      return await sdk.auth.callback(
        "user", 
        OKTA_AUTH_PROVIDER, 
        Object.fromEntries(searchParams)
      )
    } catch (error) {
      toast.error("Authentication failed")
      throw error
    }
  }

  // Validate the authentication callback
  const validateCallback = async () => {
    const token = await sendCallback()

    const decodedToken = decodeToken(token) as { actor_id: string, user_metadata: Record<string, unknown> }

    const userExists = decodedToken.actor_id !== ""

    if (!userExists) {
      // Create user
      await sdk.client.fetch("/okta/users", {
        method: "POST",
        body: {
          email: decodedToken.user_metadata?.email as string,
          first_name: decodedToken.user_metadata?.given_name as string,
          last_name: decodedToken.user_metadata?.family_name as string,
        },
      })

      const newToken = await sdk.auth.refresh()

      if (!newToken) {
        toast.error("Authentication failed")
        return
      }
    }

    // User is authenticated
    navigate("/orders")
  }

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      if (isPending) {
        return
      }
      return await validateCallback()
    },
    onError: (error) => {
      console.error("Custom authentication error:", error)
    },
  })

  // Handle the redirection back from the third-party provider
  useEffect(() => {
    // Check for provider-specific query parameters
    if (searchParams.get("code")) {
      mutateAsync()
    }
  }, [searchParams, mutateAsync])

  const showLoading = useMemo(() => {
    return isPending || !!searchParams.get("code")
  }, [isPending, searchParams])

  return (
    <>
      {showLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-ui-bg-base p-8 shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-ui-border-base border-t-ui-fg-interactive" />
            <p className="text-ui-fg-subtle text-sm">Please wait...</p>
          </div>
        </div>
      )}
      <hr className="bg-ui-border-base my-4" />
      <Button 
        variant="secondary" 
        onClick={oktaLogin} 
        className="w-full"
        isLoading={showLoading}
      >
        <OktaIcon />
        Login with Okta
      </Button>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "login.after",
})

export default LoginWithOkta