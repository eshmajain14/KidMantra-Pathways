# KidMantra Pathways Architecture & Activity Creation Guide

This document defines the canonical architecture and conventions for **KidMantra Pathways**. It serves as the primary reference for developers and AI agents (such as Antigravity) to build, register, and integrate pediatric therapeutic activities without breaking existing contracts.

---

## 1. Reference Architecture & Project Standard

KidMantra Pathways aligns directly with the proven **User Pathways Desktop Dashboard** architecture:

- **Desktop Catalog Layout**: Fixed top navigation bar with service filter pills, two-column layout with left focus/condition sidebar and right search bar, day selector, and responsive activity card grid.
- **Routing Engine**: Central `viewResolver` pattern matching `/task/<lessonId>` routes and query parameters (`?task=...`, `?lesson_id=...`).
- **Activity Container**: Consistent full-screen experience with sticky top bar, breadcrumb navigation, domain badge, points indicator, and "Back to Dashboard" trigger.
- **Completion & Webhook Contract**: Unified integration with the Mantra Care Platform webhook at `https://api.mantracare.com/webhook/pathway`.
- **Branding**: Official KidMantra logo loaded via [MantraLogo](file:///c:/Users/Mantra/Desktop/Eshma%20-%20KidMantra/KidMantra-Pathways/src/components/common/MantraLogo.tsx) using `https://res.cloudinary.com/hxbamdqf/image/upload/v1792489668/kidmantra_logo_xjm847.png`.

---

## 2. Directory Structure

```
KidMantra-Pathways/src/
├── activities/                      # Reusable therapeutic activity components
│   ├── speech/                      # Speech therapy activities
│   ├── ot/                          # Occupational therapy activities
│   └── aba/                         # Applied behavior analysis activities
├── app/                             # Next.js App Router entry points
│   ├── layout.tsx                   # Root HTML layout and fonts
│   ├── page.tsx                     # Dynamic view routing via viewResolver
│   └── globals.css                  # Global styles & Tailwind
├── components/                      # Reusable UI primitives
│   ├── common/MantraLogo.tsx        # Official KidMantra logo
│   ├── ActivityContainer.tsx        # Canonical activity runner wrapper
│   └── ...
├── context/                         # State providers
│   ├── DashboardThemeContext.tsx    # Light/Dark mode state
│   └── TherapeuticContext.tsx       # Session attempt & clinical context
├── engine/                          # Therapeutic attempt & validation logic
│   └── TherapeuticEngine.ts
├── mantra/                          # Platform integrations & canonical catalog
│   ├── activities.ts                # Master Activity Catalog
│   ├── api.ts                       # Webhook trigger & completion logic
│   ├── config.ts                    # Platform endpoints & configuration
│   ├── navigation.ts                # Deep linking & exit handlers
│   ├── services.ts                  # Domain normalization (speech, ot, aba)
│   └── index.ts                     # Barrel export
├── registry/                        # Activity Registry & runtime definitions
│   ├── activityRegistry.ts          # Central singleton registry
│   ├── registerAllActivities.ts     # Activity registration bootstrapping
│   └── types.ts                     # Registry interfaces
└── views/                           # Pages & View Resolvers
    ├── DeveloperLessonsPage.tsx     # Desktop pathways dashboard
    └── viewResolver.tsx             # Route to view component resolver
```

---

## 3. Supported Clinical Service Domains

KidMantra supports 3 core pediatric therapeutic domains:

1. **`speech`** (`speech_therapy`): Articulation, early language, receptive vocabulary, vocal pitch & resonance, breath support.
2. **`ot`** (`occupational_therapy`): Fine motor precision, tactile integration, handwriting preparation, hand-eye coordination.
3. **`aba`** (`aba_special_needs`): Emotion recognition, discrete trial training, social communication, prompt hierarchy fading.

---

## 4. How to Create a New Activity in One Natural Language Prompt

When a user requests a new activity (e.g. *"Create a Speech activity that helps a child follow two-step instructions"*), follow these exact 4 steps:

### Step 1: Create the Activity Component & Definition
Create the activity file inside `src/activities/<domain>/<ActivityName>.tsx` (e.g. `src/activities/speech/TwoStepInstructionsActivity.tsx`).
- Define the configuration interface (e.g. `TwoStepInstructionsConfig`).
- Implement the interactive React component with child-friendly UI.
- Export the `RegisteredActivityDefinition` with stable `activity_id`, `service`, `instructions`, `completion_criteria`, and `evaluate` handler.

### Step 2: Register in Central Registry
Import and register the definition in [registerAllActivities.ts](file:///c:/Users/Mantra/Desktop/Eshma%20-%20KidMantra/KidMantra-Pathways/src/registry/registerAllActivities.ts):
```ts
import { TwoStepInstructionsActivityDefinition } from '@/activities/speech/TwoStepInstructionsActivity';
// ...
activityRegistry.register(TwoStepInstructionsActivityDefinition);
```

### Step 3: Add to Canonical Catalog
Add the activity metadata to `activities` array in [mantra/activities.ts](file:///c:/Users/Mantra/Desktop/Eshma%20-%20KidMantra/KidMantra-Pathways/src/mantra/activities.ts):
```ts
{
  lessonId: 'act_speech_two_step_01',
  activityId: 'act_speech_two_step_01',
  title: 'Two-Step Listening & Action Journey',
  rewardPoints: 25,
  estimatedDuration: '3 min',
  route: '/task/speech-two-step-instructions',
  services: ['speech'],
  service: 'speech',
  problem: 'early_language',
  problems: ['foundational', 'early_language'],
  day: 1,
  targetSkill: 'Receptive Auditory Processing',
  interactionType: 'visual_choice',
  description: 'Practice following sequential two-step auditory and visual commands in fun play scenarios.'
}
```

### Step 4: Register Route in `viewResolver.tsx`
In [views/viewResolver.tsx](file:///c:/Users/Mantra/Desktop/Eshma%20-%20KidMantra/KidMantra-Pathways/src/views/viewResolver.tsx):
- Wrap the activity with [ActivityContainer](file:///c:/Users/Mantra/Desktop/Eshma%20-%20KidMantra/KidMantra-Pathways/src/components/ActivityContainer.tsx).
- Call `completeLesson(activityId, domain, points)` on submission.
- Map the route to `ROUTE_VIEW_REGISTRY`:
```tsx
'/task/speech-two-step-instructions': TwoStepInstructionsPage,
'/task/act_speech_two_step_01': TwoStepInstructionsPage
```

---

## 5. Webhook & Completion Contract

When an activity completes, `completeLesson()` triggers:
1. Pathway webhook request to `https://api.mantracare.com/webhook/pathway` with payload:
   ```json
   {
     "intent": "complete_activity",
     "upa_id": 101112,
     "uid": "user_id_string"
   }
   ```
2. Records completion in `localStorage` under `activity_completed_<lessonId>`.
3. Awards reward points and fires `mantra_points_updated` event.
4. Returns user cleanly to the dashboard via `onBack()`.

---

## 6. Verification Checklist
- Run `npm run build` to verify zero TypeScript or Next.js build errors.
- Confirm activity shows in Desktop Dashboard with correct domain badge and points.
- Confirm clicking "Start Pathway" launches full activity with official logo and back navigation.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
