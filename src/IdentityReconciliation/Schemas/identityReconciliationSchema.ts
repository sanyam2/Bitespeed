import { z } from "zod";

export const identityRequestBody = z.object({
    email: z.string().email().optional().nullable(),
    phoneNumber: z.string().min(5).max(20).optional().nullable()
}).refine(data => data.email || data.phoneNumber, {
    message: "At least one of 'email' or 'phoneNumber' must be provided",
    path: ["email", "phoneNumber"]
});

export type identityRequestBodyType = z.infer<typeof identityRequestBody>