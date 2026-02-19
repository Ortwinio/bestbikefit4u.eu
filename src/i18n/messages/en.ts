import { BRAND } from "@/config/brand";

const en = {
  common: {
    language: "Language",
    english: "English",
    dutch: "Dutch",
  },
  nav: {
    brand: BRAND.name,
    howItWorks: "How It Works",
    pricing: "Pricing",
    login: "Log in",
    getStarted: "Get Started",
    footer: {
      product: "Product",
      support: "Support",
      legal: "Legal",
      resources: "Resources",
      contact: "Contact",
      faq: "FAQ",
      measurementGuide: "Measurement Guide",
      privacy: "Privacy",
      terms: "Terms",
      science: "Science",
      calculators: "Calculators",
      guides: "Guides",
      allRightsReserved: "All rights reserved.",
    },
  },
  home: {
    metadata: {
      title: `${BRAND.name} - Online Bike Fitting for Comfort and Performance`,
      description:
        "Reduce cycling pain, improve efficiency, and ride longer with personalized bike fitting recommendations based on your measurements, goals, and riding style.",
      openGraphTitle: `${BRAND.name} - Online Bike Fitting for Comfort and Performance`,
      openGraphDescription:
        "Reduce pain and improve performance with a personalized bike fit plan.",
      keywords: [
        "bike fit",
        "bike fitting",
        "bike fitting for knee pain",
        "bike fitting for comfort",
        "saddle height calculator",
        "bike size calculator",
        "cycling position",
        "bike fit calculator",
        "online bike fitting",
      ],
    },
    hero: {
      title: "Ride Longer.",
      titleAccent: "Hurt Less. Perform Better.",
      description:
        "Start your free bike fit and get practical setup targets to reduce pain, improve power transfer, and ride with more confidence.",
      primaryCta: "Start Your Free Fit",
      secondaryCta: "See How It Works",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Get an actionable fit plan in three simple steps",
      steps: [
        {
          title: "Enter Your Measurements",
          description:
            "Provide your body measurements including height, inseam, arm length, and complete a flexibility assessment.",
        },
        {
          title: "Answer Questions",
          description:
            "Tell us about your riding style, goals, weekly hours, and any pain points you're experiencing on the bike.",
        },
        {
          title: "Get Your Fit Report",
          description:
            "Receive detailed recommendations for saddle height, reach, handlebar position, crank length, and more.",
        },
      ],
    },
    reasonsToStart: {
      title: "Why start bike fitting now?",
      subtitle:
        "Most riders wait until discomfort gets worse. Small changes now can prevent months of frustration.",
      items: [
        {
          title: "Reduce recurring pain",
          description:
            "Address knee, lower-back, neck, hand numbness, and saddle-pressure complaints with focused position changes.",
        },
        {
          title: "Transfer more power with less effort",
          description:
            "Align saddle height, reach, and cockpit setup so your pedaling is more efficient and stable.",
        },
        {
          title: "Ride longer in comfort",
          description:
            "Improve weight distribution and posture so endurance rides feel smoother and less fatiguing.",
        },
        {
          title: "Lower overuse injury risk",
          description:
            "Avoid riding for months in a position your mobility and core support cannot sustain.",
        },
        {
          title: "Gain control and confidence",
          description:
            "A balanced riding position improves control on climbs, descents, and technical terrain.",
        },
      ],
    },
    features: {
      title: "What you get in your fit plan",
      subtitle:
        "Clear recommendations you can apply yourself or together with your local bike shop",
      items: [
        {
          title: "Precision Measurements",
          description:
            "Input your body measurements and get calculations based on proven LeMond/Hamley methods.",
        },
        {
          title: "Goal-Based Setup",
          description:
            "Your fit adapts to comfort, endurance, performance, or aero priorities.",
        },
        {
          title: "Detailed Reports",
          description:
            "Get clear setup targets for saddle height, reach, stem length, and more.",
        },
        {
          title: "All Bike Types",
          description:
            "Road, gravel, mountain, or city bikes - our algorithm adapts to your discipline.",
        },
        {
          title: "Pain-Aware Adjustments",
          description:
            "Share your discomfort areas and receive targeted position changes to test first.",
        },
        {
          title: "Science-Based",
          description:
            "Built on decades of bike fitting research and biomechanical principles.",
        },
      ],
    },
    trustSection: {
      title: "Built for trust, not guesswork",
      subtitle:
        "Every recommendation is grounded in clear logic and practical constraints",
      items: [
        {
          title: "Method-backed calculations",
          description:
            "Recommendations are based on established bike fitting formulas plus rider-specific corrections.",
        },
        {
          title: "Practical rider outcomes",
          description:
            "You receive an ordered action plan, so you know what to adjust first and why.",
        },
        {
          title: "Transparent limitations",
          description:
            "Complex pain or injury cases may require an in-person fitter or medical assessment.",
        },
      ],
    },
    recommendationSection: {
      title: "Your report includes the numbers that matter",
      description:
        "Use concrete fit targets to improve comfort, consistency, and performance on every ride.",
      items: [
        "Saddle height with adjustment range",
        "Saddle setback (fore/aft position)",
        "Handlebar drop and reach",
        "Stem length and angle",
        "Crank length optimization",
        "Handlebar width",
        "Frame stack and reach targets",
        "Recommended frame size",
      ],
      cardTitle: "Ready to fix discomfort and ride stronger?",
      cardDescription:
        "Start free and get personalized setup targets in minutes.",
      cardCta: "Start Free Fit",
    },
    cta: {
      title: "Start your free bike fit today",
      description:
        "No guesswork. No generic tips. Get fit targets matched to your body and riding goals.",
      button: "Start Free Fit",
    },
  },
  auth: {
    signInTitle: `Sign in to ${BRAND.name}`,
    sendCode: "Send Login Code",
  },
  dashboard: {
    title: "Dashboard",
    signOut: "Sign out",
  },
  errors: {
    notFoundTitle: "Page not found",
    backHome: "Go Home",
  },
};

export default en;
