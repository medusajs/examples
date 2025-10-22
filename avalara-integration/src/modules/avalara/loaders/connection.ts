import {
  LoaderOptions,
} from "@medusajs/framework/types"
import Avatax from "avatax"
import { ModuleOptions } from "../types";
import { MedusaError } from "@medusajs/framework/utils";
import { asValue } from "@medusajs/framework/awilix";

export default async function avalaraConnectionLoader({
  container,
  options
}: LoaderOptions<ModuleOptions>) {
  const logger = container.resolve("logger")

  if (!options?.username || !options?.password || !options?.companyId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Avalara module options are required: username, password and companyId"
    )
  }

  try {
    const client = new Avatax({
      appName: options.appName || "medusa",
      appVersion: options.appVersion || "1.0.0",
      machineName: options.machineName || "medusa",
      environment: options.appEnvironment === "production" ? "production" : "sandbox",
      timeout: options.timeout || 3000,
    }).withSecurity({
      username: options.username,
      password: options.password,
    })

    // Test connection
    const pingResponse = await client.ping()
    if (!pingResponse.authenticated) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Avalara (Avatax) authentication failed"
      )
    }

    logger.info("[AVALARA] Avalara (Avatax) connection established")
    container.register("avatax", asValue(client))
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Error establishing Avalara connection: ${error}`
    )
  }
}