import PressureBikePage, { generateMetadata as metadata } from "../../tire-pressure/[slug]/page";

const params = Promise.resolve({ slug: "racefiets" });
export const generateMetadata = () => metadata({ params });
export default function Page() { return PressureBikePage({ params }); }
