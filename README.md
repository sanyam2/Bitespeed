# Bitespeed
Bitespeed Identity Reconciliation

- Implemented 'POST: /identify' endpoint, which provides identity reconciliation.
- Added input validation on the API request.
- Implemented additional 'GET: /identity' endpoint, which returns all the records from DB (provides DB state)
- Integrated Swagger for API documentation, accessible via the root URL.

Technologies used: Fastify, Prisma, PostgreSQL, NodeJS, TypeScript, Zod

### Deployed the API server and database on Render 
## Swagger:
https://bitespeed-963x.onrender.com
## 'POST: /identify', Hosted API endpoint for identity reconciliation: 
https://bitespeed-963x.onrender.com/identify
