import type { Metadata } from "next";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";
import { ProfileImproveGuideClient } from "@/components/profile/ProfileImproveGuideClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);

  return {
    title: messages.profile.improve.flexibility.title,
  };
}

export default function ImproveFlexibilityPage() {
  return (
    <ProfileImproveGuideClient
      variant="flexibility"
      exercises={[
        {
          name: "Seated hamstring stretch",
          detail: "Directly improves the hamstring range that limits bar drop and pelvic rotation on the bike.",
          cadence: "3 sets of 30 seconds, daily",
          steps: [
            "Sit tall with both legs straight in front of you.",
            "Reach forward from the hips instead of rounding the spine first.",
            "Hold the stretch where you feel tension, not pain.",
          ],
        },
        {
          name: "Standing forward fold",
          detail: "Builds tolerance for hinging from the hips while keeping the back relaxed.",
          cadence: "30-60 seconds, daily",
          steps: [
            "Stand with feet hip-width apart and soften the knees slightly.",
            "Fold forward from the hips and let the arms hang heavy.",
            "Breathe slowly and let the hamstrings relax deeper with each exhale.",
          ],
        },
        {
          name: "Supine hamstring stretch with strap",
          detail: "Lets you isolate each leg without loading the lower back.",
          cadence: "3 sets per side, 3x/week",
          steps: [
            "Lie on your back and loop a strap around one foot.",
            "Straighten the leg toward the ceiling while keeping the other leg relaxed.",
            "Gently pull until you feel a stretch behind the thigh.",
          ],
        },
        {
          name: "Pigeon pose",
          detail: "Opens the hips so you can rotate the pelvis more freely in an aggressive riding position.",
          cadence: "60 seconds per side, 3x/week",
          steps: [
            "Bring one shin across the front of your mat and extend the other leg back.",
            "Square your hips as much as possible.",
            "Stay tall or fold forward depending on comfort.",
          ],
        },
        {
          name: "Hip hinge drill",
          detail: "Teaches the movement pattern you need to lower the torso without collapsing through the spine.",
          cadence: "3 sets of 10 reps, 2x/week",
          steps: [
            "Stand tall with hands on the hip creases.",
            "Push the hips back while keeping the spine neutral.",
            "Return to standing once you feel the hamstrings load.",
          ],
        },
      ]}
      progressTips={[
        "Stretch most days for 6-8 weeks before judging whether the score has changed.",
        "Retest every 4 weeks using the same seated reach test from your profile.",
        "Move your score up only when the next level feels clearly sustainable, not on a single good day.",
      ]}
    />
  );
}
