import { routes } from "./types";
import { Request } from "express";
import { AppError } from "../custom-error/error";
import jwt from "jsonwebtoken";

export const processHeader = (req: Request) => {
  const headers = Object.fromEntries(
    Object.entries(req.headers).filter(
      ([_, value]) => typeof value === "string",
    ),
  ) as Record<string, string>;
  delete headers["host"];
  delete headers["content-length"];
  delete headers["transfer-encoding"];
  delete headers["connection"];

  //create a jwt signature
  if (!process.env.GATEWAY_SECRET) {
    throw new AppError("env variable not found", 404);
  }
  const gatewayToken = jwt.sign(
    { service: "gateway" },
    process.env.GATEWAY_SECRET,
    {
      expiresIn: "5m",
    },
  );
  headers["x-gateway-signature"] = gatewayToken;
  headers["content-type"] = "application/json";
  return headers;
};

export const matchRoute = (pathname: string, routes: routes[]) => {
  for (const route of routes) {
    // Strip trailing "/*" if present in pattern
    const matchPattern = route.pattern.endsWith("/*")
      ? route.pattern.slice(0, -2)
      : route.pattern;

    if (pathname.startsWith(matchPattern)) {
      const remaining = pathname.slice(matchPattern.length) || "/";
      return {
        host: route.upstream,
        path: `${route.prefix}${remaining}`, // Get the remaining path after the matched pattern
      };
    }
  }

  return null;
};

const matchPattern = (path: string, pattern: string) => {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  const patternPath = pattern.slice(0, -2);

  if (path.startsWith(patternPath)) {
    return { matched: true };
  }

  if (pathParts.length !== patternParts.length) {
    return {
      matched: false,
    };
  }
};

export const forwardRequest = async (
  targetUrl: string,
  method: string,
  headers: Record<string, string>,
  body?: any,
) => {
  console.log("Forwarding to:", targetUrl);
  console.log("Forwarding body:", JSON.stringify(body));

  const response = await fetch(targetUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-gateway-signature": headers["x-gateway-signature"],
      ...(headers["authorization"] && {
        authorization: headers["authorization"],
      }),
      ...(headers["x-user-id"] && { "x-user-id": headers["x-user-id"] }),
      ...(headers["x-user-role"] && { "x-user-role": headers["x-user-role"] }),
    },
    body: ["GET", "HEAD"].includes(method) ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return { data, status: response.status };
};
