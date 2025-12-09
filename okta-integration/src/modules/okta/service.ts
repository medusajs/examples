import { AbstractAuthModuleProvider } from "@medusajs/framework/utils"
import {
  AuthIdentityProviderService,
  AuthenticationInput,
  AuthenticationResponse,
  Logger,
} from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  oktaDomain: string
  clientId: string
  clientSecret: string
  redirectUri: string
}

class OktaAuthProviderService extends AbstractAuthModuleProvider {
  static DISPLAY_NAME = "Okta"
  static identifier = "okta"

  // Scopes requested from Okta during authentication
  private static readonly SCOPES = ["openid", "profile", "email"]

  protected logger_: Logger
  protected options_: Options

  constructor(
    { logger }: InjectedDependencies,
    options: Options
  ) {
    // @ts-ignore
    super(...arguments)

    this.logger_ = logger
    this.options_ = options
  }

  /**
   * Validate options passed to the provider
   */
  static validateOptions(options: Record<any, any>): void | never {
    if (!options.oktaDomain) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Okta auth provider requires oktaDomain option"
      )
    }

    if (!options.clientId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Okta auth provider requires clientId option"
      )
    }

    if (!options.clientSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Okta auth provider requires clientSecret option"
      )
    }

    if (!options.redirectUri) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Okta auth provider requires redirectUri option"
      )
    }
  }

  /**
   * Authenticate method initiates the OAuth flow by returning
   * the authorization URL to redirect the user to Okta's consent page
   */
  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { body } = data

    // If callback_url is provided, use it; otherwise use the default redirectUri
    const callbackUrl = body?.callback_url || this.options_.redirectUri

    // Generate state parameter for CSRF protection
    const state = this.generateState()

    await authIdentityProviderService.setState(state, {
      callback_url: callbackUrl,
    })
    
    const params = new URLSearchParams({
      client_id: this.options_.clientId,
      response_type: "code",
      scope: OktaAuthProviderService.SCOPES.join(" "),
      redirect_uri: callbackUrl,
      state: state,
    })

    const authUrl = `${this.options_.oktaDomain}/oauth2/v1/authorize?${params.toString()}`

    // Return the authorization URL for the frontend to redirect to
    return {
      success: true,
      location: authUrl,
    }
  }

  /**
   * Validate callback method handles the OAuth callback from Okta
   */
  async validateCallback(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { query } = data

    const code = query?.code as string
    const stateKey = query?.state as string

    if (!code) {
      return {
        success: false,
        error: "Authorization code is missing",
      }
    }

    const state = await authIdentityProviderService.getState(stateKey)

    if (!state) {
      return {
        success: false,
        error: "No state provided, or session expired",
      }
    }

    const callbackUrl = state.callback_url as string

    try {

      // Get user info from Okta using the access token
      const tokenUrl = `${this.options_.oktaDomain}/oauth2/v1/token`
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: callbackUrl,
        client_id: this.options_.clientId,
        client_secret: this.options_.clientSecret,
      })

      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Failed to exchange code for tokens: ${errorText}`
        )
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token as string
      const refreshToken = tokenData.refresh_token as string | undefined
      const idToken = tokenData.id_token as string | undefined
      const expiresIn = tokenData.expires_in as number

      // Get user info from Okta using the access token
      const userInfoUrl = `${this.options_.oktaDomain}/oauth2/v1/userinfo`
      const userInfoResponse = await fetch(userInfoUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })

      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text()
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Failed to get user info: ${errorText}`
        )
      }

      const userInfo = await userInfoResponse.json()

      console.log(userInfo)

      // Extract user identifier (email or sub)
      const entityId = userInfo.email || userInfo.sub

      if (!entityId) {
        return {
          success: false,
          error: "Unable to retrieve user identifier from Okta",
        }
      }

      let authIdentity
      try {
        // Try to retrieve by entity_id
        authIdentity = await authIdentityProviderService.retrieve({
          entity_id: entityId,
        })

        // Update existing auth identity with latest user metadata
        authIdentity = await authIdentityProviderService.update(entityId, {
          user_metadata: {
            email: userInfo.email,
            name: userInfo.name,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
            picture: userInfo.picture,
            updated_at: new Date().toISOString(),
          },
          provider_metadata: {
            okta_sub: userInfo.sub,
            access_token: accessToken,
            refresh_token: refreshToken,
            id_token: idToken,
            expires_at: Date.now() + expiresIn * 1000,
          },
        })
      } catch (error) {
        if (error.type === MedusaError.Types.NOT_FOUND) {
          // Auth identity doesn't exist, create it
          authIdentity = await authIdentityProviderService.create({
            entity_id: entityId,
            provider_metadata: {
              okta_sub: userInfo.sub,
              access_token: accessToken,
              refresh_token: refreshToken,
              id_token: idToken,
              expires_at: Date.now() + expiresIn * 1000,
            },
            user_metadata: {
              email: userInfo.email,
              name: userInfo.name,
              given_name: userInfo.given_name,
              family_name: userInfo.family_name,
              picture: userInfo.picture,
            },
          })
        } else {
          // Re-throw if it's not a NOT_FOUND error
          throw error
        }
      }

      return {
        success: true,
        authIdentity,
      }
    } catch (error) {
      this.logger_.error("Okta authentication error:", error)
      return {
        success: false,
        error: error.message || "Failed to authenticate with Okta",
      }
    }
  }


  /**
   * Generate a random state parameter for CSRF protection
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }
}

export default OktaAuthProviderService

