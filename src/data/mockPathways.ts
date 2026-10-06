import { Pathway } from '@/types/domain';

export const MOCK_PATHWAYS: Pathway[] = [
  {
    pathway_id: 'pathway_early_language_v1',
    pathway_version_id: '1.0.0',
    title: 'Early Language & Receptive Word Exploration',
    description: 'A playful early language development pathway for toddlers and young children targeting receptive vocabulary, functional choice making, and multi-word combinations.',
    service: 'speech_therapy',
    metadata: {
      created_at: '2026-10-01T12:00:00Z',
      updated_at: '2026-10-01T12:00:00Z',
      author: 'MantraCare Early Intervention Board',
      tags: ['Early Language', 'Vocabulary', 'Functional Communication', 'Receptive Words'],
      icon_name: 'Sparkles'
    },
    target_user: {
      age_range: '2-6 years',
      target_diagnoses: ['Late Talker', 'Early Language Delay', 'Receptive-Expressive Delay'],
      prerequisite_skills: ['Auditory Attention', 'Visual Matching'],
      sensory_accommodations: ['Audio Prompts', 'Visual Object Playground']
    },
    goal: {
      clinical_goal_statement: 'Increase functional communication choices and 2-word phrase combinations across daily play routines.',
      metric_targets: {
        receptive_accuracy: 80,
        completed_days_target: 5
      },
      expected_outcomes: [
        'Enhanced receptive word identification for everyday objects',
        'Increased self-initiated functional request phrases',
        'Spontaneous 2-word phrase combination during play'
      ]
    },
    stages: [
      {
        stage_id: 'stage_early_lang_day_01',
        day_number: 1,
        stage_order: 1,
        title: 'Day 1: Words, Choices & Combinations',
        description: 'Guided 10-step early language playground experience moving from listen, find, choose, name, combine, to functional communication.',
        activities: [
          {
            activity_id: 'act_speech_language_01',
            activity_version_id: '1.0.0',
            title: 'Early Language Development Playground',
            description: '10-stage interactive early language journey.',
            duration_seconds: 200,
            target_skill: 'Receptive & Expressive Language',
            interaction_type: 'visual_choice',
            required_passing_score: 70
          }
        ]
      },
      {
        stage_id: 'stage_day_01_clarity',
        day_number: 2,
        stage_order: 2,
        title: 'Day 2: Speech Sound Clarity Journey',
        description: 'Guided continuous journey focusing on sound hearing, notice, isolated say, word, sound position, phrase, voice recording, and self-review.',
        activities: [
          {
            activity_id: 'act_speech_clarity_01',
            activity_version_id: '1.0.0',
            title: 'Speech Clarity & Articulation Journey',
            description: '9-step continuous guided practice journey for target sound /r/.',
            duration_seconds: 240,
            target_skill: 'Speech Clarity & Articulation',
            interaction_type: 'vocal_speech',
            required_passing_score: 70
          }
        ]
      }
    ]
  },

  {
    pathway_id: 'pathway_speech_articulation_v1',
    pathway_version_id: '1.0.0',
    title: 'Speech Clarity & Articulation Foundation',
    description: 'A structured, evidence-based speech pathway for children aged 5–12 targeting phonological articulation, sound discrimination, and carrier phrase speech clarity.',
    service: 'speech_therapy',
    metadata: {
      created_at: '2026-10-01T12:00:00Z',
      updated_at: '2026-10-01T12:00:00Z',
      author: 'MantraCare Clinical Speech Board',
      tags: ['Articulation', 'Phonology', 'Vocal Resonance', 'Speech Clarity'],
      icon_name: 'Mic'
    },
    target_user: {
      age_range: '5-12 years',
      target_diagnoses: ['Articulation Disorder', 'Speech Sound Delay', 'Dysarthria'],
      prerequisite_skills: ['Auditory Attention', 'Single-Syllable Vocalization'],
      sensory_accommodations: ['Audio Prompts', 'Visual Mouth Placement Cards']
    },
    goal: {
      clinical_goal_statement: 'Improve phoneme production accuracy in initial and final word positions to over 80% across 5 consecutive practice sessions.',
      metric_targets: {
        target_clarity_score: 80,
        completed_days_target: 7
      },
      expected_outcomes: [
        'Enhanced phonemic awareness of target /r/ and /s/ sounds',
        'Increased vocal hold duration for subglottic breath support',
        'Consistent carrier phrase speech clarity in daily communication'
      ]
    },
    stages: [
      {
        stage_id: 'stage_day_01_clarity_alt',
        day_number: 1,
        stage_order: 1,
        title: 'Day 1: Speech Clarity & Sound Discrimination',
        description: 'Guided continuous journey focusing on sound hearing, notice, isolated say, word, sound position, phrase, voice recording, and self-review.',
        activities: [
          {
            activity_id: 'act_speech_clarity_01',
            activity_version_id: '1.0.0',
            title: 'Speech Clarity & Articulation Journey',
            description: '9-step continuous guided practice journey for target sound /r/.',
            duration_seconds: 240,
            target_skill: 'Speech Clarity & Articulation',
            interaction_type: 'vocal_speech',
            required_passing_score: 70
          }
        ]
      },
      {
        stage_id: 'stage_day_02_sustained',
        day_number: 2,
        stage_order: 2,
        title: 'Day 2: Vocal Hold & Breath Support',
        description: 'Sustain target vowel sounds to build vocal breath control and subglottic air flow pressure.',
        activities: [
          {
            activity_id: 'act_speech_tone_01',
            activity_version_id: '1.0.0',
            title: 'Sustained Vocal Pitch & Vowel Hold',
            description: 'Hold steady vocal pitch for target vowel AH.',
            duration_seconds: 120,
            target_skill: 'Vocal Breath & Pitch Stability',
            interaction_type: 'vocal_speech',
            required_passing_score: 75
          }
        ]
      }
    ]
  },

  {
    pathway_id: 'pathway_ot_fine_motor_v1',
    pathway_version_id: '1.0.0',
    title: 'Pediatric Fine Motor & Tactile Integration',
    description: 'Occupational therapy pathway designed to enhance hand-eye coordination, distal dexterity, and fine motor path tracing.',
    service: 'occupational_therapy',
    metadata: {
      created_at: '2026-10-01T12:00:00Z',
      updated_at: '2026-10-01T12:00:00Z',
      author: 'MantraCare Pediatric OT Board',
      tags: ['Fine Motor', 'Tracing', 'Hand-Eye Coordination', 'Dexterity'],
      icon_name: 'PenTool'
    },
    target_user: {
      age_range: '3-10 years',
      target_diagnoses: ['Developmental Coordination Disorder (DCD)', 'Fine Motor Delay'],
      prerequisite_skills: ['Pincer Grip', 'Visual Tracking'],
      sensory_accommodations: ['High Contrast Guide Paths', 'Touch Scaling']
    },
    goal: {
      clinical_goal_statement: 'Achieve >75% spatial tracing precision on curved and wave motor paths without boundary overshoot.',
      metric_targets: {
        precision_score: 75
      },
      expected_outcomes: [
        'Improved pencil control and handwriting grip stability',
        'Reduced spatial tremor and motor overshoot'
      ]
    },
    stages: [
      {
        stage_id: 'stage_ot_day_01',
        day_number: 1,
        stage_order: 1,
        title: 'Day 1: Wave & Line Precision Tracing',
        description: 'Interactive canvas tracing along smooth wave guide paths.',
        activities: [
          {
            activity_id: 'act_ot_motor_trace_01',
            activity_version_id: '1.0.0',
            title: 'Fine Motor Precision Path Tracing',
            description: 'Trace guide paths with touch or mouse to build fine motor control.',
            duration_seconds: 180,
            target_skill: 'Fine Motor Precision',
            interaction_type: 'fine_motor_trace',
            required_passing_score: 70
          }
        ]
      }
    ]
  },

  {
    pathway_id: 'pathway_aba_emotions_v1',
    pathway_version_id: '1.0.0',
    title: 'Social Communication & Emotion Mastery',
    description: 'ABA and special needs pathway building facial expression identification and prompt independence.',
    service: 'aba_special_needs',
    metadata: {
      created_at: '2026-10-01T12:00:00Z',
      updated_at: '2026-10-01T12:00:00Z',
      author: 'MantraCare ABA Clinical Board',
      tags: ['ABA', 'Social Skills', 'Emotion Recognition', 'Prompt Hierarchy'],
      icon_name: 'HeartHandshake'
    },
    target_user: {
      age_range: '4-14 years',
      target_diagnoses: ['Autism Spectrum Disorder (ASD)', 'Social Communication Disorder'],
      prerequisite_skills: ['Visual Matching', 'Audio Receptive Identification'],
      sensory_accommodations: ['Audio Cue Prompts', 'Visual Fading Hints']
    },
    goal: {
      clinical_goal_statement: 'Identify core emotional expressions independently without visual prompt assistance across 4 consecutive sessions.',
      metric_targets: {
        prompt_independence_rate: 85
      },
      expected_outcomes: [
        'Recognize core emotions (Happy, Calm, Excited, Sad) in socio-communicative settings',
        'Reduced prompt dependency during learning trials'
      ]
    },
    stages: [
      {
        stage_id: 'stage_aba_day_01',
        day_number: 1,
        stage_order: 1,
        title: 'Day 1: Facial Emotion Cue Matching',
        description: 'Discrete trial matching with least-to-most prompt hierarchy assistance.',
        activities: [
          {
            activity_id: 'act_aba_emotion_match_01',
            activity_version_id: '1.0.0',
            title: 'Visual Emotion Cue & Social Prompting',
            description: 'Match facial emotion cards using structured prompt hierarchy hints.',
            duration_seconds: 150,
            target_skill: 'Emotion Recognition',
            interaction_type: 'visual_choice',
            required_passing_score: 75
          }
        ]
      }
    ]
  }
];
