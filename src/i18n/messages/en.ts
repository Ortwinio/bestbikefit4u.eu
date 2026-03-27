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
    tools: "Tools",
    tirePressure: "Tire Pressure",
    login: "Log in",
    getStarted: "Get Started",
    footer: {
      product: "Product",
      support: "Support",
      legal: "Legal",
      resources: "Resources",
      sitemap: "Sitemap",
      contact: "Contact",
      faq: "FAQ",
      measurementGuide: "Measurement Guide",
      privacy: "Privacy",
      terms: "Terms",
      science: "Science",
      calculators: "Calculators",
      tirePressure: "Tire Pressure Calculator",
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
      heading: "Want to save this for your bike?",
      body:
        "Create a free account to save your ideal tyre pressure per bike, wheelset and surface.",
      primaryButton: "Create free account",
      secondaryButton: "Learn more",
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
      profile: "Profile",
      tirePressure: "Tire Pressure",
      settings: "Settings",
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
      newFit: "New fit",
      currentBikeTitle: "Current bike",
      viewBike: "View bike",
      noBikeTitle: "No bike saved yet",
      noBikeDescription: "Add a bike to attach pressure and fit context to a real setup.",
      pressureStale: "Recalculate recommended",
      pressureWarnings: "{count} warnings in your fit & pressure layer",
      viewAllFits: "View all",
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
      loading: "Loading fit setup...",
      title: "Start New Fit Session",
      subtitle: "Choose your bike and riding goals to get personalized setup recommendations.",
      profileWarning: {
        title: "Complete your profile first",
        description: "You need to enter your body measurements before starting a fit session.",
        cta: "Go to Profile",
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
        primaryGoal: "What's your primary goal?",
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
        title: "Tell us about your riding style",
        description:
          "This intake takes approximately 5–7 minutes to complete. Based on your answers, we create a personalized bike fit with precise measurements tailored to your body, riding style, and goals. We analyze how your body is loaded during cycling and translate this into an optimal position that balances comfort, efficiency, and performance. The result is a setup you can apply directly to your bike, helping you ride better, longer, and with more confidence.",
        gainTitle: "What you gain:",
        gains: [
          {
            label: "More speed and efficiency",
            detail: "Transfer more power into forward motion without increasing effort",
          },
          {
            label: "Greater comfort on longer rides",
            detail: "Reduce pressure on your back, neck, shoulders, and hands",
          },
          {
            label: "Lower risk of injuries",
            detail: "Minimize strain on knees, hips, and lower back",
          },
          {
            label: "A setup tailored to your body and goals",
            detail: "Based on your measurements, flexibility, and riding profile",
          },
          {
            label: "Actionable adjustments you can apply immediately",
            detail: "Including exact values for saddle height, setback, reach, and drop",
          },
        ],
        progress: {
          timeRemaining: "~7 minutes remaining",
          percentComplete: "10% complete",
        },
        illustrationAlt: "Cyclist illustration",
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
      errors: {
        pdfGenerateFailed: "Failed to generate PDF report.",
        downloadTitle: "Failed to download PDF",
      },
      reportV2: {
        introTitle: "Engine-powered fit report",
        introBody:
          "Use this report as a practical adjustment sequence. Change one variable at a time, validate on the bike, and keep notes after each ride.",
        sections: {
          profile: "Rider profile",
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
      title: "Your Profile",
      photo: {
        upload: "Upload photo",
        error: "Upload failed. Please try again.",
        fileTooLarge: "Use an image smaller than 5 MB.",
        invalidType: "Use JPG, PNG, or WEBP.",
      },
      actions: {
        editMeasurements: "Edit Measurements",
        editInline: "Edit",
      },
      sections: {
        bodyMeasurements: "Body Measurements",
        flexibility: "Flexibility",
        coreStability: "Core Stability",
      },
      measurements: {
        summary: "Your saved rider measurements",
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
        editAllButton: "Edit measurements",
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
        editButton: "Edit score",
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
      coreStability: {
        helper: "Plank hold assessment",
        editButton: "Re-test",
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
      sections: {
        geometry: "Geometry",
        currentSetup: "Current Setup",
        notes: "Notes",
        fittingHistory: "Fitting History",
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
