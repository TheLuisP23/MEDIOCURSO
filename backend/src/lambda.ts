// Adaptador para AWS Lambda (API Gateway HTTP API). Lo empaqueta `npm run build`.
import { handle } from "hono/aws-lambda";
import { crearApp } from "./app.js";

export const handler = handle(crearApp());
