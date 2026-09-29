import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
const route = vi.hoisted(() => ({path:"/nl/calculators/saddle-height"}));
vi.mock("next/navigation",()=>({usePathname:()=>route.path,useSearchParams:()=>new URLSearchParams()}));
vi.mock("@/components/providers/ThemeProvider",()=>({useTheme:()=>({resolvedTheme:"light"})}));
import { ConfiguratorHeaderSwitch } from "./ConfiguratorHeaderSwitch";
function markup(){return renderToStaticMarkup(<ConfiguratorHeaderSwitch locale="nl" loginLabel="Inloggen" languageLabels={{language:"Taal",english:"Engels",dutch:"Nederlands"}}><header>Marketing</header></ConfiguratorHeaderSwitch>);}
describe("pilot tool header",()=>{
 it.each(["saddle-height","frame-size","crank-length"])("uses real navigation and a soft border for %s",tool=>{
  route.path=`/nl/calculators/${tool}`;const html=markup();
  expect(html).toContain('border-b border-border');expect(html.match(/<a [^>]*aria-current="page"[^>]*>/)?.[0]).toContain(`href="/nl/calculators/${tool}"`);
  expect(html).toContain('href="/nl/login"');expect(html).not.toContain("Marketing");
 });
 it("leaves later batches and marketing pages unchanged",()=>{
  for(const path of ["/nl/calculators/bike-fit","/nl/pricing"]){route.path=path;expect(markup()).toBe('<header>Marketing</header>');}
 });
});
