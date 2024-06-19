import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import {
  jsonSchemaTransform, serializerCompiler, validatorCompiler
} from "fastify-type-provider-zod";

import routes from "./routes.js";
import { ZodError } from "zod";

async function buildServer() {
  const server = fastify({ logger: true });

  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "BiteSpeed",
        description: "BiteSpeed Assignment",
        version: "1.0.0",
      },
      servers: [
        {
          url: "/",
          description: "Local",
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: "/",
  });
  await server.setValidatorCompiler(validatorCompiler);
  await server.setSerializerCompiler(serializerCompiler);

  await server.setErrorHandler((error, _request, reply) => {
    console.log(error);
    if (error instanceof ZodError) {
      reply.status(409).send({
        code: 409,
        message: "Form validation error",
        errors: error.issues,
      });
    } else {
      reply.status(500).send(error);
    }
  });

  for (const route of routes) {
    await server.register(route);
  }
  
  await server.ready();

  return server;
}

export default buildServer;