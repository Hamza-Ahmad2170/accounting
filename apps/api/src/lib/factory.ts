import { createFactory } from "hono/factory";
import type { Role, Session, User } from "./auth.js";

export type AppEnv = {
  Variables: {
    session: Session;
    user: User;
    role: Role[];
  };
};

export const factory = createFactory<AppEnv>();
