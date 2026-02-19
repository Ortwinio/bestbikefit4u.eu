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
      allRightsReserved: "All rights reserved.",
    },
  },
  home: {
    metadata: {
      title: `${BRAND.name} - Personalized Bike Fitting Recommendations`,
      description:
        "Get personalized bike fitting recommendations based on your body measurements, riding style, and goals. Free online bike fit calculator using proven biomechanical formulas.",
      openGraphTitle: `${BRAND.name} - Personalized Bike Fitting Recommendations`,
      openGraphDescription:
        "Get personalized bike fitting recommendations based on your body measurements. Free online bike fit calculator.",
      keywords: [
        "bike fit",
        "bike fitting",
        "saddle height calculator",
        "bike size calculator",
        "cycling position",
        "bike fit calculator",
        "online bike fitting",
      ],
    },
    hero: {
      title: "Perfect Your Bike Fit",
      titleAccent: "With Precision",
      description:
        "Get personalized bike fitting recommendations based on your body measurements, riding style, and goals. Our algorithm uses proven biomechanical formulas to calculate your optimal position.",
      primaryCta: "Start Your Free Fit",
      secondaryCta: "How It Works",
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Three simple steps to your perfect bike fit",
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
    features: {
      title: `Why Choose ${BRAND.name}?`,
      subtitle: "Professional-grade fitting recommendations, accessible to everyone",
      items: [
        {
          title: "Precision Measurements",
          description:
            "Input your body measurements and get calculations based on proven LeMond/Hamley methods.",
        },
        {
          title: "Goal-Based Fitting",
          description:
            "Whether you prioritize comfort, performance, or aerodynamics, we optimize your position.",
        },
        {
          title: "Detailed Reports",
          description:
            "Receive comprehensive recommendations including saddle height, reach, stem length, and more.",
        },
        {
          title: "All Bike Types",
          description:
            "Road, gravel, mountain, or city bikes - our algorithm adapts to your discipline.",
        },
        {
          title: "Pain Point Solutions",
          description:
            "Report discomfort areas and get specific adjustments to address your issues.",
        },
        {
          title: "Science-Based",
          description:
            "Built on decades of bike fitting research and biomechanical principles.",
        },
      ],
    },
    recommendationSection: {
      title: "Comprehensive Fit Recommendations",
      description:
        "Our algorithm calculates all the key measurements you need to optimize your position on the bike.",
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
      cardTitle: "Ready to optimize your fit?",
      cardDescription:
        "Join cyclists who have improved their comfort and performance with data-driven bike fitting.",
      cardCta: "Get Started Free",
    },
    cta: {
      title: "Ready to Improve Your Ride?",
      description:
        "Start with a free fit session and experience the difference proper positioning makes.",
      button: "Get Started Free",
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
