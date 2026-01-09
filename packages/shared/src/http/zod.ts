import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email().max(255);

export const cpfCnpjSchema = z.string().min(11).max(18);
export const phoneSchema = z.string().min(8).max(20);
