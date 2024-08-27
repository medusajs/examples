import { 
  authenticate, 
  defineMiddlewares, 
} from "@medusajs/medusa";
import { isDeliveryRestaurant } from "../../utils/is-delivery-restaurant";
import { isDeliveryDriver } from "../../utils/is-delivery-driver";

export default defineMiddlewares({
  routes: [
    // restaurant routes
    {
      matcher: "/deliveries/:id/accept",
      middlewares: [
        authenticate("restaurant", "bearer"),
        isDeliveryRestaurant
      ]
    },
    {
      matcher: "/deliveries/:id/prepare",
      middlewares: [
        authenticate("restaurant", "bearer"),
        isDeliveryRestaurant
      ]
    },
    {
      matcher: "/deliveries/:id/ready",
      middlewares: [
        authenticate("restaurant", "bearer"),
        isDeliveryRestaurant
      ]
    },
    // driver routes
    {
      matcher: "/deliveries/:id/claim",
      middlewares: [
        authenticate("driver", "bearer"),
      ]
    },
    {
      matcher: "/deliveries/:id/pick-up",
      middlewares: [
        authenticate("driver", "bearer"),
        isDeliveryDriver
      ]
    },
    {
      matcher: "/deliveries/:id/complete",
      middlewares: [
        authenticate("driver", "bearer"),
        isDeliveryDriver
      ]
    },
  ]
})