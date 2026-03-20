import type { Metadata } from "next";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";
import { ProfileImproveGuideClient } from "@/components/profile/ProfileImproveGuideClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);

  return {
    title: messages.profile.improve.coreStability.title,
  };
}

export default function ImproveCoreStabilityPage() {
  return (
    <ProfileImproveGuideClient
      variant="coreStability"
      exercises={[
        {
          name: "Front plank",
          detail: "Your benchmark exercise for staying stable under load in an aggressive riding posture.",
          cadence: "3 sets, 3x/week",
          steps: [
            "Set up on forearms and toes with a straight line from head to heels.",
            "Brace the abs and squeeze the glutes.",
            "Stop the set when the hips sag or lift too high.",
          ],
        },
        {
          name: "Dead bug",
          detail: "Builds anti-extension control so your lower back stays quiet on longer rides.",
          cadence: "3 sets of 10 reps per side, 3x/week",
          steps: [
            "Lie on your back with knees bent to 90 degrees and arms straight up.",
            "Lower the opposite arm and leg slowly without arching the lower back.",
            "Return to center and switch sides.",
          ],
        },
        {
          name: "Bird dog",
          detail: "Improves cross-body stability, which helps when you pedal hard and move around on rough roads.",
          cadence: "3 sets of 10 reps per side, 3x/week",
          steps: [
            "Start on hands and knees with a neutral spine.",
            "Reach one arm forward and the opposite leg back.",
            "Pause for 2-3 seconds before returning under control.",
          ],
        },
        {
          name: "Side plank",
          detail: "Targets the lateral core so you can resist rocking through the torso when producing power.",
          cadence: "30 seconds per side, 2x/week",
          steps: [
            "Stack shoulders and hips in one line.",
            "Push the floor away through the forearm.",
            "Hold steady breathing without letting the hips drop.",
          ],
        },
        {
          name: "Glute bridge",
          detail: "Strengthens the posterior chain that supports your pelvis and lower back on the bike.",
          cadence: "3 sets of 15 reps, 3x/week",
          steps: [
            "Lie on your back with feet flat and knees bent.",
            "Drive through the heels and lift the hips until the body forms a straight line.",
            "Pause briefly at the top before lowering slowly.",
          ],
        },
      ]}
      progressTips={[
        "Train core strength 3 times per week on non-consecutive days for steady progress.",
        "Retest your front plank every 4 weeks using strict form, not max time with compensation.",
        "When your hold time consistently reaches the next tier, update your score in the profile.",
      ]}
    />
  );
}
