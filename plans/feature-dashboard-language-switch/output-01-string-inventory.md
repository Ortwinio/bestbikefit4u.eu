# Step 01 Output - Dashboard String Inventory

## Scope Audited
- `src/app/(dashboard)/**`
- `src/components/layout/DashboardSidebar.tsx`
- `src/components/auth/UserMenu.tsx`
- `src/components/questionnaire/**`
- `src/components/bikes/BikeForm.tsx` (included because dashboard bike pages render this component)

## Existing Locale-Aware Behavior (Already Present)
1. Route locale extraction and prefixing is broadly implemented:
- `extractLocaleFromPathname(...)` and `withLocalePrefix(...)` are used across dashboard pages and shell.
- Dashboard internal navigation generally keeps locale in links and redirects.

2. Sidebar route matching already handles prefixed routes:
- `stripLocalePrefix(...)` is used in `src/components/layout/DashboardSidebar.tsx`.

3. Partial inline locale branching exists (not centralized):
- `locale === "nl" ? ... : ...` is used in `src/app/(dashboard)/layout.tsx` for mobile labels.
- `UserMenu` uses a local `menuLabels` object instead of central i18n catalog.

4. Gap identified:
- No dashboard-level `LanguageSwitch` in authenticated shell.
- Most dashboard copy is still hardcoded English text.

## String Inventory

### 1) Navigation & Shell

#### `src/app/(dashboard)/layout.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| loading | `Loading dashboard...` | `dashboard.layout.loading` |
| a11y | `Close dashboard menu` | `dashboard.layout.mobileMenu.closeAria` |
| a11y | `Open dashboard menu` | `dashboard.layout.mobileMenu.openAria` |
| a11y | `Close dashboard menu overlay` | `dashboard.layout.mobileMenu.overlayCloseAria` |
| section label | `Dashboard` | `dashboard.layout.sections.dashboard` |
| nav label | `Dashboard` | `dashboard.nav.dashboard` |
| nav label | `New Fit Session` / `Nieuwe fit-sessie` | `dashboard.nav.newFitSession` |
| nav label | `My Bikes` / `Mijn fietsen` | `dashboard.nav.myBikes` |
| nav label | `Profile` / `Profiel` | `dashboard.nav.profile` |
| section label | `Website` | `dashboard.layout.sections.website` |
| nav label | `Home` | `dashboard.layout.website.home` |
| nav label | `How It Works` / `Hoe het werkt` | `dashboard.layout.website.howItWorks` |
| nav label | `Pricing` / `Prijzen` | `dashboard.layout.website.pricing` |

#### `src/components/layout/DashboardSidebar.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| nav label | `Dashboard` | `dashboard.nav.dashboard` |
| nav label | `New Fit Session` | `dashboard.nav.newFitSession` |
| nav label | `My Bikes` | `dashboard.nav.myBikes` |
| nav label | `Profile` | `dashboard.nav.profile` |
| section label | `Website` | `dashboard.layout.sections.website` |
| nav label | `Home` | `dashboard.layout.website.home` |
| nav label | `How It Works` | `dashboard.layout.website.howItWorks` |
| nav label | `Pricing` | `dashboard.layout.website.pricing` |
| fallback user | `User` | `dashboard.userMenu.fallbackUserName` |
| action | `Sign out` | `dashboard.common.signOut` |

#### `src/components/auth/UserMenu.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| menu label | `Dashboard` | `dashboard.userMenu.dashboard` |
| menu label | `New Fit Session` / `Nieuwe fit-sessie` | `dashboard.userMenu.newFitSession` |
| menu label | `My Bikes` / `Mijn fietsen` | `dashboard.userMenu.myBikes` |
| menu label | `Profile Settings` / `Profielinstellingen` | `dashboard.userMenu.profileSettings` |
| menu label | `Sign Out` / `Uitloggen` | `dashboard.common.signOut` |
| fallback user | `User` | `dashboard.userMenu.fallbackUserName` |

### 2) Dashboard Home Page

#### `src/app/(dashboard)/dashboard/page.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| status label | `Completed` | `dashboard.sessions.status.completed` |
| status label | `In Progress` | `dashboard.sessions.status.inProgress` |
| status label | `Processing` | `dashboard.sessions.status.processing` |
| status label | `Archived` | `dashboard.sessions.status.archived` |
| riding style label | `Recreational` | `dashboard.sessions.ridingStyle.recreational` |
| riding style label | `Fitness` | `dashboard.sessions.ridingStyle.fitness` |
| riding style label | `Sportive` | `dashboard.sessions.ridingStyle.sportive` |
| riding style label | `Racing` | `dashboard.sessions.ridingStyle.racing` |
| riding style label | `Commuting` | `dashboard.sessions.ridingStyle.commuting` |
| riding style label | `Touring` | `dashboard.sessions.ridingStyle.touring` |
| page title | `Dashboard` | `dashboard.home.title` |
| CTA | `New Fit Session` | `dashboard.home.newFitCta` |
| warning title | `Complete your profile to get started` | `dashboard.home.profileWarning.title` |
| warning description | `Enter your body measurements to enable bike fit calculations.` | `dashboard.home.profileWarning.description` |
| CTA | `Complete Profile` | `dashboard.home.profileWarning.cta` |
| stat label | `Total Sessions` | `dashboard.home.stats.totalSessions` |
| stat label | `Completed Fits` | `dashboard.home.stats.completedFits` |
| stat label | `Last Fit Date` | `dashboard.home.stats.lastFitDate` |
| section title | `Recent Fit Sessions` | `dashboard.home.recentSessions.title` |
| loading | `Loading sessions...` | `dashboard.home.recentSessions.loading` |
| empty title | `No fit sessions yet` | `dashboard.home.recentSessions.emptyTitle` |
| empty description | `You haven't started any fit sessions yet.` | `dashboard.home.recentSessions.emptyDescription` |
| empty CTA | `Start Your First Fit` | `dashboard.home.recentSessions.emptyCta` |
| action | `View Results` | `dashboard.home.recentSessions.actions.viewResults` |
| action | `Continue` | `dashboard.home.recentSessions.actions.continue` |
| action | `View` | `dashboard.home.recentSessions.actions.view` |
| suffix | `Fit` | `dashboard.home.recentSessions.fitSuffix` |

### 3) Fit Start Flow

#### `src/app/(dashboard)/fit/page.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| option label | `Recreational`, `Fitness`, `Sportive`, `Racing`, `Commuting`, `Touring` | `dashboard.fit.ridingStyles.*.label` |
| option description | style descriptions | `dashboard.fit.ridingStyles.*.description` |
| option label | `Comfort`, `Balanced`, `Performance`, `Aero` | `dashboard.fit.goals.*.label` |
| option description | goal descriptions | `dashboard.fit.goals.*.description` |
| loading | `Loading fit setup...` | `dashboard.fit.loading` |
| page title | `Start New Fit Session` | `dashboard.fit.title` |
| subtitle | `Choose your bike and riding goals to get personalized setup recommendations.` | `dashboard.fit.subtitle` |
| warning title | `Complete your profile first` | `dashboard.fit.profileWarning.title` |
| warning description | `You need to enter your body measurements before starting a fit session.` | `dashboard.fit.profileWarning.description` |
| CTA | `Go to Profile` | `dashboard.fit.profileWarning.cta` |
| loading helper | `Loading saved bikes...` | `dashboard.fit.savedBikes.loading` |
| section title | `Select a saved bike (optional)` | `dashboard.fit.savedBikes.title` |
| action | `Use custom bike type` | `dashboard.fit.savedBikes.useCustomType` |
| section title | `What type of bike?` | `dashboard.fit.sections.bikeType` |
| helper | `Using saved bike ...` | `dashboard.fit.savedBikes.usingBike` |
| section title | `How do you typically ride?` | `dashboard.fit.sections.ridingStyle` |
| section title | `What's your primary goal?` | `dashboard.fit.sections.primaryGoal` |
| CTA | `Continue to Questions` | `dashboard.fit.continueCta` |
| error title | `Couldn't start fit session` | `dashboard.fit.errors.startFailedTitle` |
| helper | `Complete your profile to continue` | `dashboard.fit.profileRequirementHint` |

### 4) Questionnaire Page + Shared Questionnaire Components

#### `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| loading | `Loading questionnaire...` | `dashboard.questionnaire.loading` |
| empty title | `Session not found` | `dashboard.questionnaire.sessionNotFound.title` |
| empty description | `The fit session you're looking for doesn't exist or has been archived.` | `dashboard.questionnaire.sessionNotFound.description` |
| empty CTA | `Start New Session` | `dashboard.questionnaire.sessionNotFound.cta` |
| nav action | `Back` | `dashboard.common.back` |
| page title | `Tell Us About Your Riding` | `dashboard.questionnaire.title` |
| subtitle | `Answer these questions to help us personalize your bike fit recommendations.` | `dashboard.questionnaire.subtitle` |

#### `src/components/questionnaire/QuestionnaireContainer.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| parser marker | `Missing required responses:` | `dashboard.questionnaire.errors.missingRequiredMarker` |
| loading | `Loading questionnaire...` | `dashboard.questionnaire.loading` |
| empty title | `No questionnaire items available` | `dashboard.questionnaire.emptyTitle` |
| empty description | `Try again in a moment.` | `dashboard.questionnaire.emptyDescription` |
| validation header | `Required questions still need an answer:` | `dashboard.questionnaire.missingRequired.header` |
| button | `Previous` | `dashboard.questionnaire.actions.previous` |
| button | `Skip` | `dashboard.questionnaire.actions.skip` |
| button | `Complete` | `dashboard.questionnaire.actions.complete` |
| button | `Next` | `dashboard.questionnaire.actions.next` |
| error title | `We couldn't complete this step` | `dashboard.questionnaire.errors.completeStepTitle` |
| progress text | `Question {x} of {y}` | `dashboard.questionnaire.progress.questionOf` |

#### `src/components/questionnaire/ProgressBar.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| label | `Progress` | `dashboard.questionnaire.progress.label` |
| label | `~{minutes} min left` | `dashboard.questionnaire.progress.minutesLeft` |
| label | `{percent}% complete` | `dashboard.questionnaire.progress.percentComplete` |

#### `src/components/questionnaire/questions/SingleChoice.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| a11y legend | `Choose one option` | `dashboard.questionnaire.a11y.singleChoiceLegend` |

#### `src/components/questionnaire/questions/MultipleChoice.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| legend | `Select all that apply` | `dashboard.questionnaire.multiChoice.legend` |

#### `src/components/questionnaire/questions/NumericQuestion.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| field label | `Your numeric answer` | `dashboard.questionnaire.numeric.label` |
| tooltip | `Enter a number only (no units)...` | `dashboard.questionnaire.numeric.tooltip` |
| error | `Please enter a valid number` | `dashboard.questionnaire.numeric.errors.invalidNumber` |
| error | `Value must be at least ...` | `dashboard.questionnaire.numeric.errors.min` |
| error | `Value must be at most ...` | `dashboard.questionnaire.numeric.errors.max` |
| placeholder | `Enter a number ...` | `dashboard.questionnaire.numeric.placeholder` |
| helper | `Range: ...` | `dashboard.questionnaire.numeric.range` |

#### `src/components/questionnaire/questions/TextQuestion.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| field label | `Your written answer` | `dashboard.questionnaire.text.label` |
| tooltip | `Write a short, specific answer...` | `dashboard.questionnaire.text.tooltip` |
| placeholder | `Type your answer here...` | `dashboard.questionnaire.text.placeholder` |

### 5) Results Page

#### `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| error message | `Failed to generate PDF report.` | `dashboard.results.errors.pdfGenerateFailed` |
| loading | `Loading fit results...` | `dashboard.results.loading` |
| empty title | `Session not found` | `dashboard.results.sessionNotFound.title` |
| empty description | `The fit session you're looking for doesn't exist.` | `dashboard.results.sessionNotFound.description` |
| empty CTA | `Go to Dashboard` | `dashboard.results.sessionNotFound.cta` |
| empty title | `Questionnaire not completed` | `dashboard.results.questionnaireIncomplete.title` |
| empty description | `Complete your questionnaire first...` | `dashboard.results.questionnaireIncomplete.description` |
| empty CTA | `Continue Questionnaire` | `dashboard.results.questionnaireIncomplete.cta` |
| page title | `Calculating Your Fit` | `dashboard.results.processing.title` |
| page description | `We're analyzing your measurements...` | `dashboard.results.processing.description` |
| action | `Retry Generation` | `dashboard.results.processing.retryCta` |
| action | `Generate Now` | `dashboard.results.processing.generateNowCta` |
| dialog title | `Email sent` | `dashboard.results.emailDialog.sentTitle` |
| dialog title | `Email report` | `dashboard.results.emailDialog.title` |
| dialog description | `Check your inbox for your bike fit report.` | `dashboard.results.emailDialog.sentDescription` |
| dialog description | `Send your bike fit recommendations...` | `dashboard.results.emailDialog.description` |
| input label | `Email address` | `dashboard.results.emailDialog.emailLabel` |
| input tooltip | `Enter the email address where you want to receive this report.` | `dashboard.results.emailDialog.emailTooltip` |
| input placeholder | `you@example.com` | `dashboard.results.emailDialog.emailPlaceholder` |
| error title | `Failed to send report` | `dashboard.results.emailDialog.errors.sendTitle` |
| action | `Cancel` | `dashboard.common.cancel` |
| action | `Send Report` | `dashboard.results.emailDialog.sendCta` |
| nav action | `Back to Dashboard` | `dashboard.results.backToDashboard` |
| title | `Your Bike Fit Recommendations` | `dashboard.results.title` |
| description | `Based on your measurements and riding preferences...` | `dashboard.results.subtitle` |
| label | `Algorithm version:` | `dashboard.results.algorithmVersionLabel` |
| action | `Email Report` | `dashboard.results.actions.emailReport` |
| action | `Download PDF` | `dashboard.results.actions.downloadPdf` |
| action | `Start New Fit Session` | `dashboard.results.actions.startNewFit` |
| error title | `Failed to download PDF` | `dashboard.results.errors.downloadTitle` |

### 6) Profile Page

#### `src/app/(dashboard)/profile/page.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| page title | `Your Profile` | `dashboard.profile.title` |
| CTA | `Edit Measurements` | `dashboard.profile.actions.editMeasurements` |
| section title | `Body Measurements` | `dashboard.profile.sections.bodyMeasurements` |
| field label | `Height`, `Inseam`, `Torso`, `Arm Length`, `Shoulder Width`, `Femur Length` | `dashboard.profile.measurements.*` |
| section title | `Flexibility` | `dashboard.profile.sections.flexibility` |
| helper | `Hamstring flexibility score` | `dashboard.profile.flexibility.helper` |
| section title | `Core Stability` | `dashboard.profile.sections.coreStability` |
| helper | `Plank hold assessment` | `dashboard.profile.coreStability.helper` |
| section title | `Profile Status` | `dashboard.profile.status.title` |
| description | `Your profile is complete...` | `dashboard.profile.status.description` |
| CTA | `Start New Fit Session` | `dashboard.profile.status.startFitCta` |
| loading | `Loading profile...` | `dashboard.profile.loading` |
| title | `Edit Your Measurements` | `dashboard.profile.edit.title` |
| title | `Complete Your Profile` | `dashboard.profile.onboarding.title` |
| description | `Update your body measurements...` | `dashboard.profile.edit.description` |
| description | `Enter your body measurements...` | `dashboard.profile.onboarding.description` |
| error title | `Could not save profile` | `dashboard.profile.errors.saveFailedTitle` |
| action | `Cancel` | `dashboard.common.cancel` |

### 7) Bikes Pages + Shared Bike Form

#### `src/app/(dashboard)/bikes/page.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| confirm | `Delete "{bikeName}"? This action cannot be undone.` | `dashboard.bikes.delete.confirm` |
| alert | `Could not delete bike. Please try again.` | `dashboard.bikes.delete.failed` |
| loading | `Loading bikes...` | `dashboard.bikes.loading` |
| title | `My Bikes` | `dashboard.bikes.title` |
| subtitle | `Save your bikes to keep fit sessions tied to real setups.` | `dashboard.bikes.subtitle` |
| CTA | `Add Bike` | `dashboard.bikes.actions.addBike` |
| empty title | `No bikes added yet` | `dashboard.bikes.empty.title` |
| empty description | `Save your first bike to compare fit sessions over time.` | `dashboard.bikes.empty.description` |
| empty CTA | `Add Your First Bike` | `dashboard.bikes.empty.cta` |
| action | `Edit` | `dashboard.common.edit` |
| action | `Delete` | `dashboard.common.delete` |
| section title | `Geometry` | `dashboard.bikes.sections.geometry` |
| section title | `Current Setup` | `dashboard.bikes.sections.currentSetup` |
| inline labels | `Stack`, `Reach`, `STA`, `HTA`, `Frame size`, `Saddle`, `Setback`, `Stem`, `Bar`, `Crank` | `dashboard.bikes.fields.*` |

#### `src/app/(dashboard)/bikes/new/page.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| title | `Add New Bike` | `dashboard.bikeForm.new.title` |
| description | `Save your bike geometry and current setup for better fit comparisons.` | `dashboard.bikeForm.new.description` |
| submit | `Save Bike` | `dashboard.bikeForm.actions.save` |

#### `src/app/(dashboard)/bikes/[bikeId]/edit/page.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| loading | `Loading bike...` | `dashboard.bikeForm.edit.loading` |
| empty title | `Bike not found` | `dashboard.bikeForm.edit.notFound.title` |
| empty description | `This bike does not exist or you do not have access to it.` | `dashboard.bikeForm.edit.notFound.description` |
| title | `Edit Bike` | `dashboard.bikeForm.edit.title` |
| description | `Update bike details and current setup values.` | `dashboard.bikeForm.edit.description` |
| submit | `Save Changes` | `dashboard.bikeForm.actions.saveChanges` |

#### `src/components/bikes/BikeForm.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| validation | `Bike name is required.` | `dashboard.bikeForm.errors.nameRequired` |
| validation | `Bike type is required.` | `dashboard.bikeForm.errors.typeRequired` |
| error | `Could not save bike. Please try again.` | `dashboard.bikeForm.errors.saveFailed` |
| confirm | `Delete this bike? This action cannot be undone.` | `dashboard.bikeForm.delete.confirm` |
| error | `Could not delete bike. Please try again.` | `dashboard.bikeForm.errors.deleteFailed` |
| section title | `Bike Basics` | `dashboard.bikeForm.sections.basics` |
| section title | `Current Geometry (Optional)` | `dashboard.bikeForm.sections.geometry` |
| section title | `Current Setup (Optional)` | `dashboard.bikeForm.sections.setup` |
| field label | `Bike Name` | `dashboard.bikeForm.fields.name.label` |
| field tooltip | `A label for this bike...` | `dashboard.bikeForm.fields.name.tooltip` |
| field placeholder | `e.g. Canyon Endurace` | `dashboard.bikeForm.fields.name.placeholder` |
| field label | `Bike Type` | `dashboard.bikeForm.fields.type.label` |
| field tooltip | `Select the exact type of bike...` | `dashboard.bikeForm.fields.type.tooltip` |
| field placeholder | `Choose bike type` | `dashboard.bikeForm.fields.type.placeholder` |
| static label | `Bike Type:` | `dashboard.bikeForm.fields.type.staticLabel` |
| field labels | `Stack (mm)`, `Reach (mm)`, `Seat Tube Angle (deg)`, `Head Tube Angle (deg)`, `Frame Size` | `dashboard.bikeForm.fields.geometry.*.label` |
| field tooltips | geometry tooltips | `dashboard.bikeForm.fields.geometry.*.tooltip` |
| field placeholder | `e.g. 54` | `dashboard.bikeForm.fields.geometry.frameSize.placeholder` |
| field labels | `Saddle Height (mm)`, `Saddle Setback (mm)`, `Stem Length (mm)`, `Stem Angle (deg)`, `Handlebar Width (mm)`, `Crank Length (mm)` | `dashboard.bikeForm.fields.setup.*.label` |
| field tooltips | setup tooltips | `dashboard.bikeForm.fields.setup.*.tooltip` |
| action | `Cancel` | `dashboard.common.cancel` |
| action | `Delete Bike` | `dashboard.bikeForm.actions.deleteBike` |

### 8) Dashboard Error Boundary

#### `src/app/(dashboard)/error.tsx`
| Category | Hardcoded string | Proposed key |
|---|---|---|
| title | `Something went wrong` | `dashboard.errors.generic.title` |
| description | `We encountered an error while loading this page. Please try again.` | `dashboard.errors.generic.description` |
| label | `Error ID:` | `dashboard.errors.generic.errorIdLabel` |
| action | `Try Again` | `dashboard.errors.generic.retry` |
| action | `Go to Dashboard` | `dashboard.errors.generic.goDashboard` |

## Notes for Step 02
1. Centralize all proposed keys under `messages.{en,nl}.dashboard`.
2. Keep shared action keys under a reusable subtree (for example `dashboard.common.*`).
3. Replace file-local locale maps (`UserMenu`) and inline ternary locale strings (`layout.tsx`) with dictionary-driven labels.
