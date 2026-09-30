import { forwardRef } from "react";

export default forwardRef(function FixtureLink({ href, prefetch, replace, scroll, ...props }, ref) {
  return <a ref={ref} href={typeof href === "string" ? href : href.pathname} {...props} />;
});
