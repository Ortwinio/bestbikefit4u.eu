/** Keep diagnostic detail on stderr, never in the browser response. */
export function sendFixtureError(response, error) {
  console.error(error);
  response.statusCode = error?.code === "ENOENT" ? 404 : 500;
  response.setHeader("content-type", "text/plain; charset=utf-8");
  response.end(response.statusCode === 404 ? "Not found" : "Internal server error");
}
