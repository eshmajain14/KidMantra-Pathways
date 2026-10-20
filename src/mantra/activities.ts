export interface Activity {
  lessonId: string;
  activityId: string;
  title: string;
  rewardPoints: number;
  estimatedDuration: string;
  route: string;
  services: string[];
  service?: string;
  problem?: string;
  problems?: string[];
  day?: number;
  description?: string;
  targetSkill?: string;
  interactionType?: string;
  completionEndpoint?: string;
  redirectAfterCompletion?: boolean;
}

export const activities: Activity[] = [
  // ==========================================
  // SPEECH THERAPY DOMAIN ACTIVITIES
  // ==========================================
  {
    lessonId: 'act_speech_language_01',
    activityId: 'act_speech_language_01',
    title: "Let's Explore Words!",
    rewardPoints: 25,
    estimatedDuration: '3-4 min',
    route: '/task/speech-early-language',
    services: ['speech'],
    service: 'speech',
    problem: 'early_language',
    problems: ['foundational', 'early_language'],
    day: 1,
    targetSkill: 'Receptive & Expressive Language',
    interactionType: 'visual_choice',
    description: 'A fun, step-by-step word adventure where your child listens, identifies everyday objects, and builds simple phrases.'
  },
  {
    lessonId: 'act_speech_clarity_01',
    activityId: 'act_speech_clarity_01',
    title: "Let's Practice the R Sound",
    rewardPoints: 30,
    estimatedDuration: '4 min',
    route: '/task/speech-clarity-journey',
    services: ['speech'],
    service: 'speech',
    problem: 'articulation',
    problems: ['foundational', 'articulation'],
    day: 2,
    targetSkill: 'Speech Sound Articulation & Auditory Discrimination',
    interactionType: 'vocal_speech',
    description: 'A guided journey to help your child listen to, recognize, and practice saying the /r/ sound clearly.'
  },
  {
    lessonId: 'act_speech_tone_01',
    activityId: 'act_speech_tone_01',
    title: 'Hold Your Voice Steady',
    rewardPoints: 20,
    estimatedDuration: '2 min',
    route: '/task/speech-vocal-tone',
    services: ['speech'],
    service: 'speech',
    problem: 'vocal_resonance',
    problems: ['vocal_resonance', 'breath_support'],
    day: 3,
    targetSkill: 'Vocal Breath & Pitch Stability',
    interactionType: 'vocal_speech',
    description: 'Encourages your child to hold a gentle, steady sound into the microphone to build breath control and voice strength.'
  },

  // ==========================================
  // OCCUPATIONAL THERAPY (OT) ACTIVITIES
  // ==========================================
  {
    lessonId: 'act_ot_motor_trace_01',
    activityId: 'act_ot_motor_trace_01',
    title: 'Follow the Wavy Line',
    rewardPoints: 25,
    estimatedDuration: '3 min',
    route: '/task/ot-fine-motor-trace',
    services: ['ot'],
    service: 'ot',
    problem: 'fine_motor',
    problems: ['foundational', 'fine_motor', 'handwriting_prep'],
    day: 1,
    targetSkill: 'Fine Motor Precision & Tracing',
    interactionType: 'fine_motor_trace',
    description: 'Helps your child build pencil control and hand-eye coordination by tracing a wavy line from start to finish.'
  },

  // ==========================================
  // APPLIED BEHAVIOR ANALYSIS (ABA) ACTIVITIES
  // ==========================================
  {
    lessonId: 'act_aba_emotion_match_01',
    activityId: 'act_aba_emotion_match_01',
    title: 'Match the Feelings',
    rewardPoints: 25,
    estimatedDuration: '2-3 min',
    route: '/task/aba-emotion-recognition',
    services: ['aba'],
    service: 'aba',
    problem: 'social_communication',
    problems: ['foundational', 'social_communication', 'emotion_mastery'],
    day: 1,
    targetSkill: 'Emotion Recognition & Social Cues',
    interactionType: 'visual_choice',
    description: 'A playful matching game that teaches your child to recognize everyday facial expressions and emotions.'
  }
];

export const getAvailableActivities = (): Activity[] => {
  return activities;
};
