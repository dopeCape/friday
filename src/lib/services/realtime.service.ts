import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import Pusher from "pusher";
import env from "@/config/env.config";

export default class RealtimeService {
  private static instance: RealtimeService | null;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private client: Pusher = new Pusher({
    appId: env.PUSHER_APP_ID,
    secret: env.PUSHER_SECRET,
    key: env.PUSHER_APP_KEY,
    cluster: env.PUSHER_CLUSTER,
  })
  private constructor(logger: Logger) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  public static getInstace(logger: Logger) {
    if (!this.instance) {
      this.instance = new RealtimeService(logger);
    }
    return this.instance;
  }

  public pushToClient(channel: string, event: string, data: Record<string, any>) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Pushing data to client", {
        channel,
        data
      })
      const res = await this.client.trigger(channel, event, data);
      this.logger.info("Sent data to channel", {
        status: res.status,
        data: await res.json()
      });
    }, {
      service: "RealtimeService",
      method: "pushToClient"

    })
  }
}
