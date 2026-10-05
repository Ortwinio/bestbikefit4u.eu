import { createRoot } from "react-dom/client";
import WelcomeClient from "@/app/welcome/WelcomeClient";
import { writeHandoffEntry } from "@/lib/handoff/store";
import { signupState } from "./full-signup-runtime";

window.__signupFixture = signupState;
localStorage.setItem("bf_cookie_consent", "essential");
for (const [field, value, method] of [["heightCm", 190, "declared"], ["inseamCm", 89, "measured"]]) {
  writeHandoffEntry({ field, value, method, unit: "cm", calculator: "saddle-height", touchedAt: Date.now() });
}
createRoot(document.getElementById("root")).render(<WelcomeClient />);
