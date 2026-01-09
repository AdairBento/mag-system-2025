import { z } from "zod";

import { emailSchema } from "../http/zod";

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(6).max(200),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    email: emailSchema,
    name: z.string().min(1).max(120),
    role: z.enum(["ADMIN", "OPERATOR", "VIEWER"]),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
