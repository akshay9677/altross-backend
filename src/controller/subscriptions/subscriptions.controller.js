import ModuleBase from "../moduleBase.controller"
import { SubscriptionSchema } from "../../model/subscriptions/Subscriptions.model"

class Subscriptions extends ModuleBase {
  constructor() {
    super(SubscriptionSchema, "Subscriptions")
  }
}

export default Subscriptions
