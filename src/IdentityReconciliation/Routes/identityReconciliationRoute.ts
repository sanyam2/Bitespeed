import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { identityRequestBody } from "../Schemas/identityReconciliationSchema";
import { getIdentityReconciliationHandler, identityReconciliationHandler } from "../Handlers/identityReconciliationHandler";

export async function IdentityReconciliationRoutes(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().post(
    "/identify",
    {
      schema: {
        description: "For Identity Reconciliation",
        produces: ["application/json"],
        tags: ["Identity Reconciliation"],
        body: identityRequestBody,
      },
    } as const,
    identityReconciliationHandler
  );

  server.withTypeProvider<ZodTypeProvider>().get(
    "/identity",
    {
      schema: {
        description: "Get All Identity Records from DB",
        produces: ["application/json"],
        tags: ["Identity Reconciliation"],
      },
    } as const,
    getIdentityReconciliationHandler
  );
}