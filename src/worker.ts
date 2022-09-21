import { ValidationError } from "yup";
import {
  BadRequestError,
  OctoError,
  InternalServerError,
} from "./models/Error";
import { ValidationController } from "./services/validation/Controller";
import { validationConfigSchema } from "./schemas/Validation";
import { Config } from "./services/validation/config/Config";

export default {
  async fetch(
    request: Request
    //   env: Env,
    //   ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 400 });
    }
    try {
      const reqBody = await request.json();
      await validationConfigSchema.validate(reqBody);
      const schema = validationConfigSchema.cast(reqBody);
      const config = Config.getInstance();
      config.init(schema);
      const body = await new ValidationController().validate();

      return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      if (err instanceof OctoError) {
        return new Response(JSON.stringify(err.body), {
          status: err.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else if (err instanceof ValidationError) {
        const error = new BadRequestError(err.message);
        return new Response(JSON.stringify(error.body), {
          status: error.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        const error = new InternalServerError(err.message);
        return new Response(JSON.stringify(error.body), {
          status: error.status,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }
  },
};
