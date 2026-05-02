import { BRAND } from "@/config/brand";

const en = {
  common: {
    language: "Language",
    english: "English",
    dutch: "Dutch",
    skipToContent: "Skip to main content",
  },
  nav: {
    brand: BRAND.name,
    howItWorks: "How It Works",
    pricing: "Pricing",
    tools: "Tools",
    tirePressure: "Tire Pressure",
    login: "Log in",
    getStarted: "Start free",
    footer: {
      product: "Product",
      support: "Support",
      legal: "Legal",
      resources: "Resources",
      calculators: "Calculators",
      sitemap: "Sitemap",
      contact: "Contact",
      faq: "FAQ",
      measurementGuide: "Measurement Guide",
      privacy: "Privacy",
      terms: "Terms",
      science: "Science",
      guides: "Guides",
      bikeFit: "Bike Fit Calculator",
      saddleHeight: "Saddle Height Calculator",
      saddleWidth: "Saddle Width Calculator",
      frameSize: "Frame Size Calculator",
      crankLength: "Crank Length Calculator",
      gearing: "Gearing Calculator",
      tirePressure: "Tire Pressure Calculator",
      allRightsReserved: "All rights reserved.",
    },
  },
  home: {
    metadata: {
      title: `${BRAND.name} - Online Bike Fitting for Comfort and Performance`,
      description:
        "Get practical bike fit guidance matched to your body and riding style. Improve comfort, refine your position, and ride with more confidence.",
      openGraphTitle: `${BRAND.name} - Online Bike Fitting for Comfort and Performance`,
      openGraphDescription:
        "Get practical bike fit guidance for comfort, performance, and better bike decisions.",
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
      title: "Online Bike Fitting",
      titleAccent: "for Comfort and Performance.",
      description:
        "Try the free bike fit calculator first, then decide whether you want deeper setup guidance for your body, riding style, and next bike decision.",
      primaryCta: "Try the Free Bike Fit Calculator",
      secondaryCta: "Compare Free vs Pro",
      signInCta: "Already have an account? Sign in",
    },
    homepageRedesign: {
      howItWorks: {
        title: "How it works",
        subtitle: "Three clear steps from measurements to a fit plan you can use.",
        ctaLabel: "Start free bike fit",
        steps: [
          {
            title: "Measure your baseline",
            description:
              "Enter the core measurements the fit engine needs so the guidance matches your body.",
          },
          {
            title: "Connect your bike",
            description:
              "Find a bike in the database or enter the geometry manually when you already know it.",
          },
          {
            title: "Get your fit plan",
            description:
              "Review practical saddle, reach, and cockpit targets, then adjust what matters first.",
          },
        ],
      },
      differentiators: {
        title: "Why riders keep using it",
        subtitle: "The homepage funnel stays grounded in clear data, order, and rider context.",
        items: [
          {
            title: "Geometry database",
            description:
              "180+ bike brands with verified geometry and pressure context in one place.",
          },
          {
            title: "Structured adjustment order",
            description:
              "Know what to adjust first. No guesswork, just a proven sequence.",
          },
          {
            title: "Riding-style aware",
            description:
              "Fits comfort, endurance, or aero priorities instead of one generic setup.",
          },
        ],
      },
      testimonials: {
        title: "What riders say",
        subtitle: "Named rider outcomes after practical fit adjustments.",
        readMoreLabel: "Read more rider stories",
        items: [
          {
            name: "Thomas V.",
            initials: "TV",
            bikeContext: "Canyon Endurace 2022 · Comfort rider",
            result: "Saddle 4 mm lower, knee pain gone after two rides.",
          },
          {
            name: "Laura M.",
            initials: "LM",
            bikeContext: "Trek Domane 2023 · Recreational rider",
            result: "Bars 10 mm higher, no more back pain on long rides.",
          },
          {
            name: "Pieter J.",
            initials: "PJ",
            bikeContext: "Specialized Tarmac 2021 · Sportive rider",
            result: "Saddle 3 mm back, better pedaling efficiency.",
          },
        ],
      },
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "See the fit flow in three clear steps",
      steps: [
        {
          title: "Enter Your Measurements",
          description:
            "Provide your body measurements including height, inseam, arm length, and a short flexibility assessment.",
        },
        {
          title: "Answer Questions",
          description:
            "Tell us about your riding style, goals, weekly hours, and the discomfort points that matter most on the bike.",
        },
        {
          title: "Review Your Recommendations",
          description:
            "Review practical recommendations for saddle height, reach, handlebar position, crank length, and what to check first.",
        },
      ],
    },
    reasonsToStart: {
      title: "Why start bike fitting now?",
      subtitle:
        "Most riders wait until the setup problem becomes bigger. Small changes now can create much clearer next steps.",
      items: [
        {
          title: "Improve comfort sooner",
          description:
            "Review the setup factors that often make long rides feel rougher than they should.",
        },
        {
          title: "Refine your riding position",
          description:
            "Use clearer setup targets for saddle height, reach, and cockpit balance.",
        },
        {
          title: "Ride longer with more confidence",
          description:
            "A better-matched position can feel steadier and easier to sustain over time.",
        },
        {
          title: "Make better bike decisions",
          description:
            "Use fit context when deciding whether a new bike or setup change actually suits you.",
        },
        {
          title: "Gain control and clarity",
          description:
            "A more balanced position helps riders understand what to adjust first and why.",
        },
      ],
    },
    features: {
      title: "What you get in your fit plan",
      subtitle:
        "Clear recommendations you can apply yourself or together with your local bike shop",
      items: [
        {
          title: "Practical Fit Inputs",
          description:
            "Start with the measurements and riding context that matter most for real setup decisions.",
        },
        {
          title: "Goal-Based Setup",
          description:
            "Your fit adapts to comfort, endurance, performance, or aero priorities.",
        },
        {
          title: "Clear Setup Targets",
          description:
            "Review fit outputs for saddle position, cockpit balance, and next-step priorities.",
        },
        {
          title: "Bike-Specific Context",
          description:
            "Keep fit work connected to the bike and riding context you actually use.",
        },
        {
          title: "Focused Adjustment Order",
          description:
            "See what to review first instead of changing multiple setup variables at once.",
        },
        {
          title: "Built for Real Riding",
          description:
            "Use a process designed to help riders test fit changes in a practical order.",
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
    bikeQuickCheck: {
      badge: "Bike passport quick check",
      collapsedTitle: "Check whether this bike could suit your size",
      collapsedDescription:
        "Use a bike-passport ID or shared bike code to screen a second-hand bike before you spend more time on it.",
      expandLabel: "Check a shared bike",
      codeLabel: "Bike-passport ID or shared code",
      codePlaceholder: "Enter the bike-passport ID or shared code",
      codeHelper:
        "This is a limited screening tool. We use the shared bike identifier, your height, and the bike geometry that is available.",
      lookupButton: "Preview this bike",
      lookupLoading: "Checking the shared bike…",
      invalidTitle: "This code is not available right now",
      invalidDescription:
        "The bike-passport ID or shared code may be wrong, expired, or no longer shared. Please check it and try again.",
      invalidRetry: "Start again",
      rateLimitedTitle: "Too many attempts for now",
      rateLimitedDescription:
        "Please wait before trying another bike-passport ID or shared code.",
      rateLimitedRetry: "Try again",
      previewTitle: "Bike preview",
      previewDescription:
        "We found the shared bike. Enter your height for a first estimate.",
      previewHeightPrompt: "Enter your height for a first estimate",
      previewSupport: "Estimate based on height and available geometry.",
      previewButton: "Run quick check",
      previewLoading: "Calculating a limited estimate…",
      heightLabel: "Your height (cm)",
      heightPlaceholder: "e.g. 178",
      bikeSummaryLabel: "Shared bike",
      sizeLabel: "Frame size",
      geometryLabel: "Geometry quality",
      geometryLimited: "Limited geometry data",
      noPhoto: "No shared bike photo available",
      resultTitle: "Quick check result",
      resultSupport: "Estimate based on height and available geometry.",
      scoreLabel: "Quick check score",
      scoreSuffix: "/75",
      confidenceLabel: "Confidence",
      inseamEstimateLabel: "Estimated inseam",
      limitedEstimate:
        "Use this as a first screening step, not as a final fit decision.",
      geometryWeakNote:
        "Weak geometry data keeps this estimate limited.",
      ctaTitle: "Want a better estimate?",
      ctaDescription:
        "Add your inseam and rider profile for a better estimate.",
      ctaButton: "Create a free account",
      ctaSecondary:
        "A full rider profile improves precision beyond this first screen.",
      signedInCtaTitle: "Want a better estimate?",
      signedInCtaDescription:
        "Use this quick check as a first screen. Add your rider profile or start a bike-fit flow for a better estimate.",
      signedInPrimaryCta: "Add rider profile",
      signedInSecondaryCta: "Open bike fit",
      confidenceLevels: {
        high: "High",
        medium: "Medium",
        limited: "Limited",
      },
      scoreBands: {
        could_fit: "Could suit your size",
        borderline: "Worth a closer look",
        weak: "Looks uncertain on paper",
        unlikely: "Probably not the right size",
      },
      geometryQualityLabels: {
        full: "Full geometry available",
        partial: "Partial geometry available",
        none: "Limited geometry data",
      },
      explanationCodes: {
        frame_size_close: "The frame size looks close to your height on paper.",
        frame_size_borderline:
          "The frame size sits near the edge of the expected range for your height.",
        cockpit_close:
          "The available stack and reach look workable for a first screen.",
        limited_geometry:
          "This bike has limited shared geometry, so the estimate stays cautious.",
        limited_geometry_data:
          "This bike has limited shared geometry, so the estimate stays cautious.",
        geometry_looks_compatible:
          "The available geometry looks reasonably compatible on paper for a first screen.",
        mixed_geometry_signals:
          "Some geometry signals look workable, but this still needs a closer check.",
        weak_geometry_match:
          "The available geometry gives a weak match on paper.",
        unlikely_geometry_match:
          "The available geometry looks unlikely to suit your size on paper.",
        cockpit_check_needed:
          "Frame size looks workable, but the cockpit dimensions need a closer check.",
      },
    },
    cta: {
      title: "Start with the free bike fit calculator today",
      description:
        "Use the free calculator first, then upgrade only if you want a deeper report and more precise next steps.",
      button: "Open the Free Bike Fit Calculator",
    },
    bikeSearch: {
      title: "Search your bike",
      placeholder: "Search brand or model...",
      submitLabel: "Search bike",
      manualLabel: "Enter geometry manually",
      manualHintLabel: "Can't find your bike? Enter the geometry manually instead.",
    },
    calculatorGrid: {
      title: "Popular calculators",
      subtitle: "Free tools you can use right now, no account needed.",
      upsellLabel: "Want a complete fit plan?",
    },
    bikeShowcase: {
      eyebrow: "Real bikes. Real data.",
      title: "Bikes on the platform — from geometry to tyre pressure",
      subtitle:
        "Every bike shown comes with full geometry measurements and optimised tyre pressures. Create an account to run your own.",
      prevLabel: "Previous bike",
      nextLabel: "Next bike",
      regionLabel: "Bike showcase",
      cardAriaLabel: "View {brand} {model} details",
      geometryVerified: "Geometry verified",
      stackLabel: "Stack",
      reachLabel: "Reach",
      ettLabel: "ETT",
      staLabel: "STA",
      htaLabel: "HTA",
      wheelbaseLabel: "Wheelbase",
      tyreLabel: "Tyre",
      frontLabel: "Front",
      rearLabel: "Rear",
      pressureUnit: "bar",
      psiUnit: "psi",
      pressureDisclaimer: "Based on typical 70–80 kg total rider and bike weight",
      pressureAvailable: "Pressure optimisation available for this bike",
      geometrySection: "Geometry",
      tyreSection: "Tyre Pressure",
      aboutSection: "About this bike",
      geometrySource: "Source: manufacturer specifications",
      ctaButton: "Get my fit for this bike",
      viewDetails: "View details",
      useInFitLabel: "Use in my fit",
      partialGeometry: "Partial geometry",
      mmUnit: "mm",
      degUnit: "°",
    },
  },
  auth: {
    signInTitle: `Sign in to ${BRAND.name}`,
    sendCode: "Send Login Code",
  },
  pressure: {
    publicPage: {
      title: "Tire Pressure Calculator | BestBikeFit4U",
      description:
        "Calculate the ideal tire pressure for road, gravel or MTB. Free, no account needed.",
      h1: "Free Tire Pressure Calculator",
      subtitle:
        "Calculate your ideal tyre pressure for road, gravel or MTB. Enter your weight and tyre size for an instant recommendation.",
      chips: [
        "Based on weight and tyre width",
        "Works for road, gravel and MTB",
        "Instant result",
      ] as [string, string, string],
    },
    roadPage: {
      title: "Road Bike Tire Pressure Calculator | BestBikeFit4U",
      description:
        "Calculate ideal road bike tyre pressure based on weight, tyre width and surface.",
      h1: "Road Bike Tire Pressure",
    },
    gravelPage: {
      title: "Gravel Bike Tire Pressure Calculator | BestBikeFit4U",
      description:
        "Find the optimal gravel bike tyre pressure for mixed surfaces.",
      h1: "Gravel Bike Tire Pressure",
    },
    mtbPage: {
      title: "MTB Tire Pressure Calculator | BestBikeFit4U",
      description:
        "Calculate mountain bike tyre pressure for trail, enduro or XC.",
      h1: "MTB Tire Pressure",
    },
    form: {
      disciplineLabel: "Bike type",
      disciplineRoad: "Road bike",
      disciplineGravel: "Gravel bike",
      disciplineMtb: "MTB",
      bodyWeightLabel: "Body weight (kg)",
      widthFrontLabel: "Front tyre width (mm)",
      widthRearLabel: "Rear tyre width (mm)",
      tubeTypeLabel: "Tube type",
      tubeTypeInnerTube: "Inner tube",
      tubeTypeLatex: "Latex tube",
      tubeTypeTubeless: "Tubeless",
      surfaceLabel: "Surface",
      surfaceSmoothAsphalt: "Smooth asphalt",
      surfaceAverageAsphalt: "Average asphalt",
      surfaceRoughAsphalt: "Rough asphalt",
      surfaceHardpackGravel: "Hardpack gravel",
      surfaceLooseGravel: "Loose gravel",
      surfaceTrail: "Trail",
      ridingGoalLabel: "Riding goal",
      ridingGoalSpeed: "Speed",
      ridingGoalBalance: "Balance",
      ridingGoalComfort: "Comfort",
      bikeWeightLabel: "Bike weight (optional)",
      advancedOptions: "Advanced options",
      resultPlaceholder: "Enter valid values to see your recommended tyre pressure.",
    },
    result: {
      front: "Front",
      rear: "Rear",
      bar: "bar",
      psi: "PSI",
      explanation: "Explanation",
      warningsTitle: "Warnings",
      disclaimer: "Always follow the manufacturer's maximum pressure limits.",
      warningMessages: {
        max_rim_pressure_exceeded:
          "Recommended pressure exceeds the tyre or rim maximum.",
        hookless_limit_exceeded:
          "Hookless rim: maximum pressure limit exceeded. Check specifications.",
        pressure_too_low_for_setup:
          "Pressure may be too low for this setup. Verify casing support and terrain.",
        front_rear_pressure_mismatch:
          "Large difference between front and rear pressure. Check your inputs.",
        inner_tube_pinch_flat_risk:
          "Low pressure with inner tube: risk of pinch flat.",
        road_tire_width_unusual:
          "Unusual tyre width for a road bike. Please verify.",
        gravel_tire_width_unusual:
          "Unusual tyre width for a gravel bike.",
        mtb_tire_width_unusual:
          "MTB tyres are typically at least 45 mm wide.",
        hookless_max_pressure_unknown:
          "Hookless rim: maximum pressure unknown. Stay at or below 3.5 bar unless otherwise stated.",
      },
      comfortScore: "Comfort",
      gripScore: "Grip",
      efficiencyScore: "Efficiency",
    },
    cta: {
      heading: "What's next?",
      body:
        "Create a free account to save these results, refine your setup with more detail, and track changes over time.",
      primaryButton: "Create account or sign in",
      secondaryButton: "Compare Free vs Pro",
      loginPrompt: "Already have an account?",
      loginLink: "Log in",
    },
  },
  dashboard: {
    title: "Dashboard",
    signOut: "Sign out",
    common: {
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      signOut: "Sign out",
      toasts: {
        profileSaved: "Your profile measurements have been saved.",
        displayNameSaved: "Your display name has been updated.",
        fitSessionStarted: "New fit session started.",
        reportEmailed: "Your fit report has been sent by email.",
        cookiesAccepted: "Analytics cookies have been enabled.",
        cookiesEssentialOnly: "Only essential cookies will remain active.",
        bikeDeleted: "Bike deleted.",
        bikeNotesSaved: "Bike notes saved.",
        bikeDescriptionSaved: "Bike description saved.",
        bikeDescriptionGenerated: "Bike description draft is ready.",
        bikePhotoAdded: "Bike photo added.",
        bikePhotoRemoved: "Bike photo removed.",
        bikePhotoPrimaryUpdated: "Primary bike photo updated.",
        bikeWheelsetSaved: "Wheelset saved.",
        bikeWheelsetRemoved: "Wheelset removed.",
        bikeWheelsetActivated: "Wheelset set as active.",
        pressureNoteSaved: "Pressure note saved.",
      },
    },
    nav: {
      dashboard: "Dashboard",
      feedback: "Feedback",
      newFitSession: "New Fit Session",
      newBike: "New Bike",
      bikeFitting: "Bike Fitting",
      myBikes: "My Bike Garage",
      profile: "My Profile",
      tirePressure: "Tire Pressure",
      gearing: "Gearing",
      saddleSelector: "Saddle Selector",
      settings: "Settings",
    },
    saddleSelector: {
      title: "Saddle Selector",
      subtitle: "Find your saddle width and shape based on your anatomy and riding profile.",
      anatomy: "Anatomy",
      ridingProfile: "Riding profile",
      currentSaddle: "Current saddle",
      symptoms: "Symptoms",
      calculate: "Calculate saddle recommendation",
      save: "Save recommendation",
      saved: "Recommendation saved.",
      measuredMode: "I have a sit-bone measurement",
      estimatedMode: "Estimate from body data",
      sitBoneWidth: "Sit-bone width",
      height: "Height",
      weight: "Weight",
      hipCircumference: "Hip circumference",
      flexibility: "Flexibility",
      coreStability: "Core stability",
      fromProfile: "From your profile",
      bike: "Bike",
      selectBike: "Select bike",
      ridingType: "Riding type",
      positionStyle: "Position style",
      indoorOutdoor: "Indoor / outdoor",
      typicalRideLength: "Typical ride length",
      currentWidth: "Current saddle width",
      currentFeel: "How does it feel?",
      currentShape: "Current saddle shape",
      currentTilt: "Current saddle tilt",
      showOptional: "Show optional section",
      hideOptional: "Hide optional section",
      targetWidth: "Saddle width",
      widthRange: "Range",
      confidence: "Confidence",
      saddleFamily: "Recommended saddle type",
      fitInteractionNotes: "Fit interaction notes",
      previousRecommendations: "Previous saddle recommendations",
      currentComparison: "Current saddle vs recommendation",
      noseType: "Nose type",
      profileShape: "Profile shape",
      cutout: "Cutout recommended",
      padding: "Padding",
      yes: "Yes",
      no: "No",
    },
    layout: {
      loading: "Loading dashboard...",
      mobileMenu: {
        closeAria: "Close dashboard menu",
        openAria: "Open dashboard menu",
        overlayCloseAria: "Close dashboard menu overlay",
      },
      sections: {
        dashboard: "Dashboard",
        website: "Website",
        admin: "Admin",
      },
      website: {
        home: "Home",
        howItWorks: "How It Works",
        pricing: "Pricing",
      },
    },
    userMenu: {
      dashboard: "Dashboard",
      newFitSession: "New Fit Session",
      myBikes: "My Bike Garage",
      profileSettings: "Profile Settings",
      fallbackUserName: "User",
    },
    sessions: {
      status: {
        completed: "Completed",
        inProgress: "In Progress",
        processing: "Processing",
        archived: "Archived",
      },
      ridingStyle: {
        recreational: "Recreational",
        fitness: "Fitness",
        sportive: "Sportive",
        racing: "Racing",
        commuting: "Commuting",
        touring: "Touring",
      },
    },
    home: {
      title: "Dashboard",
      newFitCta: "New Fit Session",
      profileWarning: {
        title: "Complete your profile to get started",
        description: "Enter your body measurements to enable bike fit calculations.",
        cta: "Complete Profile",
      },
      stats: {
        totalSessions: "Total Sessions",
        completedFits: "Completed Fits",
        lastFitDate: "Last Fit Date",
      },
      recentSessions: {
        title: "Recent Fit Sessions",
        loading: "Loading sessions...",
        emptyTitle: "No fit sessions yet",
        emptyDescription: "You haven't started any fit sessions yet.",
        emptyCta: "Start Your First Fit",
        fitSuffix: "Fit",
        actions: {
          viewResults: "View Results",
          continue: "Continue",
          view: "View",
        },
      },
    },
    dashboardHome: {
      subtitle: "Your rider profile, bike setup, and tyre-pressure guidance in one place.",
      riderCardTitle: "Rider profile",
      weightLabel: "Body weight",
      weightMissing: "Add to profile",
      editProfile: "Edit profile",
      newFit: "Start New Fit Session",
      currentBikeTitle: "Current bike",
      viewBike: "View bike",
      noBikeTitle: "No bike saved yet",
      noBikeDescription: "Add a bike to attach pressure and fit context to a real setup.",
      pressureStale: "Recalculate recommended",
      pressureWarnings: "{count} warnings in your fit & pressure layer",
      viewAllFits: "View all",
      welcomeBack: "Welcome back",
      startFit: "Start fit",
    },
    fitHistory: {
      title: "Bike Fitting History",
      subtitle: "Your fitting sessions grouped by bike, newest first.",
      emptyTitle: "No fitting sessions yet",
      emptyDescription:
        "Complete a fitting session to build up your bike history.",
      emptyCta: "Start your first fit session",
      bikeWithoutName: "Bike without name",
      noBikeLinked: "No bike linked",
      noRecommendationYet: "No recommendation generated yet",
      latestSession: "Latest session",
      confidence: "Confidence",
      saddleHeight: "Saddle height",
      handlebarDrop: "Handlebar drop",
      handlebarReach: "Handlebar reach",
      viewReport: "View report",
      startNewSession: "Start new fitting session",
      delete: {
        action: "Delete fitting",
        dialogTitle: "Delete bike fitting?",
        dialogDescription:
          "This permanently deletes the fitting session, its questionnaire answers, recommendations, and related validation data.",
        confirm: "Delete fitting",
        success: "Bike fitting deleted.",
        failed: "Could not delete the bike fitting. Please try again.",
      },
    },
    bikeGarage: {
      bikeUsageTitle: "Bike usage",
      fitAdviseTitle: "Bikefitting advice",
      latestAdvice: "Latest advice",
      recalculateFit: "Recalculate fit",
      climbingProfileIncluded: "Climbing profile included",
      tirePressureTitle: "Tyre pressure",
      currentMeasurement: "Current",
      recalculatePressure: "Recalculate pressure",
      noFitYet: "No fit session yet",
      noFitDescription: "Start a fit session to see your bike usage and recommendations here.",
      typeOfRiding: "Type of riding",
      reportedDiscomfort: "Reported discomfort",
    },
    bikeTypes: {
      road: {
        label: "Road Bike",
        description: "Drop bars, endurance or race geometry",
      },
      gravel: {
        label: "Gravel Bike",
        description: "Drop bars, relaxed geometry for mixed terrain",
      },
      mountain: {
        label: "Mountain Bike",
        description: "Flat bars, trail or XC geometry",
      },
      hybrid: {
        label: "Hybrid Bike",
        description: "Flat bars, road + comfort mixed use",
      },
      tt_triathlon: {
        label: "TT / Triathlon",
        description: "Aerodynamic setup for time trials and triathlon",
      },
      cyclocross: {
        label: "Cyclocross Bike",
        description: "Drop bars for CX courses and mixed conditions",
      },
      touring: {
        label: "Touring Bike",
        description: "Long-distance stability with loaded comfort",
      },
      city: {
        label: "City / Commute",
        description: "Upright position for daily comfort",
      },
    },
    bikeProfileTypes: {
      base: "Base",
      mountain: "Mountain",
      climbing: "Climbing",
      endurance: "Endurance",
      performance: "Performance",
      aero: "Aero",
      indoor: "Indoor",
      technical: "Technical",
      comfort: "Comfort",
      custom: "Custom",
    },
    fit: {
      algorithm: {
        title: "How Our Bike Fit Algorithm Works",
        subtitle:
          "A transparent look at how we translate your body data and riding goals into precise, personalised setup recommendations.",
        backLink: "Back to fit",
        inputsTitle: "What goes in",
        processTitle: "How we calculate",
        outputsTitle: "What you get",
        tipsTitle: "Getting the most from your fit",
      },
      loading: "Loading fit setup...",
      title: "Start New Fit Session",
      subtitle: "Choose your bike and riding goals to get personalized setup recommendations.",
      profileWarning: {
        title: "Complete your profile first",
        description: "You need to enter your body measurements before starting a fit session.",
        cta: "Go to Profile",
      },
      riderProfileWarning: {
        title: "Complete your riding profile",
        description: "Answer a few questions about your riding style before starting a fit session.",
        cta: "Go to My Profile",
      },
      savedBikes: {
        loading: "Loading your bikes...",
        title: "Select a bike",
        addNewBike: "Add new bike",
        noBikes: "No bikes added yet",
        noBikesHint: "Add your first bike to start a personalized fit session.",
        addFirstBike: "Add your first bike",
        usingBike: "Using saved bike",
        usingBikeAttribute: "Using the bike's saved value:",
        missingBikeAttribute: "This bike is missing a riding style or goal.",
        completeBikeSetup: "Complete bike setup",
        profilesLoading: "Loading bike profiles...",
        profilesTitle: "Choose a bike profile",
        profilesHint: "Profiles keep multiple fit contexts for the same bike.",
        noProfiles: "No saved bike profiles yet. We'll use the bike without a saved profile.",
        defaultBadge: "Default",
      },
      sections: {
        bikeType: "What type of bike?",
        ridingStyle: "How do you typically ride?",
        ridingStyleTooltip:
          "Choose the riding style that best matches how this bike is usually used so fit recommendations can balance comfort, handling, and position correctly.",
        primaryGoal: "What's your primary goal?",
        primaryGoalTooltip:
          "Pick the main outcome you want from this bike setup so saved bike profiles and fit sessions can bias toward that priority.",
      },
      continueCta: "Continue to Questions",
      profileRequirementHint: "Complete your profile to continue",
      errors: {
        startFailedTitle: "Couldn't start fit session",
      },
      ridingStyles: {
        recreational: {
          label: "Recreational",
          description: "Casual rides for fun and relaxation",
        },
        fitness: {
          label: "Fitness",
          description: "Regular exercise and health focus",
        },
        sportive: {
          label: "Sportive",
          description: "Long distance events and charity rides",
        },
        racing: {
          label: "Racing",
          description: "Competitive cycling and time trials",
        },
        commuting: {
          label: "Commuting",
          description: "Daily transportation to work",
        },
        touring: {
          label: "Touring",
          description: "Long-distance travel with luggage",
        },
      },
      goals: {
        comfort: {
          label: "Comfort",
          description: "Relaxed position, minimize strain",
        },
        balanced: {
          label: "Balanced",
          description: "Mix of comfort and efficiency",
        },
        performance: {
          label: "Performance",
          description: "More aggressive, power-focused",
        },
        aerodynamics: {
          label: "Aero",
          description: "Most aggressive, aerodynamic position (Road/TT only)",
        },
      },
    },
    questionnaire: {
      loading: "Loading questionnaire...",
      title: "Tell Us About Your Riding",
      subtitle: "Answer these questions to help us personalize your bike fit recommendations.",
      intro: {
        eyebrow: "Bike Fit",
        title: "Tell us about your riding style",
        description:
          "Our fitting model is built on data from thousands of riders and professionally validated methods. Answer a few questions — we'll translate your body metrics and riding style into precise, personalised setup recommendations.",
        progress: {
          timeRemaining: "~7 minutes remaining",
          percentComplete: "10% complete",
        },
        illustrationAlt: "Cyclist illustration",
        algorithmLink: "Learn more about our Bike Fitting Algorithm",
        start: "Start your bike fit",
      },
      sessionNotFound: {
        title: "Session not found",
        description: "The fit session you're looking for doesn't exist or has been archived.",
        cta: "Start New Session",
      },
      emptyTitle: "No questionnaire items available",
      emptyDescription: "Try again in a moment.",
      missingRequired: {
        header: "Required questions still need an answer:",
      },
      actions: {
        previous: "Previous",
        skip: "Skip",
        complete: "Complete",
        next: "Next",
      },
      errors: {
        completeStepTitle: "We couldn't complete this step",
        missingRequiredMarker: "Missing required responses:",
      },
      progress: {
        label: "Progress",
        minutesLeft: "~{minutes} min left",
        percentComplete: "{percent}% complete",
        questionOf: "Question {current} of {total}",
      },
      a11y: {
        singleChoiceLegend: "Choose one option",
      },
      painDiscomfort: {
        questionText: "Do you experience any discomfort or pain while cycling?",
        imageAlt: "Illustration of comfortable versus uncomfortable cycling positions",
        helpText:
          "Identifying pain points helps us recommend targeted adjustments to your position.",
        radioGroupLabel: "Discomfort or pain while cycling",
        selectPrompt: "Move the slider to answer.",
        options: {
          no: {
            label: "No",
            subtitle: "I'm comfortable",
            tooltip:
              "Your current position is working well. We'll focus on maintaining comfort while optimising efficiency and performance.",
          },
          yes: {
            label: "Yes",
            subtitle: "I have some discomfort",
            tooltip:
              "Discomfort while cycling often points to a fit issue — saddle height, reach, cleat position, or handlebar setup. Your responses will help us identify and address the cause.",
          },
        },
      },
      rideDistance: {
        questionText: "What is your typical ride distance?",
        helpText:
          "Think about the distance you ride most often — not your longest occasional ride.",
        radioGroupLabel: "Typical ride distance",
        selectPrompt: "Move the slider to select your typical ride distance.",
        options: {
          short: {
            label: "< 30 km",
            subtitle: "Casual / recreational",
            tooltip:
              "Short rides prioritise an upright, comfortable position. Saddle height and handlebar reach are optimised for ease and low-impact cycling.",
          },
          medium: {
            label: "30–80 km",
            subtitle: "Regular training",
            tooltip:
              "Medium distances require a balance between comfort and efficiency. Your position can tolerate moderate forward lean without causing fatigue.",
          },
          long: {
            label: "80–150 km",
            subtitle: "Endurance",
            tooltip:
              "Long distances demand a fit that sustains efficiency over hours. Core engagement and saddle contact become critical — your position must be powerful yet comfortable.",
          },
          ultra: {
            label: "150+ km",
            subtitle: "Ultra-endurance",
            tooltip:
              "At this distance, the smallest discomfort is amplified. Your fit prioritises joint protection, pressure distribution, and the ability to maintain power output over many hours.",
          },
        },
      },
      weeklyHours: {
        questionText: "How many hours per week do you typically ride?",
        helpText:
          "Tip: Estimate your average weekly riding time over the past 1–2 months.",
        imageAlt: "Clock representing weekly riding time",
        radioGroupLabel: "Weekly riding hours",
        selectPrompt: "Move the slider to select your weekly riding hours.",
        whyTitle: "Why this matters",
        whyText:
          "The number of hours you ride influences how long you can maintain your position, how much load your muscles and joints can handle, and how aggressive your bike setup can be. A position that is too aggressive for your current level may lead to discomfort or injury.",
        options: {
          "0-3": {
            label: "0–3 h",
            subtitle: "Occasional riding",
            tooltip:
              "Short or infrequent rides, mainly focused on comfort and enjoyment.",
          },
          "3-6": {
            label: "3–6 h",
            subtitle: "Regular riding",
            tooltip:
              "You ride multiple times per week and are building consistency.",
          },
          "6-10": {
            label: "6–10 h",
            subtitle: "Enthusiast level",
            tooltip:
              "You train regularly and are improving your fitness and efficiency.",
          },
          "10-15": {
            label: "10–15 h",
            subtitle: "High volume",
            tooltip:
              "You ride frequently, often with structure or specific goals.",
          },
          "15+": {
            label: "15+ h",
            subtitle: "Performance / racing",
            tooltip:
              "You have a high training load and your body is well adapted to sustained effort.",
          },
        },
      },
      experienceLevel: {
        questionText: "What best describes your cycling experience?",
        helpText:
          "This sets the physical baseline for your fit. Be honest — choosing a level that doesn't match your body will produce a position that is uncomfortable or inefficient.",
        radioGroupLabel: "Cycling experience level",
        selectPrompt: "Move the slider to select your experience level.",
        moreAbout: "More about {level}",
        imageAlt:
          "Cycling positions from beginner (upright) through intermediate to advanced (aerodynamic)",
        levels: {
          beginner: {
            label: "Beginner",
            subtitle: "Comfort first",
            explanation:
              "We assume lower baseline flexibility and core stability. Your fit will be more upright — less hip closure, less lower-back strain, and a saddle-to-bar height that is easier to sustain on longer rides.",
            tooltip:
              "Choosing a level above your current fitness leads to a position you cannot hold comfortably. Lower bars increase hip closure and require core strength to avoid back pain. If in doubt, start here.",
          },
          intermediate: {
            label: "Intermediate",
            subtitle: "Balanced",
            explanation:
              "Average flexibility and core strength. Your fit uses a neutral handlebar position — neither aggressive nor fully upright. Suited for regular multi-hour rides across varied terrain.",
            tooltip:
              "This level applies no modifier to bar drop. It is the baseline most riders fit into after 6–12 months of regular riding. Your body can sustain moderate hip closure without strain.",
          },
          advanced: {
            label: "Advanced",
            subtitle: "Performance",
            explanation:
              "Higher tolerance for hip closure, fuller knee extension, and the core strength to hold an aerodynamic posture for extended periods. Your fit will be more aggressive — lower bars, longer reach.",
            tooltip:
              "Be honest: if your core and flexibility do not support this, the position will cause discomfort within the first 30 minutes. An aggressive fit only improves performance when your body is conditioned for it.",
          },
        },
      },
      painAreas: {
        questionText: "Where do you experience discomfort?",
        helpText: "Select all areas that apply. This helps pinpoint the root cause of your discomfort.",
        selectPrompt: "Select one or more areas above.",
        areas: {
          knee_front: {
            label: "Front of knee",
            subtitle: "Anterior",
            tooltip: "Pain at the front of the knee often points to saddle height being too low, cleats positioned too far back, or excessive float in the pedal system.",
          },
          knee_back: {
            label: "Back of knee",
            subtitle: "Posterior",
            tooltip: "Posterior knee pain is commonly caused by saddle height being too high or cleats positioned too far forward, stretching the hamstring attachment.",
          },
          lower_back: {
            label: "Lower back",
            subtitle: "Lumbar",
            tooltip: "Lower back discomfort usually comes from a reach that is too long, saddle too high, or insufficient core strength. A shorter stem or higher bar height can help.",
          },
          neck: {
            label: "Neck or shoulders",
            subtitle: "Cervical / Trapezius",
            tooltip: "Neck and shoulder tension is often caused by bars that are too low or too far away, forcing you to hold your head up for extended periods.",
          },
          hands: {
            label: "Hands",
            subtitle: "Numbness or pain",
            tooltip: "Hand numbness or pain is typically caused by too much weight on the bars, bars too low, or grip width not matching shoulder width. Padded gloves and ergonomic bar tape can also help.",
          },
          saddle: {
            label: "Saddle area",
            subtitle: "Sit bones / perineum",
            tooltip: "Saddle discomfort points to saddle height, tilt, fore-aft position, or saddle width/shape not matching your sit bone width. A professional saddle fitting is recommended.",
          },
          feet: {
            label: "Feet",
            subtitle: "Hot foot or numbness",
            tooltip: "Hot foot and numbness usually stem from cleat position (too far forward) or cycling shoes that are too narrow, compressing the metatarsal nerves under load.",
          },
        },
      },
      currentPositionFeeling: {
        questionText: "How does your current bike position feel?",
        helpText:
          "Small discomforts often indicate misalignment in your setup. By identifying these early, we can adjust key parameters like reach, handlebar height, and saddle position to improve comfort and performance. Select all that apply — if you don't have a current bike, choose 'Skip this step'.",
        imageAlt: "Illustration of comfortable versus uncomfortable cycling positions",
        orDivider: "or describe what feels off",
        options: {
          good: {
            label: "Generally good, minor tweaks needed",
            subtitle: "Minor adjustments needed",
            tooltip:
              "Your position feels mostly comfortable with small improvements possible.",
          },
          no_bike: {
            label: "Skip this step",
            subtitle:
              "We'll base your fit entirely on your body measurements and riding profile.",
            tooltip:
              "We'll base your fit entirely on your body measurements and riding profile.",
          },
          too_stretched: {
            label: "Too stretched out - reaching too far",
            subtitle: "Too long a reach",
            tooltip:
              "Your arms, neck, or lower back may feel overstretched on longer rides.",
          },
          too_compact: {
            label: "Too compact - feel cramped",
            subtitle: "Feeling cramped or too upright",
            tooltip:
              "Your position may limit breathing, comfort, or power output.",
          },
          too_low: {
            label: "Handlebars feel too low",
            subtitle: "Too much pressure on hands or back",
            tooltip:
              "You may feel strain in your neck, shoulders, or lower back.",
          },
          too_high: {
            label: "Handlebars feel too high",
            subtitle: "Not enough forward position",
            tooltip:
              "You may feel less efficient or lack front-end control.",
          },
          saddle_too_high: {
            label: "Saddle feels too high",
            subtitle: "Possible hip rocking",
            tooltip:
              "A saddle that's too high causes the hips to rock, stresses the knees, and reduces power transfer.",
          },
          saddle_too_low: {
            label: "Saddle feels too low",
            subtitle: "Increased knee strain",
            tooltip:
              "A saddle that's too low compresses the knee joint and limits full leg extension.",
          },
        },
      },
      climbingProfile: {
        questionText: "Would you like a climbing-specific fit profile?",
        helpText:
          "A climbing profile gives you a second set of recommendations optimised for seated climbing efficiency — adjusted saddle height, setback, and handlebar position.",
        imageAlt: "Climbing cyclist illustration",
        options: {
          yes: {
            label: "Yes, add a climbing profile",
            tooltip:
              "We'll calculate a second set of measurements optimised for seated climbing — adjusted saddle height, setback, and handlebar position to improve efficiency on climbs.",
          },
          no: {
            label: "No, standard fit only",
            tooltip:
              "We'll provide a single all-round fit profile based on your measurements and riding preferences.",
          },
        },
      },
      climbingImportance: {
        questionText: "How important is climbing in your riding?",
        helpText:
          "Climbing changes how your body interacts with the bike. We adjust your position to improve efficiency, comfort, and control on long or steep climbs.",
        options: {
          rarely: {
            label: "Rarely climb",
            tooltip:
              "On flat terrain, we can optimize your position for aerodynamics and speed with a lower and more stretched setup.",
          },
          occasional: {
            label: "Occasional climbs",
            tooltip:
              "A balanced position helps you stay efficient on flats while remaining comfortable on short climbs.",
          },
          regular: {
            label: "Regular climbing",
            tooltip:
              "Climbing requires efficient power transfer and comfort in a more upright position. We adjust your setup to reduce strain during sustained efforts.",
          },
          climbing_focused: {
            label: "Climbing-focused",
            tooltip:
              "Long climbs demand an open hip angle and stable posture. We optimize your position for seated climbing efficiency and reduced fatigue.",
          },
        },
      },
      roadRidingType: {
        questionText: "What type of road riding do you primarily do?",
        helpText:
          "Your riding type influences how aggressive and aerodynamic your position should be. We use this to tailor your setup for comfort, efficiency, or maximum performance.",
        imageAlt: "Type of riding illustration",
        options: {
          casual: {
            label: "Casual rides and fitness",
            description:
              "Focused on comfort and enjoyment. We prioritize a more relaxed position with reduced strain on your back, neck, and hands.",
            tooltip:
              "Focused on comfort and enjoyment. We prioritize a more relaxed position with reduced strain on your back, neck, and hands.",
          },
          group: {
            label: "Group rides and sportives",
            description:
              "A mix of endurance and pace. We balance comfort and efficiency to support longer rides with moderate intensity.",
            tooltip:
              "A mix of endurance and pace. We balance comfort and efficiency to support longer rides with moderate intensity.",
          },
          training: {
            label: "Structured training",
            description:
              "Regular training with specific goals. We optimize your position for efficiency and power transfer while maintaining sustainability.",
            tooltip:
              "Regular training with specific goals. We optimize your position for efficiency and power transfer while maintaining sustainability.",
          },
          racing: {
            label: "Racing (crits, road races)",
            description:
              "High intensity and performance-focused. We create a more aggressive position to improve speed, aerodynamics, and responsiveness.",
            tooltip:
              "High intensity and performance-focused. We create a more aggressive position to improve speed, aerodynamics, and responsiveness.",
          },
          tt: {
            label: "Time trials / triathlon",
            description:
              "Maximum aerodynamic efficiency. We position you lower and more forward to minimize air resistance and maximize sustained speed.",
            tooltip:
              "Maximum aerodynamic efficiency. We position you lower and more forward to minimize air resistance and maximize sustained speed.",
          },
        },
      },
      mtbTerrain: {
        questionText: "What terrain do you primarily ride?",
        helpText:
          "The terrain you ride has a major impact on your ideal bike setup. Smooth roads allow for a more aerodynamic position, while rough and technical terrain requires more control and stability. We use this to find the right balance between comfort, control, efficiency, and performance.",
        imageAlt: "Bike terrain illustration",
        options: {
          asphalt: {
            label: "Only asphalt",
            tooltip:
              "Smooth roads allow for an efficient and aerodynamic riding position. We optimize your setup for speed, power transfer, and reduced air resistance.",
          },
          paved: {
            label: "Paved roads and light gravel",
            tooltip:
              "Mixed surfaces require a balance between comfort and efficiency. We slightly increase stability while maintaining a fast, efficient position.",
          },
          xc: {
            label: "Cross-country (smooth trails, climbing)",
            tooltip:
              "Climbing and light trails require efficient power transfer and control. We balance stability with a position suited for sustained effort.",
          },
          trail: {
            label: "Trail (varied terrain, some technical)",
            tooltip:
              "Uneven and technical terrain demands more control and flexibility. We adjust your position to improve handling and stability on descents.",
          },
          enduro: {
            label: "Enduro (technical descents, big climbs)",
            tooltip:
              "Steep descents and rough terrain require a stable and confident position. We prioritize control and shock absorption over aerodynamics.",
          },
          dh: {
            label: "Downhill / bike park",
            tooltip:
              "High-speed descents and jumps require maximum control and safety. We optimize your setup for stability, impact absorption, and handling.",
          },
        },
      },
      multiChoice: {
        legend: "Select all that apply",
      },
      numeric: {
        label: "Your numeric answer",
        tooltip:
          "Enter a number only (no units). Use the specified unit in the label (cm/mm/deg).",
        placeholder: "Enter a number",
        range: "Range: {min} - {max}{unit}",
        errors: {
          invalidNumber: "Please enter a valid number",
          min: "Value must be at least {min}{unit}",
          max: "Value must be at most {max}{unit}",
        },
      },
      text: {
        label: "Your written answer",
        tooltip:
          "Write a short, specific answer. Include relevant details like bike type, weekly volume, and any discomfort.",
        placeholder: "Type your answer here...",
      },
    },
    results: {
      loading: "Loading fit results...",
      backToDashboard: "Back to Dashboard",
      title: "Your Bike Fit Recommendations",
      mainProfileTab: "Your fit",
      climbingProfileTab: "Climbing fit",
      climbingProfileNote: "This setup is optimised for climbing — higher bars, adjusted saddle setback, and shorter reach to improve power output and comfort on long ascents.",
      subtitle:
        "Based on your measurements and riding preferences, here are your personalized bike fit settings.",
      algorithmVersionLabel: "Algorithm version",
      sessionNotFound: {
        title: "Session not found",
        description: "The fit session you're looking for doesn't exist.",
        cta: "Go to Dashboard",
      },
      questionnaireIncomplete: {
        title: "Questionnaire not completed",
        description:
          "Complete your questionnaire first, then we can generate your fit recommendation.",
        cta: "Continue Questionnaire",
      },
      processing: {
        title: "Calculating Your Fit",
        description:
          "We're analyzing your measurements and preferences to generate personalized recommendations...",
        retryCta: "Retry Generation",
        generateNowCta: "Generate Now",
      },
      emailDialog: {
        title: "Email report",
        sentTitle: "Email sent",
        description:
          "Send your bike fit recommendations to your email for future reference.",
        sentDescription: "Check your inbox for your bike fit report.",
        emailLabel: "Email address",
        emailTooltip: "Enter the email address where you want to receive this report.",
        emailPlaceholder: "you@example.com",
        sendCta: "Send Report",
        errors: {
          sendTitle: "Failed to send report",
        },
      },
      actions: {
        emailReport: "Email Report",
        downloadPdf: "Download PDF",
        startNewFit: "Start New Fit Session",
      },
      viewer: {
        title: "Report viewer",
        description:
          "Preview your PDF report here. You can also download it or send it to your email address.",
        loading: "Loading PDF report...",
        iframeTitle: "Bike fit report PDF preview",
        emailMissing: "No email address is available for your account.",
        inlineFailed:
          "The PDF could not be shown inside the viewer. Open it full page or download it instead.",
        unsupported:
          "This browser could not display the PDF inside the viewer. Open it in a new tab or download it instead.",
        openInNewTab: "Open in new tab",
        openFullPage: "Open full page",
      },
      errors: {
        pdfGenerateFailed: "Failed to generate PDF report.",
        downloadTitle: "Failed to download PDF",
      },
      reportV2: {
        locale: "en",
        introTitle: "Your fit report",
        introBody:
          "Use this report as a practical adjustment sequence. Change one variable at a time, validate on the bike, and keep notes after each ride.",
        shell: {
          brandAlt: "BestBikeFit4U brand mark",
          dateLabel: "Report date",
          aboutTitle: "About this report",
          aboutBody:
            "This report translates your fit session into a clear adjustment plan you can use on the bike or review with a fitter or bike shop.",
          actionsTitle: "Report actions",
          aboutBullets: [
            "Follow the sequence one step at a time.",
            "Validate each change during a real ride.",
            "Use the notes and pressure guidance before making bigger setup changes.",
            "Compare your bike context and your body profile before changing components.",
          ] as string[],
          coverSupport:
            "Built to help you review your current setup with clearer next steps.",
          fitPassActivated:
            "Fit Pass activated. Your full report is now available.",
          summaryTitle: "Summary",
          summaryFullAccess:
            "Your full report is ready, including the detailed adjustment sequence and validation steps.",
          summaryLimited:
            "You are seeing the core fit numbers now. Additional report actions remain available through Fit Pass or Pro.",
          unlockTitle: "Unlock the full report",
          unlockDescription:
            "The free view shows your core numbers and priorities. Fit Pass adds the full adjustment sequence, PDF download, email report, and validation plan.",
          unlockItems: [
            "Detailed fit table",
            "Full adjustment sequence",
            "Tire pressure and warnings",
            "14-day validation plan",
          ] as string[],
        },
        sections: {
          about: "About your report",
          profile: "Fit context",
          rider: "Rider profile",
          flexibility: "Flexibility",
          coreStability: "Core stability",
          comfort: "Comfort & discomfort",
          yourBike: "Your bike",
          prioritySummary: "Priority summary",
          detailedFit: "Detailed fit table",
          adjustmentSequence: "Adjustment sequence",
          tirePressure: "Tire pressure",
          validationPlan: "14-day validation plan",
          frameTargets: "Frame targets",
          fitNotes: "Additional fit notes",
        },
        profileFields: {
          sessionId: "Session ID",
          bikeType: "Bike type",
          ridingStyle: "Riding style",
          goal: "Primary goal",
          algorithmVersion: "Algorithm version",
          engineVersion: "Engine version",
          confidence: "Global confidence",
          dataQuality: "Data quality",
          missingData: "Missing data",
        },
        rider: {
          anonymousRider: "Rider",
          subtitle: "Body measurements used in this fit",
          height: "Height",
          weight: "Weight",
          inseam: "Inseam",
          armLength: "Arm length",
          torsoLength: "Torso length",
          shoulderWidth: "Shoulder width",
          bmi: "BMI",
          frameStack: "Stack",
          frameReach: "Reach",
          frameEffectiveTopTube: "ETT",
          bmiCategories: {
            underweight: "Underweight",
            normal: "Healthy weight",
            overweight: "Overweight",
            obese: "Obese",
          },
        },
        scoreMeta: {
          flexibility: {
            title: "Flexibility",
            labels: {
              1: "Very limited",
              2: "Limited",
              3: "Average",
              4: "Good",
              5: "Excellent",
            },
            descriptions: {
              1: "Cannot reach knees when seated with legs straight.",
              2: "Can reach mid-shin when seated.",
              3: "Can reach ankles when seated.",
              4: "Can reach toes when seated.",
              5: "Can reach past toes when seated.",
            },
          },
          coreStability: {
            title: "Core stability",
            labels: {
              1: "Very low",
              2: "Low",
              3: "Average",
              4: "Good",
              5: "Excellent",
            },
            descriptions: {
              1: "Plank hold less than 20 seconds.",
              2: "Plank hold 20-40 seconds.",
              3: "Plank hold 40-60 seconds.",
              4: "Plank hold 60-90 seconds.",
              5: "Plank hold 90+ seconds with strong form.",
            },
          },
          comfort: {
            title: "Comfort & discomfort",
            labels: {
              1: "Severe discomfort",
              2: "Significant discomfort",
              3: "Moderate discomfort",
              4: "Mild discomfort",
              5: "Comfortable",
            },
            descriptions: {
              1: "Pain is strong enough to limit or stop riding.",
              2: "Pain returns regularly and affects your riding.",
              3: "Discomfort shows up on longer or harder rides.",
              4: "Minor discomfort appears only occasionally.",
              5: "No meaningful discomfort while riding.",
            },
            impactText:
              "Discomfort on the bike is a signal, not just a feeling. This report helps connect that signal to setup changes you can validate on real rides.",
          },
        },
        bike: {
          bikeType: "Bike type",
          brand: "Brand",
          model: "Model",
          ridingStyle: "Riding style",
          goal: "Primary goal",
          experienceLevel: "Experience level",
          weeklyHours: "Weekly hours",
          rideLength: "Typical ride length",
          positionPriority: "Position priority",
          typeOfRiding: "Type of riding",
          reportConfidence: "Fit confidence",
          algorithmVersion: "Algorithm version",
          engineVersion: "Engine version",
          dataQuality: "Data quality",
          descriptionFallback:
            "No bike description was available for this report yet.",
        },
        dataQuality: {
          complete: "Complete",
          partial: "Partial",
          banner:
            "Some recommendations need more rider or tyre data. Review the missing-data list and the tire-pressure section before making bigger changes.",
        },
        status: {
          ready: "Ready to apply",
          pendingData: "Pending data",
          optional: "Component change",
        },
        table: {
          parameter: "Parameter",
          target: "Target",
          range: "Range",
          current: "Current",
          delta: "Delta",
          confidence: "Confidence",
          whyItMatters: "Why it matters",
          riderValidationCue: "Rider validation cue",
          method: "Method",
          feelDescription: "Feel description",
          watchOuts: "Watch-outs",
          status: "Status",
        },
        delta: {
          increase: "↑ {amount} mm from current",
          decrease: "↓ {amount} mm from current",
          neutral: "On target",
        },
        adjustmentGuideline:
          "Change one variable at a time and keep single moves within 2-5 mm before the next validation ride.",
        tirePressure: {
          readyTitle: "Pressure guidance available",
          pendingTitle: "Pending required data",
          pendingDescription:
            "Personalized tyre pressure needs rider weight, tyre setup, and surface context. Use the quick-start table only as a temporary starting point.",
          quickStartTitle: "Quick-start estimate",
          quickStartNote: "Not personalized. Always respect tyre and rim maximum limits.",
          quickStartColumns: {
            weight: "Weight",
            tireSize: "Tyre size",
            psi: "PSI",
          },
          confidence: "Pressure confidence",
          front: "Front",
          rear: "Rear",
          warnings: "Pressure warnings",
          noWarnings: "No pressure warnings in the latest calculation.",
          inputsTitle: "Inputs used",
          inputLabels: {
            riderWeight: "Rider weight",
            surface: "Surface",
            goal: "Riding goal",
          },
          missingDataLabels: {
            riderWeight: "Rider weight",
            bikeWeight: "Bike weight",
            tireWidth: "Measured tyre width",
            tireType: "Tyre construction",
            surface: "Surface condition",
            pressureWeight: "Pressure calculator weight input",
          },
          surfaceValues: {
            smoothAsphalt: "Smooth asphalt",
            averageAsphalt: "Average asphalt",
            roughAsphalt: "Rough asphalt",
            hardpackGravel: "Hardpack gravel",
            looseGravel: "Loose gravel",
            trail: "Trail",
          },
        },
        paywall: {
          emailUpgradeToast:
            "Fit Pass or Pro is required to email the full report.",
          emailUpgradeButton: "Email report - Fit Pass",
          pdfUpgradeToast:
            "Fit Pass or Pro is required to download your PDF.",
          pdfUpgradeButton: "PDF - Fit Pass or Pro",
        },
        validationPlan: {
          dayBlock: "Day block",
          change: "Change",
          rideDuration: "Ride duration",
          whatToScore: "What to score",
          rows: [
            {
              dayBlock: "Days 1-3",
              change: "Set saddle height and settle into the baseline.",
              rideDuration: "30-45 min",
              whatToScore: "Hip stability, knee comfort, smooth cadence",
            },
            {
              dayBlock: "Days 4-7",
              change: "Confirm saddle setback and seated balance.",
              rideDuration: "45-60 min",
              whatToScore: "Hand pressure, seated traction, pelvic stability",
            },
            {
              dayBlock: "Days 8-10",
              change: "Refine cockpit height and reach.",
              rideDuration: "60-90 min",
              whatToScore: "Neck tension, breathing room, elbow softness",
            },
            {
              dayBlock: "Days 11-14",
              change: "Validate longer rides and final small corrections.",
              rideDuration: "90+ min",
              whatToScore: "Overall comfort, repeatability, fatigue pattern",
            },
          ] as Array<{
            dayBlock: string;
            change: string;
            rideDuration: string;
            whatToScore: string;
          }>,
        },
        parameters: {
          saddleHeight: {
            label: "Saddle height",
            whyItMatters: "Sets knee extension timing and is the main driver of lower-limb load.",
            riderValidationCue: "You spin smoothly without hip rocking after 15-20 minutes.",
            feelDescription: "The pedal stroke feels round and controlled. You do not reach for the bottom of the stroke.",
            watchOutHigh: "Too high can cause hip rocking, hamstring strain, and overreaching at the bottom.",
            watchOutLow: "Too low can overload the knees and make the stroke feel cramped.",
            methodLabel: "LeMond baseline + Holmes validation band",
            measurementReference: "Bottom-bracket center to saddle top along the seat-tube line.",
            sequenceNote: "Start here because every cockpit recommendation depends on a stable saddle reference.",
          },
          saddleSetback: {
            label: "Saddle setback",
            whyItMatters: "Controls seated balance and helps distribute load between saddle, feet, and hands.",
            riderValidationCue: "You feel balanced over the bike with steady seated traction.",
            feelDescription: "Your hips feel supported and your hands do not carry excess weight on flat terrain.",
            watchOutHigh: "Too far back can make the front end feel long and heavy.",
            watchOutLow: "Too far forward can increase knee load and overload the hands.",
            methodLabel: "KOPS-informed starting point + stability correction",
            measurementReference: "Horizontal distance from bottom-bracket center to saddle nose reference point.",
            sequenceNote: "Lock setback after saddle height so the rider's seated balance is stable before front-end work.",
          },
          handlebarDrop: {
            label: "Handlebar drop",
            whyItMatters: "Sets the comfort-to-aero balance and changes how much spinal and hip mobility the position needs.",
            riderValidationCue: "You can use hoods and drops without neck or low-back tension building quickly.",
            feelDescription: "The front end feels supportive rather than restrictive, with room to breathe under effort.",
            watchOutHigh: "Too much drop can overload the neck, back, and hamstrings.",
            watchOutLow: "Too little drop can reduce front-end support and limit an efficient road posture.",
            methodLabel: "Terrain and goal correction for riding style",
            measurementReference: "Vertical difference between saddle reference height and handlebar contact height.",
            sequenceNote: "Only adjust drop after the saddle is stable, otherwise you chase two changing references.",
          },
          handlebarReach: {
            label: "Handlebar reach",
            whyItMatters: "Determines cockpit length and influences elbow bend, shoulder load, and steering control.",
            riderValidationCue: "Your elbows stay soft and you can hold the hoods without excess palm pressure.",
            feelDescription: "The cockpit feels long enough for support but not so long that you brace through the shoulders.",
            watchOutHigh: "Too long can lock the elbows and increase hand, neck, or shoulder discomfort.",
            watchOutLow: "Too short can crowd the torso and make steering feel nervous.",
            methodLabel: "Stack/reach and contact-point model",
            measurementReference: "Horizontal saddle-to-handlebar reach between contact-point references.",
            sequenceNote: "Set reach after drop because stack changes often alter how long the cockpit feels.",
          },
          stem: {
            label: "Stem",
            whyItMatters: "Fine-tunes steering feel and front-end length once saddle and bar targets are clear.",
            riderValidationCue: "Steering feels calm and your hands stay light in normal riding.",
            feelDescription: "The bike tracks naturally without making you brace at the bars.",
            watchOutHigh: "A longer stem than needed can slow steering and overload reach.",
            watchOutLow: "A shorter stem than needed can make steering feel abrupt and cramped.",
            methodLabel: "Fine-tuned after saddle is locked",
            measurementReference: "Center-to-center stem length with installed angle.",
            sequenceNote: "Treat the stem as a refinement tool, not the first contact-point adjustment.",
          },
          crankLength: {
            label: "Crank length",
            whyItMatters: "Changes leverage and joint travel, especially through the top of the pedal stroke.",
            riderValidationCue: "The top of the stroke feels clear and powerful without hip pinching.",
            feelDescription: "You can pedal under load without feeling compressed at the top of the circle.",
            watchOutHigh: "Too long can increase hip and knee compression at the top of the stroke.",
            watchOutLow: "Too short can reduce leverage if the rider adapts poorly.",
            methodLabel: "Standard proportional baseline",
            measurementReference: "Crank center to pedal spindle center.",
            sequenceNote: "Review crank length after contact points because changing cranks often affects saddle setup.",
          },
          handlebarWidth: {
            label: "Handlebar width",
            whyItMatters: "Affects shoulder comfort, leverage, and how open the rider's chest feels.",
            riderValidationCue: "Your shoulders stay relaxed and breathing feels natural under effort.",
            feelDescription: "The bar width feels stable without forcing the elbows in or out unnaturally.",
            watchOutHigh: "Too wide can increase shoulder strain and upper-body drag.",
            watchOutLow: "Too narrow can crowd breathing and reduce steering leverage.",
            methodLabel: "Shoulder-width alignment",
            measurementReference: "Bar width measured center-to-center at the hoods or drops depending on design.",
            sequenceNote: "Confirm width after the core cockpit numbers because width mainly refines comfort and control.",
          },
        },
      },
      pressureInsights: {
        title: "Fit & pressure insights",
        comfort: "Comfort-oriented setup",
        balanced: "Balanced setup",
        performance: "Performance-oriented setup",
        stability: "Stability",
        surface: "Surface match",
        surfaceMatched: "Pressure and surface look aligned.",
        surfaceUnknown: "No surface note available yet.",
        allGood: "Setup looks well-matched to your pressure profile.",
        warningMessages: {
          pressure_high_for_gravel:
            "Your tyre pressure may reduce grip and comfort on gravel surfaces.",
          pressure_low_general:
            "Your tyre pressure may cause handling issues or pinch flats.",
          aggressive_setup_rough_terrain:
            "An aggressive position plus low pressure on rough terrain may increase discomfort.",
          weight_mismatch:
            "Your current weight differs from the weight used in the latest pressure calculation.",
          gravel_road_conflict:
            "This road-bike setup is paired with a gravel surface profile.",
          mtb_pressure_stability:
            "Your front tyre pressure is high for MTB use and may reduce stability.",
          performance_posture_low_pressure:
            "Your performance posture assumption works better with firmer road pressure.",
        } as Record<string, string>,
      },
    },
    dashboardFit: {
      noResultsYet: "No fit results linked to this bike yet.",
    },
    profile: {
      loading: "Loading profile...",
      title: "My Profile",
      photo: {
        upload: "Upload photo",
        error: "Upload failed. Please try again.",
        fileTooLarge: "Use an image smaller than 5 MB.",
        invalidType: "Use JPG, PNG, or WEBP.",
      },
      actions: {
        editMeasurements: "Profile Wizard",
        editInline: "Edit",
      },
      sections: {
        bodyMeasurements: "Body Measurements",
        flexibility: "Flexibility",
        coreStability: "Core Stability",
        comfort: "Comfort",
      },
      bmi: {
        label: "BMI",
        underweight: "Underweight",
        normal: "Normal weight",
        overweight: "Overweight",
        obese: "Obese",
        noWeight: "Add your weight to see your BMI",
      },
      ridingStyle: {
        title: "Riding Style",
        editButton: "Edit",
        description: "Your riding style plays a key role in determining your optimal bike fit. Factors such as your experience level, weekly training volume, typical ride distance, and personal preferences influence how aggressive or relaxed your position should be.",
        incompleteTitle: "Complete your riding profile",
        incompleteDescription: "Answer a few questions about your riding style to enable bike fitting.",
        completeCta: "Complete now",
        experienceLevel: "Experience level",
        weeklyHours: "Weekly hours",
        typicalRide: "Typical ride",
        positionPriority: "Position priority",
        positionPriorityQuestion: "What's most important to you in your riding position?",
        saveButton: "Save",
      },
      measurements: {
        summary: "Your saved rider measurements",
        impactDescription:
          "Your height, inseam, arm length, and torso length directly determine the geometry of your ideal bike fit. BMI gives a broad indication of weight relative to height — it influences saddle pressure, power-to-weight ratio, and joint load on longer rides.",
        improveLink: "How to improve your BMI",
        height: "Height",
        inseam: "Inseam",
        weight: "Body weight",
        weightHelper: "Used for tire pressure calculations.",
        weightTooltip: "Your weight is used to calculate optimal tire pressure for your bikes.",
        weightNotSet: "Add your weight to enable tire pressure calculations",
        torso: "Torso",
        armLength: "Arm Length",
        shoulderWidth: "Shoulder Width",
        femurLength: "Femur Length",
        howToMeasure: "How to measure:",
        saveField: "Save",
        editAllButton: "Edit",
        addOptional: "+ Add optional measurements",
        heightSteps: [
          "Stand barefoot against a wall",
          "Place a book flat on your head",
          "Mark the wall and measure from floor to the mark",
        ],
        inseamSteps: [
          "Stand barefoot against a wall",
          "Place a book firmly between your legs like a saddle",
          "Measure from the floor to the top of the book",
        ],
        torsoSteps: [
          "Sit upright on a flat chair",
          "Measure from your navel to the top of the sternum",
        ],
        armSteps: [
          "Extend your arm straight to the side",
          "Measure from the shoulder point to the tip of your middle finger",
        ],
        shoulderSteps: [
          "Stand relaxed with arms at your sides",
          "Measure between the outer shoulder points",
        ],
        femurSteps: [
          "Sit on a chair with your thigh parallel to the floor",
          "Measure from the hip crease to the center of the knee",
        ],
      },
      flexibility: {
        helper: "Hamstring flexibility score",
        editButton: "Edit",
        improveLink: "How to improve your flexibility",
        levelLabel: "{label} ({index}/5)",
        saveButton: "Save",
        testInstructions: {
          title: "How to perform the test",
          steps: [
            "Sit on the floor with legs straight out in front",
            "Keep your knees flat on the ground",
            "Reach forward with both hands toward your toes",
            "Note how far you can comfortably reach",
          ],
        },
        impactTitle: "How this affects your fit",
        impactDescription:
          "Lower flexibility scores lead to a more upright position with less handlebar drop. Better flexibility allows a lower, more aerodynamic posture.",
      },
      comfort: {
        editButton: "Edit",
        saveButton: "Save",
        severityLevels: {
          none: "None",
          mild: "Mild",
          noticeable: "Noticeable",
          significant: "Significant",
          severe: "Severe",
          verySevere: "Very severe",
        },
        editInstructions: "Set the severity for each area. Leave on None if you have no discomfort there.",
        impactDescription:
          "Even minor discomfort usually signals a fit issue rather than just fatigue. By tracking which areas are affected and how severe, we can make precise adjustments to reach, handlebar height, and saddle position — turning recurring discomfort into a solvable problem.",
        improveLink: "How to improve your comfort",
        noPain: "No discomfort",
        painAreasLabel: "Areas of discomfort",
        testInstructions: {
          title: "Rate your comfort level",
          steps: [
            "Think about your last 3–5 rides of typical duration.",
            "Select the level that best describes your average experience.",
            "If pain varies a lot, choose the level that occurs most often.",
          ],
        },
      },
      coreStability: {
        helper: "Plank hold assessment",
        editButton: "Edit",
        improveLink: "How to improve your core stability",
        levelLabel: "{label} • {description}",
        saveButton: "Save",
        testInstructions: {
          title: "Front plank hold test",
          steps: [
            "Get into a front plank on forearms and toes",
            "Keep a straight line from head to heels",
            "Avoid sagging or piking the hips",
            "Time how long you can hold proper form",
            "Stop when form starts to break down",
          ],
        },
        impactTitle: "How this affects your fit",
        impactDescription:
          "Lower core stability limits how far you can reach and how low your handlebars can go without fatigue. A stronger core supports a longer, more performance-oriented position.",
      },
      status: {
        title: "Profile Status",
        description:
          "Your profile is complete. You can now start a fit session to get personalized bike setup recommendations.",
        startFitCta: "Start New Fit Session",
      },
      edit: {
        title: "Edit Your Measurements",
        description:
          "Update your body measurements for more accurate fit recommendations.",
      },
      onboarding: {
        title: "Complete Your Profile",
        description:
          "Enter your body measurements to get personalized bike fit recommendations.",
      },
      errors: {
        saveFailedTitle: "Could not save profile",
      },
      recalculate: {
        dialogTitle: "Update tire pressure?",
        dialogBody:
          "Your weight changed to {weight} kg. Would you like to recalculate the recommended tire pressure for your bikes?",
        confirmButton: "Yes, recalculate",
        dismissButton: "Not now",
        successToast: "Updated tire pressure recommendations for {count} bikes.",
        calculating: "Recalculating...",
      },
      refresh: {
        title: "Do you want to recalculate your fitting and tire pressure settings?",
        descriptionWithPressure:
          "Your body measurements were updated. Start a new fitting session to refresh your fit recommendations, or recalculate tire pressure now based on {weight} kg.",
        descriptionFitOnly:
          "Your body measurements were updated. Start a new fitting session to refresh your fit recommendations.",
        fitButton: "Start new fit session",
        pressureButton: "Recalculate tire pressure",
        dismissButton: "Not now",
      },
      improve: {
        bodyMeasurements: {
          title: "How to Improve Your BMI",
          subtitle:
            "BMI gives a broad indication of weight relative to height. For cyclists, managing body composition improves power-to-weight ratio, reduces joint load, and enhances long-ride endurance.",
          whatItMeansTitle: "What your BMI means for your bike fit",
          exercisesTitle: "Strategies to improve body composition",
          progressTitle: "How to track your progress",
          updateScoreCta: "Update my measurements",
          backLink: "Back to Profile",
        },
        comfort: {
          title: "How to Improve Your Riding Comfort",
          subtitle:
            "Most cycling discomfort has a direct fit cause. Small, targeted adjustments to saddle height, reach, or cleat position can eliminate pain entirely.",
          whatItMeansTitle: "What your comfort level means for your bike fit",
          exercisesTitle: "Fit adjustments by pain area",
          progressTitle: "How to track your progress",
          updateScoreCta: "Update my comfort level",
          backLink: "Back to Profile",
        },
        flexibility: {
          title: "Improve Your Flexibility",
          subtitle:
            "Hamstring and lower back flexibility determine how low and forward you can comfortably ride.",
          whatItMeansTitle: "What your score means for your bike fit",
          exercisesTitle: "Exercises to improve your flexibility",
          progressTitle: "How to track your progress",
          updateScoreCta: "Update my flexibility score",
          backLink: "Back to Profile",
        },
        coreStability: {
          title: "Improve Your Core Stability",
          subtitle:
            "Core strength determines how long you can hold an aggressive position without fatigue or back pain.",
          whatItMeansTitle: "What your score means for your bike fit",
          exercisesTitle: "Exercises to build core stability",
          progressTitle: "How to track your progress",
          updateScoreCta: "Update my core stability score",
          backLink: "Back to Profile",
        },
      },
      dangerZone: {
        title: "Danger Zone",
        deleteAccount: "Delete Account",
        deleteConfirmTitle: "Delete your account?",
        deleteConfirmDescription:
          "This will permanently delete your profile, bikes, fit sessions, recommendations, and all other data. This action cannot be undone.",
        deleteConfirmCta: "Yes, delete my account",
        deleteConfirmInputLabel: "Type \"Delete\" to confirm",
        deleteConfirmInputPlaceholder: "Delete",
        deleteConfirmWord: "Delete",
        cancel: "Cancel",
        deleteFailed: "Could not delete account. Please try again.",
      },
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your account, preferences, and integrations.",
      account: {
        title: "Account",
        type: "Account type",
        displayNameLabel: "Display name",
        displayNamePlaceholder: "How your name should appear",
        saveDisplayName: "Save display name",
        displayNameSaveFailed: "Could not save display name. Please try again.",
        free: "Free",
        pro: "Pro",
        upgrade: "Upgrade to Pro",
        upgradeDescription:
          "Unlock Strava sync, richer tyre-pressure insights, and a more advanced setup workflow.",
        upgradeCta: "View plans",
      },
      preferences: {
        title: "Preferences",
        language: "Language",
        appearance: "Appearance",
        units: "Units",
        metric: "Metric (kg, mm)",
        imperial: "Imperial (lbs, in)",
        light: "Light",
        dark: "Dark",
        system: "System",
      },
      appInstall: {
        settingsTitle: "Install on iPhone",
        settingsDescription:
          "Create an iPhone home-screen app for BestBikeFit4U. When you open it from the icon, the app will take you straight into your dashboard if you're still signed in.",
        eyebrow: "iPhone app",
        title: "Install BestBikeFit4U on your iPhone",
        description:
          "Save BestBikeFit4U to your iPhone home screen for an app-like experience with direct dashboard launch.",
        quickStepsTitle: "Quick steps",
        openInstallPage: "Open install page",
        openDashboard: "Open dashboard",
        backToSettings: "Back to settings",
        installedTitle: "App installed",
        installedDescription:
          "BestBikeFit4U is already running in home-screen mode on this device.",
        openInSafariTitle: "Open this in Safari",
        openInSafariDescription:
          "iPhone home-screen install only works from Safari. Open this page in Safari, then use Share and Add to Home Screen.",
        dashboardLaunchTitle: "Dashboard launch",
        dashboardLaunchDescription:
          "After you add this page to your home screen, opening the icon will route to your dashboard when your session is still active.",
        steps: [
          {
            title: "Open this page in Safari",
            description: "Stay on this install page so the home-screen icon points to the app launcher.",
          },
          {
            title: "Tap Share",
            description: "Use the Safari share button at the bottom or top of the screen.",
          },
          {
            title: "Add to Home Screen",
            description: "Name the app, save it, and launch it from your iPhone home screen.",
          },
        ] as Array<{ title: string; description: string }>,
      },
      integrations: {
        title: "Integrations",
        strava: "Strava",
        stravaDescription:
          "Connect Strava to bring your recent riding context into tyre-pressure guidance.",
        connectStrava: "Connect Strava",
        disconnectStrava: "Disconnect",
        importStravaData: "Import Strava data",
        syncNow: "Sync now",
        connected: "Connected",
        available: "Available",
        proOnly: "Available on Pro",
        pending: "Connecting…",
        error: "Connection error",
        reconnect: "Reconnect Strava",
        lastSynced: "Last synced",
        rideStats: "{count} rides · {km} km · Last 90 days",
        consent: {
          title: "Connect your Strava account",
          whatWeAccess: "What we'll access (read-only)",
          accessProfile: "Your athlete profile (name, photo)",
          accessActivities:
            "Your recent activity summaries (distance, duration, elevation, sport type)",
          whatWeDoNot: "What we will NOT access",
          noGps: "Your GPS routes or maps",
          noNotes: "Your private notes or activities",
          noSocial: "Your followers, clubs, or social data",
          noSegments: "Your segments or personal records",
          howWeUse: "How we use this",
          howWeUseDescription:
            "Your riding history helps us understand your terrain preference and riding style. This improves your tyre pressure recommendations and bike fit suggestions.",
          dataNote:
            "Your data is read-only. You can disconnect at any time from Settings.",
          confirm: "Continue to Strava",
          cancel: "Cancel",
        },
        disconnectConfirm: {
          title: "Disconnect Strava?",
          body: "Your Strava activity data will be removed from BestBikeFit4U. Your profile photo will be kept.",
          confirm: "Disconnect",
          cancel: "Cancel",
        },
        photoImport: {
          importButton: "Use Strava photo",
          confirmTitle: "Use your Strava profile photo?",
          confirmBody: "This will replace your current profile photo with the one from your Strava account.",
          confirm: "Use Strava photo",
          cancel: "Keep current",
        },
        bikeImport: {
          title: "Your Strava bikes",
          description:
            "Review the bikes Strava exposes, see how each one is used, and import the bikes you want to fit and ride with.",
          overviewTitle: "Bike overview",
          overviewDescription:
            "Compare your Strava bikes by lifetime distance, recent usage, and readiness before you import anything.",
          summaryBikes: "{count} bikes",
          summaryImported: "{count} imported",
          summaryReady: "{count} fit ready",
          summaryAttention: "{count} need attention",
          overviewBikesLabel: "Strava bikes",
          overviewImportedLabel: "Imported",
          overviewReadyLabel: "Fit ready",
          overviewAttentionLabel: "Need attention",
          overviewCountNote: "Bikes found in your Strava account",
          overviewImportedNote: "Already linked to your local library",
          overviewReadyNote: "Ready to use in fit sessions",
          overviewAttentionNote: "Need type or fit setup review",
          lifetimeDistanceLabel: "Lifetime distance",
          recentDistanceLabel: "Recent distance",
          recentDistanceNote: "Last 90 days",
          recentRideCountLabel: "Ride count",
          averageRideDistanceLabel: "Avg. ride distance",
          averageSpeedLabel: "Avg. speed",
          lastRideLabel: "Last ride",
          importStateLabel: "Import state",
          availableInStrava: "Available in Strava",
          fitReady: "Fit ready",
          needsFitSetup: "Needs fit setup",
          noUsageData: "Recent usage appears after the first sync.",
          noRecentRides: "No recent rides",
          noBrandModel: "No brand or model information",
          syncWarningTitle: "Strava sync needs attention",
          syncReady: "Ready to import",
          syncImported: "Imported",
          syncError: "Sync error",
          loading: "Loading Strava bike candidates...",
          blockedTitle: "Strava bike import is blocked",
          blockedDescription:
            "The current backend only exposes Strava connection status and photo sync. The gear summary and bike import contracts needed for this flow are not available yet.",
          backendBlocked:
            "Missing backend support: a Strava gear summary query, an import action, and a bike identity field for exact already-imported detection.",
          parseError:
            "The stored Strava payload could not be parsed as bike import data.",
          emptyTitle: "No Strava bike candidates available",
          emptyDescription:
            "No importable bike candidates were found in the current Strava payload.",
          emptySelection: "Select at least one bike to import.",
          selectionSummary: "{count} selected",
          alreadyAdded: "Already added",
          primary: "Primary",
          typeConfirmationNeeded: "Type confirmation",
          importButton: "Import bikes",
          importButtonOne: "Import 1 bike",
          importButtonMany: "Import {count} bikes",
          successOne: "Imported {count} bike from Strava.",
          successMany: "Imported {count} bikes from Strava.",
          partialFailureOne: "Import completed with 1 bike needing attention: {bikes}.",
          partialFailureMany: "Import completed with {count} bikes needing attention: {bikes}.",
          failed: "Could not import bikes from Strava. Please try again.",
          resetSelection: "Reset selection",
          postImportHint:
            "Bikes with an ambiguous type will open a confirmation dialog after the initial import step.",
          typeWizardTitle: "Confirm bike type",
          typeWizardDescription:
            "Strava flagged {name} as ambiguous. Choose the closest bike type before it is added to your library.",
          typeWizardFallback: "Type details unavailable",
          typeWizardPrompt: "Choose the bike type",
          typeWizardCancel: "Cancel",
          typeWizardSave: "Save and continue",
        },
        callback: {
          connected: "Strava connected successfully.",
          error: "Could not connect to Strava. Please try again.",
          denied: "Strava connection was cancelled.",
        },
      },
      privacy: {
        title: "Privacy",
        description:
          "Review your account data, profile details, and legal preferences from one place.",
        privacyPolicy: "Privacy policy",
        terms: "Terms",
        manageProfile: "Manage profile",
      },
    },
    bikes: {
      loading: "Loading bikes...",
      title: "My Bikes",
      subtitle: "Save your bikes to keep fit sessions tied to real setups.",
      actions: {
        addBike: "Add Bike",
      },
      photo: {
        add: "Add photo",
        edit: "Change photo",
        error: "Upload failed.",
      },
      empty: {
        title: "No bikes added yet",
        description: "Save your first bike to compare fit sessions over time.",
        cta: "Add Your First Bike",
      },
      delete: {
        confirm: 'Delete "{bikeName}"? This action cannot be undone.',
        failed: "Could not delete bike. Please try again.",
        blocked:
          "This bike cannot be deleted because it already has fitting history.",
        dialogTitle: 'Delete "{bikeName}"?',
        dialogDescription:
          "This removes the bike and its direct wheelset, tire setup, and pressure setup data. Fitting history prevents deletion.",
        dialogConfirm: "Delete bike",
      },
      defaultProfile: {
        title: "Bike Profiles",
        profileType: "Profile type",
        empty: "No bike profile available yet.",
      },
      profiles: {
        climbingDescription:
          "Focused on seated traction, low-speed efficiency, and long sustained climbs.",
      },
      identity: {
        fallbackSubtitle: "Saved in your bike garage.",
        emptyBrandModel: "Brand and model not added yet.",
        fitBadge: "Fit ready",
        pressureBadge: "Pressure ready",
        passportLabel: "Bike-passport ID",
        passportDescription:
          "Share this ID with another rider if you want them to create their own editable copy of this bike. Their edits never change your bike.",
        passportMissing: "Passport ID not available yet.",
        passportCopyAction: "Copy ID",
        passportCopied: "Bike-passport ID copied.",
        passportCopyFailed: "Could not copy the bike-passport ID.",
      },
      publicFit: {
        title: "Second-hand fit preview",
        description:
          "Let potential buyers run a limited size check for this bike with a shared fit code.",
        enabledBadge: "Preview enabled",
        disabledBadge: "Preview disabled",
        codeLabel: "Public fit code",
        codeHint:
          "This code stays stable when you disable and re-enable the preview.",
        copyAction: "Copy fit code",
        enableAction: "Enable preview",
        reenableAction: "Re-enable preview",
        disableAction: "Disable preview",
        copied: "Public fit code copied.",
        copyFailed: "Could not copy the public fit code.",
        privacyNote:
          "Only bike size and geometry preview data are shared. Personal account details are not shared.",
        weakGeometryTitle: "Preview quality is limited",
        weakGeometryNote: "Add fuller bike geometry for a better public estimate.",
        geometryQuality: {
          full: "Full geometry available",
          partial: "Partial geometry available",
          none: "No geometry shared yet",
        },
        followUpTitle: "Get a better estimate with your inseam and rider profile",
        followUpDescription:
          "Use the quick check as a first screen. Add your rider data for a better estimate.",
        followUpProfileCta: "Add rider profile",
        followUpFitCta: "Open bike fit",
      },
      sections: {
        gallery: "Photos",
        description: "Description",
        geometry: "Geometry",
        wheelsets: "Wheelsets",
        currentSetup: "Current Setup",
        notes: "Notes",
        fittingHistory: "Fitting History",
      },
      gallery: {
        title: "Bike gallery",
        description:
          "Add a few photos so this bike is easier to recognize in your garage and fit history.",
        emptyTitle: "No bike photos yet",
        emptyDescription:
          "Upload a main photo now and add extra angles later if you want.",
        countOne: "1 photo",
        countMany: "{count} photos",
        help: "Choose a thumbnail to change the main preview or open the photo fullscreen.",
        upload: "Upload photo",
        setPrimary: "Set as primary",
        remove: "Remove photo",
        primaryBadge: "Primary",
        captionLabel: "Caption",
        openLightbox: "Open fullscreen photo viewer",
        closeLightbox: "Close fullscreen viewer",
        previousPhoto: "Previous photo",
        nextPhoto: "Next photo",
      },
      descriptionCard: {
        title: "Bike description",
        description:
          "A short editable summary of how you use this bike. This is descriptive only, not technical source data.",
        empty:
          "No description saved yet. Add your own summary or generate a concise draft.",
        placeholder:
          "Describe what this bike is for, how it feels, and where you ride it most.",
        helper:
          "Keep it practical. Avoid geometry claims or exact specs unless you entered them yourself elsewhere.",
        generate: "Generate description",
        regenerate: "Regenerate",
        edit: "Edit manually",
        save: "Save description",
        generating: "Generating...",
        sourceGenerated: "AI-assisted draft",
        sourceManual: "Manual description",
        sourceTemplate: "Starter draft",
        disclaimer:
          "Generated text is editable rider-facing copy, not authoritative bike data.",
      },
      wheelsetManager: {
        title: "Wheelsets",
        description:
          "Manage every wheelset you use with this bike and keep one active for pressure recommendations.",
        emptyTitle: "No wheelsets saved yet",
        emptyDescription:
          "Add your first wheelset to connect tyre setup details to this bike.",
        activeBadge: "Active",
        activeAction: "Set active",
        add: "Add wheelset",
        save: "Save wheelset",
        cancelAdd: "Cancel",
        rimType: "Rim type",
        frontWidth: "Front internal width",
        rearWidth: "Rear internal width",
        tireSetup: "Tyre setup",
        noTireSetup: "No tyre setup linked yet",
      },
      cards: {
        bikeSummary: "{bikeType} saved in your bike garage.",
        bikeFit: {
          title: "Bike fitting",
          hasFitDescription:
            "Latest fit result saved for this bike, including riding style and fit goal context.",
          noFitDescription:
            "No fit result has been saved for this bike yet.",
          lastUpdated: "Last updated",
        },
        advisedPressure: {
          title: "Advised tyre pressure",
          descriptionWithSetup:
            "Latest pressure recommendation based on the active tyre setup: {setup}.",
          descriptionWithoutSetup:
            "Latest saved pressure recommendation for this bike.",
        },
        currentSetup: {
          title: "Current setup",
          description:
            "Saved cockpit and contact-point setup currently used as the baseline for this bike.",
          emptyDescription:
            "No current bike setup has been saved for this bike yet.",
        },
        currentTyrePressure: {
          title: "Current tyre pressure",
          description:
            "The active wheelset is {wheelset} with tyre setup {setup}.",
          emptyDescription:
            "No active wheelset or tyre setup is selected for this bike yet.",
          noCurrentPressure: "No current pressure recorded",
        },
      },
      fields: {
        stack: "Stack",
        reach: "Reach",
        sta: "STA",
        hta: "HTA",
        frameSize: "Frame size",
        saddle: "Saddle",
        setback: "Setback",
        stem: "Stem",
        bar: "Bar",
        crank: "Crank",
      },
    },
    bikeForm: {
      new: {
        title: "Add New Bike",
        description:
          "Save your bike geometry and current setup for better fit comparisons.",
      },
      edit: {
        loading: "Loading bike...",
        title: "Edit Bike",
        description: "Update bike details and current setup values.",
        passportHelper: "This bike-passport ID is generated automatically and cannot be edited.",
        notFound: {
          title: "Bike not found",
          description: "This bike does not exist or you do not have access to it.",
        },
      },
      actions: {
        save: "Save Bike",
        saveChanges: "Save Changes",
        deleteBike: "Delete Bike",
        editNotes: "Edit note",
        saveNotes: "Save note",
        startFitForBike: "Start fitting session",
      },
      errors: {
        nameRequired: "Bike name is required.",
        typeRequired: "Bike type is required.",
        saveFailed: "Could not save bike. Please try again.",
        deleteFailed: "Could not delete bike. Please try again.",
      },
      marktplaatsImport: {
        entryCta: "Import from Marktplaats",
        title: "Import a bike from Marktplaats",
        description:
          "Paste one Marktplaats advert URL, review the parsed draft, and save the bike only after you confirm the details.",
        entryTitle: "Paste a Marktplaats advert URL",
        entryDescription:
          "The advert is parsed on the server. You review and edit the bike draft before anything is created in your garage.",
        previewTitle: "Review imported draft",
        previewDescription:
          "Check the parsed fields, adjust any uncertain values, and decide which photos to keep before saving.",
        findingsTitle: "What we found in this advert",
        findingsDescription:
          "This is the structured draft we could recover from the advert. Review anything that looks uncertain before saving.",
        findingsCount: "{count} findings",
        findingDescriptionSummary: "Imported description available ({characters} characters).",
        findingPhotoSummary: "{count} advert photos found.",
        findingLabels: {
          name: "Bike name",
          brand: "Brand",
          model: "Model",
          bikeType: "Bike type",
          size: "Size mention",
          components: "Components",
          condition: "Condition",
          maintenance: "Maintenance",
        },
        photosTitle: "Imported photos",
        photosDescription:
          "Select the advert photos you want to keep with this bike. Saving without photos is allowed.",
        photoVerificationTitle: "Photo verification",
        photoCountSummary: "{selected} of {total} selected",
        primaryPhotoTitle: "Primary preview image",
        primaryPhotoDescription:
          "Use the thumbnail strip to inspect the advert photos. The selected primary image is saved first.",
        photoActiveBadge: "Active preview",
        photoPreviewBadge: "View photo",
        photosEmptyTitle: "No importable photos found",
        photosEmptyDescription:
          "This advert did not expose reusable photos. You can still save the bike draft and add photos later.",
        photoFallbackLabel: "Advert photo",
        photoSelected: "Selected for import",
        photoDeselected: "Not selected",
        photoBadgeSelected: "Selected",
        photoBadgeOptional: "Optional",
        nameHint:
          "The bike name is fully editable. It does not have to match the advert title.",
        warningsTitle: "Needs review",
        confidenceBadge: "{level} confidence",
        warningMessages: {
          limited_description:
            "The advert description is short, so some details may still be missing.",
          no_images_found:
            "No reusable advert photos were found in this advert.",
          missing_advert_title:
            "The advert title could not be recovered cleanly.",
          brand_needs_review: "Brand needs review.",
          model_needs_review: "Model needs review.",
          bike_type_needs_review: "Bike type needs review.",
          no_size_mention_found:
            "No clear frame-size mention was detected in the advert text.",
          already_imported:
            "This advert was already imported before for this rider.",
          one_photo_only:
            "Only one advert photo is available, so double-check that it shows the right bike.",
          no_photos_selected:
            "No photos are currently selected. Saving without photos is still allowed.",
          partial_photo_selection:
            "Only the selected photos will be imported with this bike.",
        },
        success: "Bike draft created from Marktplaats.",
        loading: {
          preview: "Parsing Marktplaats advert...",
        },
        actions: {
          preview: "Preview import",
          previewLoading: "Loading preview...",
          save: "Save bike draft",
          saveLoading: "Saving bike...",
          cancel: "Back to garage",
          startOver: "Start over",
        },
        fields: {
          url: {
            label: "Marktplaats URL",
            placeholder: "https://www.marktplaats.nl/...",
          },
          name: {
            label: "Bike name",
            placeholder: "Choose the rider-facing bike name",
          },
          brand: {
            label: "Brand",
            placeholder: "Confirm the brand",
          },
          model: {
            label: "Model",
            placeholder: "Confirm the model",
          },
          bikeType: {
            label: "Bike type",
          },
          description: {
            label: "Description",
            placeholder: "Imported advert text appears here and stays editable.",
          },
        },
        errors: {
          title: "Import needs attention",
          unsupportedUrl:
            "Use a valid Marktplaats advert URL. Unsupported marketplace links are not accepted.",
          previewFailed:
            "The advert preview could not be loaded. Please check the URL or try again in a moment.",
          saveFailed:
            "The bike draft could not be saved. Please try again.",
          saveInProgress:
            "This bike import is still being finalized. Please wait a moment and try again.",
          backendUnavailable:
            "The Marktplaats import backend is not available in this workspace yet. The rider flow is wired, but preview/save cannot complete until the backend contract lands.",
        },
      },
      createChooser: {
        title: "How would you like to add this bike?",
        description:
          "Choose the path that matches the information you already have. You can always edit the bike later.",
        manual: {
          title: "Create bike manually",
          description:
            "Start from scratch and enter the bike details, geometry, and setup yourself.",
          cta: "Start manual bike",
        },
        marktplaats: {
          title: "Import from Marktplaats",
          description:
            "Paste one advert URL, review what we found, and save only after you confirm the draft.",
          cta: "Open Marktplaats import",
        },
        passport: {
          title: "Use bike-passport ID",
          description:
            "Paste a bike-passport ID from another rider and create your own editable copy in seconds.",
          cta: "Use bike-passport ID",
        },
      },
      passportImport: {
        entryCta: "Use bike-passport ID",
        title: "Import a bike with a bike-passport ID",
        description:
          "Paste a shared bike-passport ID, preview the bike details, and create your own editable copy.",
        entryTitle: "Paste a bike-passport ID",
        entryDescription:
          "A bike-passport ID is safe to share. It lets you import a fresh copy of another rider's bike without taking ownership of the original.",
        previewTitle: "Preview your imported copy",
        previewDescription:
          "Review the shared bike details before you create your own version in the garage.",
        previewBikeLabel: "Shared source bike",
        emptyBrandModel: "Brand and model were not shared.",
        noDescription: "No shared description was included with this bike.",
        confirmationTitle: "What happens next",
        confirmationDescription:
          "Creating this bike adds a new bike to your garage under your account. You can edit it freely, and the original rider's bike stays unchanged.",
        photoCopied: "This preview includes the main shared bike photo when available.",
        photoNotCopied: "This bike may import without photos in this first release.",
        photoMissing: "No shared bike photo is available for this passport preview.",
        copyCard: {
          eyebrow: "Rider-safe sharing",
          title: "Bike-passport IDs create personal copies",
          description:
            "This import path is designed for reuse, not shared ownership. You get your own version of the bike from the start.",
          ownCopy: "You create your own editable copy in your garage.",
          sourceUnaffected: "Changes you make never affect the original rider's bike.",
          shareableId: "The passport ID is the only thing the other rider has to share.",
        },
        summary: {
          type: "Bike type",
          photos: "Shared photos",
          photoCount: "{count} photos available",
          frameSize: "Frame size",
          geometry: "Geometry",
          geometryValue: "Stack {stack} / Reach {reach}",
          geometryMissing: "No shared geometry values",
        },
        loading: {
          preview: "Loading bike-passport preview...",
          hint: "This usually takes a few seconds. If it does not load quickly, try again.",
        },
        actions: {
          preview: "Preview bike",
          previewLoading: "Loading preview...",
          import: "Create my editable copy",
          importLoading: "Creating bike...",
          startOver: "Use another passport ID",
          back: "Back to bike options",
        },
        fields: {
          passportId: {
            label: "Bike-passport ID",
            placeholder: "BBF-AB12-CD34",
            helper:
              "Paste the bike-passport exactly as it was shared with you. Letters and numbers are accepted.",
          },
        },
        errors: {
          title: "Bike-passport import needs attention",
          invalidPassport:
            "Use a valid bike-passport ID. Letters, numbers, and hyphens only.",
          notFound:
            "We could not find a bike for that bike-passport ID. Check the ID and try again.",
          alreadyOwned:
            "This bike-passport already belongs to one of your bikes, so there is nothing new to import.",
          previewFailed:
            "The bike-passport preview could not be loaded right now. Please try again.",
          saveFailed:
            "Your editable bike copy could not be created. Please try again.",
          backendUnavailable:
            "The bike-passport backend is not available in this workspace yet. The rider flow is ready, but preview and import need the backend contract to finish.",
        },
        success: "{bikeName} is now in your bike garage.",
      },
      delete: {
        confirm: "Delete this bike? This action cannot be undone.",
        title: "Delete bike?",
        description:
          "This removes the bike and its direct wheelset, tire setup, and pressure setup data. If the bike already has fitting history, deletion will be blocked.",
        confirmButton: "Delete bike",
      },
      sections: {
        basics: "Bike Basics",
        geometry: "Current Geometry (Optional)",
        setup: "Current Setup (Optional)",
        notes: "Notes (Optional)",
      },
      fields: {
        name: {
          label: "Bike Name",
          tooltip:
            "A label for this bike (e.g., Canyon Endurace 2023). Helps you track multiple fits.",
          placeholder: "e.g. Canyon Endurace",
        },
        type: {
          label: "Bike Type",
          tooltip:
            "Select the exact type of bike you're fitting. This changes posture targets and safety limits.",
          placeholder: "Choose bike type",
          staticLabel: "Bike Type:",
        },
        discipline: {
          label: "Discipline",
          options: {
            road: "Road bike",
            gravel: "Gravel bike",
            mtb: "MTB",
            tt: "TT / Triathlon",
          },
        },
        brand: {
          label: "Brand",
          placeholder: "e.g. Trek, Canyon, Giant",
        },
        model: {
          label: "Model",
          placeholder: "e.g. Endurace CF 7",
        },
        geometryLink: {
          title: "Link bike geometry",
          description:
            "Select your bike from the geometry library step by step: brand, model, year, and size. If your bike is not listed, you can still save your own brand and model.",
          loadingBrands: "Loading standard brands...",
          loadingModels: "Loading models for the selected brand...",
          noBrands:
            "No standard brands with geometry are available yet. You can still save your bike with your own brand and model.",
          selectBrandFirst:
            "Start with a standard brand to connect this bike to stored geometry data.",
          selectModelFirst:
            "Select the model that matches your bike. Only models for the selected brand are shown.",
          noModels:
            "No standard models are available for this brand yet. You can still save the bike without a geometry-library match.",
          selectionSummary: "Selected standard bike identity",
          selectionSummaryEmpty:
            "No standard geometry-library path selected yet.",
          linkedTitle: "Linked geometry record kept",
          linkedDescription:
            "This bike is currently linked to a reference geometry record. Starting a custom fallback clears that linked record for this save.",
          standardBrand: {
            label: "Standard brand",
            placeholder: "Choose a brand",
            helper:
              "Start with the bike brand from the geometry library. This unlocks the matching model list.",
          },
          standardModel: {
            label: "Standard model",
            placeholder: "Choose a model",
            helper:
              "Choose the model that matches your bike for the selected brand.",
          },
          year: {
            label: "Model year",
            placeholder: "Choose a year",
            helper:
              "Select the year only when multiple model-year variants exist in the library.",
            unknownOptionLabel: "Year not specified ({count})",
          },
          size: {
            label: "Frame size",
            placeholder: "Choose a size",
            helper:
              "Choose the frame size that matches your bike. As soon as you select it, the exact geometry preview appears below.",
          },
          preview: {
            title: "Linked geometry preview",
            description:
              "This bike will link to the reference geometry for {brand} {model} in size {size}.",
            year: "Year",
            size: "Frame size",
            stack: "Stack",
            reach: "Reach",
            seatTubeAngle: "Seat tube angle",
            headTubeAngle: "Head tube angle",
            unavailable: "Unavailable",
          },
          customBrandAction: "My bike is not in the list",
          customModelAction: "My model is not listed",
          customExplanation:
            "Custom brand and model values are saved only on your bike. They do not change the shared geometry library.",
        },
        bikeWeightKg: {
          label: "Bike weight (kg)",
          placeholder: "Approx. 8",
        },
        photoUrl: {
          label: "Photo URL",
          placeholder: "https://...",
        },
        notes: {
          label: "My Notes",
          placeholder:
            "Add personal notes about this bike, setup changes, or ride observations...",
          helper: "Up to 500 characters.",
        },
        geometry: {
          stack: {
            label: "Stack (mm)",
            tooltip:
              "Vertical distance from BB center to top of head tube (mm). Found on the manufacturer geometry chart; determines handlebar height potential.",
          },
          reach: {
            label: "Reach (mm)",
            tooltip:
              "Horizontal distance from BB center to top of head tube (mm). Found on the manufacturer geometry chart; determines cockpit length baseline.",
          },
          seatTubeAngle: {
            label: "Seat Tube Angle (deg)",
            tooltip:
              "Angle of the seat tube (degrees). Use the manufacturer spec. Affects how far forward/back your saddle sits for the same saddle height.",
          },
          headTubeAngle: {
            label: "Head Tube Angle (deg)",
            tooltip:
              "Angle of the head tube (degrees). Use the manufacturer spec. Influences steering stability and trail.",
          },
          frameSize: {
            label: "Frame Size",
            tooltip:
              "Enter the size label used by the brand (e.g., 54, 56, M, L). If unsure, use stack/reach instead for best accuracy.",
            placeholder: "e.g. 54",
          },
        },
        setup: {
          saddleHeight: {
            label: "Saddle Height (mm)",
            tooltip:
              "Measure from BB center to top of saddle along the seat tube line (mm). Use for comparing current vs. recommended fit.",
          },
          saddleSetback: {
            label: "Saddle Setback (mm)",
            tooltip:
              "Measure horizontal distance from BB center to saddle nose (mm). Positive values mean the saddle nose is behind the BB.",
          },
          stemLength: {
            label: "Stem Length (mm)",
            tooltip:
              "Length printed on the stem (mm), center-to-center. Used to compare your current cockpit with recommendations.",
          },
          stemAngle: {
            label: "Stem Angle (deg)",
            tooltip:
              "Angle printed on the stem (degrees). Affects handlebar height; note that flipping the stem changes the sign.",
          },
          handlebarWidth: {
            label: "Handlebar Width (mm)",
            tooltip:
              "Width measured center-to-center at the hoods (mm). Typically matches shoulder width for comfort and control.",
          },
          crankLength: {
            label: "Crank Length (mm)",
            tooltip:
              "Length printed on the crank arm (mm). Used to adjust saddle height and hip/knee angles.",
          },
        },
      },
    },
    pressure: {
      form: {
        bodyWeightLabel: "Body weight (kg)",
        bikeWeightLabel: "Bike weight (optional)",
        ridingGoalLabel: "Goal",
        ridingGoalSpeed: "Speed",
        ridingGoalBalance: "Balance",
        ridingGoalComfort: "Comfort",
        tubeTypeInnerTube: "Inner tube",
        tubeTypeLatex: "Latex tube",
        tubeTypeTubeless: "Tubeless",
      },
      result: {
        front: "Front",
        rear: "Rear",
        bar: "bar",
        psi: "PSI",
        explanation: "Explanation",
        warningsTitle: "Warnings",
        disclaimer: "Always follow the manufacturer's maximum pressure limits.",
        warningMessages: {
          max_rim_pressure_exceeded:
            "Recommended pressure exceeds the tyre or rim maximum.",
          hookless_limit_exceeded:
            "Hookless rim: maximum pressure limit exceeded. Check specifications.",
          pressure_too_low_for_setup:
            "Pressure may be too low for this setup. Verify casing support and terrain.",
          front_rear_pressure_mismatch:
            "Large difference between front and rear pressure. Check your inputs.",
          inner_tube_pinch_flat_risk:
            "Low pressure with inner tube: risk of pinch flat.",
          road_tire_width_unusual:
            "Unusual tyre width for a road bike. Please verify.",
          gravel_tire_width_unusual:
            "Unusual tyre width for a gravel bike.",
          mtb_tire_width_unusual:
            "MTB tyres are typically at least 45 mm wide.",
          hookless_max_pressure_unknown:
            "Hookless rim: maximum pressure unknown. Stay at or below 3.5 bar unless otherwise stated.",
        },
        comfortScore: "Comfort",
        gripScore: "Grip",
        efficiencyScore: "Efficiency",
      },
      bikeCard: {
        front: "Front",
        rear: "Rear",
        noCalculation: "No pressure calculated",
        newCalculation: "Calculate pressure",
        lastCalculated: "Last calculated",
      },
      bikeDetail: {
        sectionTitle: "Tyre pressure",
        activeWheelset: "Active wheelset",
        activeTireSetup: "Active tyre setup",
        noWheelset: "No wheelset saved",
        noTireSetup: "No tyre setup",
        recommendedPressure: "Recommended pressure",
        currentPressure: "Current pressure",
        noCalculation: "No pressure calculated for this bike yet.",
        profiles: "Saved presets",
        manageWheelsets: "Manage wheelsets",
        calculatePressure: "Calculate pressure",
      },
      overview: {
        title: "Latest pressure per bike",
        subtitle: "Review your latest recommendation, capture notes, and start a recalculation from the same page.",
        description:
          "Your latest tyre-pressure recommendation stays visible here for every bike, so you can compare setups without opening the wizard first.",
        startNew: "Start new calculation",
        frontPressure: "Front pressure",
        rearPressure: "Rear pressure",
        lastCalculated: "Last calculated",
        recalculate: "Recalculate",
        noCalculation: "No calculation yet for this bike. Start one to save a recommendation.",
        noCalculationCta: "Get recommendation",
        noBikesTitle: "No bikes saved yet",
        noBikesDescription:
          "Add a bike first to attach tyre-pressure recommendations to a real setup.",
        noBikesCta: "Add bike",
        autoNoteWeightChange: "Based on updated weight of {weight} kg.",
        userNotes: {
          label: "Ride notes",
          placeholder: "What did you notice on the road or trail?",
          helper: "Use notes for rider feedback, terrain observations, or setup reminders. Max 300 characters.",
          empty: "No rider notes yet.",
          editButton: "Edit note",
          saveButton: "Save note",
        },
      },
      status: {
        optimal: "On target",
        slightly_high: "Slightly high",
        too_high: "Too high",
        too_low: "Too low",
        no_measurement: "No measurement",
      },
      wizard: {
        title: "Calculate tyre pressure",
        stepLabels: {
          bike: "Bike",
          wheelsetTires: "Wheelset & tyres",
          weightGoal: "Weight & goal",
          route: "Route",
          result: "Result",
        },
        stepOf: "Step {current} of {total}",
        back: "Back",
        next: "Next",
        selectBike: "Select a bike",
        noBikes: "No bikes saved yet.",
        addBikeLink: "Add a bike",
        continueWithoutBike: "Continue without saved bike",
        selectWheelset: "Select a wheelset or tyre setup",
        manualInput: "Enter manually",
        extraLuggageLabel: "Extra luggage (kg)",
        currentFrontLabel: "Current front pressure (bar, optional)",
        currentRearLabel: "Current rear pressure (bar, optional)",
        wetLabel: "Weather",
        wet: "Wet",
        dry: "Dry",
        surfaceLabel: "Surface",
        distanceLabel: "Route distance (km)",
        elevationLabel: "Elevation (m)",
        offRoadLabel: "Off-road %",
        saveCalculation: "Save calculation",
        saveAsPreset: "Save as preset",
        presetName: "Preset name",
        presetUseCase: "Preset use case",
        presetDefaultName: "Race setup",
        selectWheelsetFirst: "Select a wheelset or enter tyres manually first.",
        calculationSaved: "Calculation saved!",
        presetSaved: "Preset saved!",
        newCalculation: "New calculation",
        goToMyBikes: "Go to my bikes",
        currentPressureSummary: "Current",
        recommendedPressureSummary: "Recommended",
        profileWeightMissing: "Your profile is missing body weight.",
        profileWeightCta: "Add weight",
        useCaseRace: "Race",
        useCaseEndurance: "Endurance",
        useCaseWetWeather: "Wet weather",
        useCaseGravelMixed: "Gravel mixed",
        useCaseComfort: "Comfort",
        useCaseCustom: "Custom",
        noPresets: "No saved presets yet.",
        bikeWeightRange: "Bike weight must be between 3 and 20 kg.",
        wheelsetNameRequired: "Wheelset name is required.",
        tireNameRequired: "Tyre setup name is required.",
        widthRange: "Tyre width must be between 18 and 80 mm.",
        maxPressureRange: "Max pressure must be between 3.5 and 10 bar.",
        bikeSaved: "Bike saved!",
        addWheelset: "Add wheelset",
        skipToBikes: "Skip and go to my bikes",
        wheelsetName: "Wheelset name",
        rimType: "Rim type",
        rimWidthFront: "Front internal rim width (mm)",
        rimWidthRear: "Rear internal rim width (mm)",
        tireSetupName: "Tyre setup name",
        tubeTypeLabel: "Tube type",
        widthFront: "Front tyre width (mm)",
        widthRear: "Rear tyre width (mm)",
        casingType: "Casing type",
        optional: "Optional",
        casingRace: "Race / Light",
        casingAllround: "Allround",
        casingReinforced: "Reinforced",
        maxPressure: "Max pressure (bar)",
        saveWheelset: "Save wheelset and tyres",
        skipToDone: "Skip for now",
        completedTitle: "Done! Your bike is saved.",
        calculatePressure: "Calculate tyre pressure",
      },
    },
    errors: {
      generic: {
        title: "Something went wrong",
        description:
          "We encountered an error while loading this page. Please try again.",
        errorIdLabel: "Error ID:",
        retry: "Try Again",
        goDashboard: "Go to Dashboard",
      },
    },
  },
  errors: {
    notFoundTitle: "Page not found",
    backHome: "Go Home",
  },
};

export default en;
