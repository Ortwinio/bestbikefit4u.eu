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
      edit: "Edit",
      delete: "Delete",
      signOut: "Sign out",
    },
    nav: {
      dashboard: "Dashboard",
      newFitSession: "New Fit Session",
      myBikes: "My Bikes",
      profile: "Profile",
      tirePressure: "Tire Pressure",
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
      myBikes: "My Bikes",
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
        loading: "Loading saved bikes...",
        title: "Select a saved bike (optional)",
        useCustomType: "Use custom bike type",
        usingBike: "Using saved bike",
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
    },
    profile: {
      loading: "Loading profile...",
      title: "Your Profile",
      actions: {
        editMeasurements: "Edit Measurements",
      },
      sections: {
        bodyMeasurements: "Body Measurements",
        flexibility: "Flexibility",
        coreStability: "Core Stability",
      },
      measurements: {
        height: "Height",
        inseam: "Inseam",
        torso: "Torso",
        armLength: "Arm Length",
        shoulderWidth: "Shoulder Width",
        femurLength: "Femur Length",
      },
      flexibility: {
        helper: "Hamstring flexibility score",
      },
      coreStability: {
        helper: "Plank hold assessment",
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
      dangerZone: {
        title: "Danger Zone",
        deleteAccount: "Delete Account",
        deleteConfirmTitle: "Delete your account?",
        deleteConfirmDescription:
          "This will permanently delete your profile, bikes, fit sessions, recommendations, and all other data. This action cannot be undone.",
        deleteConfirmCta: "Yes, delete my account",
        cancel: "Cancel",
        deleteFailed: "Could not delete account. Please try again.",
      },
    },
    bikes: {
      loading: "Loading bikes...",
      title: "My Bikes",
      subtitle: "Save your bikes to keep fit sessions tied to real setups.",
      actions: {
        addBike: "Add Bike",
      },
      empty: {
        title: "No bikes added yet",
        description: "Save your first bike to compare fit sessions over time.",
        cta: "Add Your First Bike",
      },
      delete: {
        confirm: 'Delete "{bikeName}"? This action cannot be undone.',
        failed: "Could not delete bike. Please try again.",
      },
      sections: {
        geometry: "Geometry",
        currentSetup: "Current Setup",
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
      },
      errors: {
        nameRequired: "Bike name is required.",
        typeRequired: "Bike type is required.",
        saveFailed: "Could not save bike. Please try again.",
        deleteFailed: "Could not delete bike. Please try again.",
      },
      delete: {
        confirm: "Delete this bike? This action cannot be undone.",
      },
      sections: {
        basics: "Bike Basics",
        geometry: "Current Geometry (Optional)",
        setup: "Current Setup (Optional)",
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
