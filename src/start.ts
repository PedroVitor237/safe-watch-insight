import { createCsrfMiddleware, createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
});

const responseCacheMiddleware = createMiddleware().server(
  async ({ pathname, handlerType, next }) => {
    const result = await next();
    const headers = new Headers(result.response.headers);
    headers.set(
      "Cache-Control",
      handlerType === "router" && pathname === "/offline-shell"
        ? "public, max-age=0, must-revalidate"
        : "private, no-store",
    );
    return {
      ...result,
      response: new Response(result.response.body, {
        status: result.response.status,
        statusText: result.response.statusText,
        headers,
      }),
    };
  },
);

export const startInstance = createStart(() => ({
  requestMiddleware: [responseCacheMiddleware, csrfMiddleware, errorMiddleware],
}));
