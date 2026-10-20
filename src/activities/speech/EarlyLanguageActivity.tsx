'use client';

import React, { useState, useEffect } from 'react';
import { ActivityRendererProps, RegisteredActivityDefinition } from '@/registry/types';
import { Activity, ActivitySubmission, ValidationResult, ActivityArtifact } from '@/types/domain';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Award,
  ThumbsUp,
  Smile,
  Heart,
  RotateCcw
} from 'lucide-react';

export interface EarlyLanguageConfig {
  target_objects: Array<{
    id: string;
    name: string;
    emoji: string;
    sound_cue: string;
    action_prompt: string;
    color_bg: string;
  }>;
  enable_caregiver_modeling: boolean;
}

const DEFAULT_LANGUAGE_CONFIG: EarlyLanguageConfig = {
  target_objects: [
    { id: 'ball', name: 'Ball', emoji: '⚽', sound_cue: 'Bounce bounce! A round ball for rolling.', action_prompt: 'Which one rolls and bounces?', color_bg: 'bg-emerald-100 border-emerald-300 text-emerald-900' },
    { id: 'car', name: 'Car', emoji: '🚗', sound_cue: 'Vroom vroom! A fast car that drives.', action_prompt: 'Which one goes vroom vroom?', color_bg: 'bg-pink-100 border-pink-300 text-pink-900' },
    { id: 'apple', name: 'Apple', emoji: '🍎', sound_cue: 'Yum yum! A sweet crunchy apple to eat.', action_prompt: 'Which one is delicious food to eat?', color_bg: 'bg-rose-100 border-rose-300 text-rose-900' },
    { id: 'dog', name: 'Dog', emoji: '🐶', sound_cue: 'Woof woof! A happy, friendly puppy dog.', action_prompt: 'Which one says woof woof?', color_bg: 'bg-amber-100 border-amber-300 text-amber-900' },
    { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', sound_cue: 'Hug hug! A soft fluffy teddy bear for snuggling.', action_prompt: 'Which one gives big soft hugs?', color_bg: 'bg-purple-100 border-purple-300 text-purple-900' }
  ],
  enable_caregiver_modeling: true
};

type LanguageStepKey =
  | 'EXPLORE'
  | 'RECEPTIVE_BALL'
  | 'ACTION_CAR'
  | 'SOUND_DOG'
  | 'REQUEST_CHOICE'
  | 'NAME_REPEAT'
  | 'COMBINE_TWO_WORDS'
  | 'SOCIAL_REQUEST'
  | 'REVIEW'
  | 'CELEBRATE';

interface StepDefinition {
  key: LanguageStepKey;
  stepNumber: number;
  badge: string;
  title: string;
  instruction: string;
  targetId?: string;
}

const STEPS: StepDefinition[] = [
  {
    key: 'EXPLORE',
    stepNumber: 1,
    badge: 'Step 1 • Discovery',
    title: 'Touch & Listen',
    instruction: 'Tap any object on the discovery table to hear its name and sound!'
  },
  {
    key: 'RECEPTIVE_BALL',
    stepNumber: 2,
    badge: 'Step 2 • Receptive Listening',
    title: 'Listen & Find the Ball',
    instruction: 'Can you tap the Ball? ⚽',
    targetId: 'ball'
  },
  {
    key: 'ACTION_CAR',
    stepNumber: 3,
    badge: 'Step 3 • Action & Function',
    title: 'Which One Drives?',
    instruction: 'Which one goes "Vroom vroom" and drives on the road? 🚗',
    targetId: 'car'
  },
  {
    key: 'SOUND_DOG',
    stepNumber: 4,
    badge: 'Step 4 • Animal Sound Cue',
    title: 'Find the Pet',
    instruction: 'Which one says "Woof woof"? 🐶',
    targetId: 'dog'
  },
  {
    key: 'REQUEST_CHOICE',
    stepNumber: 5,
    badge: 'Step 5 • Making Choices',
    title: 'What Do You Want to Play With?',
    instruction: 'Tap the object you want most right now!'
  },
  {
    key: 'NAME_REPEAT',
    stepNumber: 6,
    badge: 'Step 6 • Expressive Naming',
    title: 'Say It Together!',
    instruction: 'Tap to hear the word out loud, then repeat it together!'
  },
  {
    key: 'COMBINE_TWO_WORDS',
    stepNumber: 7,
    badge: 'Step 7 • 2-Word Combinations',
    title: 'Put Two Words Together',
    instruction: 'Tap a 2-word phrase to build longer sentences!'
  },
  {
    key: 'SOCIAL_REQUEST',
    stepNumber: 8,
    badge: 'Step 8 • Functional Communication',
    title: 'Ask with Words',
    instruction: 'Choose how to ask politely during play!'
  },
  {
    key: 'REVIEW',
    stepNumber: 9,
    badge: 'Step 9 • Check-In',
    title: 'How Was Word Play Today?',
    instruction: 'Select how much you enjoyed exploring words!'
  },
  {
    key: 'CELEBRATE',
    stepNumber: 10,
    badge: 'Step 10 • All Done!',
    title: 'Great Exploring Words!',
    instruction: "You finished today's word adventure. Well done!"
  }
];

export const EarlyLanguageActivityComponent: React.FC<ActivityRendererProps<EarlyLanguageConfig>> = ({
  activity,
  config = DEFAULT_LANGUAGE_CONFIG,
  onInteraction,
  onSubmit,
  onBackStep,
  onStepChange,
  isSubmitting
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STEPS[currentStepIndex];

  // Notify container of step index changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex, STEPS.length);
    }
  }, [currentStepIndex, onStepChange]);

  // Support external step back navigation triggered from header
  useEffect(() => {
    const handleHeaderBack = () => {
      if (currentStepIndex > 0) {
        setCurrentStepIndex((prev) => prev - 1);
      }
    };
    window.addEventListener('kidmantra_activity_step_back', handleHeaderBack);
    return () => {
      window.removeEventListener('kidmantra_activity_step_back', handleHeaderBack);
    };
  }, [currentStepIndex]);

  // State per step
  const [exploredIds, setExploredIds] = useState<string[]>([]);
  const [selectedFindId, setSelectedFindId] = useState<string | null>(null);
  const [understandChoice, setUnderstandChoice] = useState<string | null>(null);
  const [soundDogChoice, setSoundDogChoice] = useState<string | null>(null);
  const [chosenRequest, setChosenRequest] = useState<string | null>(null);
  const [namedObject, setNamedObject] = useState<string | null>(null);
  const [combinedPhrase, setCombinedPhrase] = useState<string | null>(null);
  const [socialPhrase, setSocialPhrase] = useState<string | null>(null);
  const [selfRating, setSelfRating] = useState<'great' | 'good' | 'fun' | null>(null);

  // Audio helper
  const playAudioCue = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Determine whether current step is complete to enable "Continue to Next Step"
  const isStepComplete = (): boolean => {
    switch (currentStep.key) {
      case 'EXPLORE':
        return exploredIds.length >= 1;
      case 'RECEPTIVE_BALL':
        return selectedFindId === 'ball';
      case 'ACTION_CAR':
        return understandChoice === 'car';
      case 'SOUND_DOG':
        return soundDogChoice === 'dog';
      case 'REQUEST_CHOICE':
        return chosenRequest !== null;
      case 'NAME_REPEAT':
        return namedObject !== null;
      case 'COMBINE_TWO_WORDS':
        return combinedPhrase !== null;
      case 'SOCIAL_REQUEST':
        return socialPhrase !== null;
      case 'REVIEW':
        return selfRating !== null;
      case 'CELEBRATE':
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (!isStepComplete()) return;
    if (currentStepIndex < STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      playAudioCue(STEPS[nextIdx].instruction);
      onInteraction({
        type: 'prompt_viewed',
        payload: { step: STEPS[nextIdx].key, index: nextIdx }
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleTryAgain = () => {
    setCurrentStepIndex(0);
    setExploredIds([]);
    setSelectedFindId(null);
    setUnderstandChoice(null);
    setSoundDogChoice(null);
    setChosenRequest(null);
    setNamedObject(null);
    setCombinedPhrase(null);
    setSocialPhrase(null);
    setSelfRating(null);
    onInteraction({
      type: 'prompt_viewed',
      payload: { step: 'EXPLORE', index: 0, action: 'try_again_reset' }
    });
  };

  const handleFinalSubmit = () => {
    onSubmit({
      explored_count: exploredIds.length,
      receptive_ball_correct: selectedFindId === 'ball',
      action_car_correct: understandChoice === 'car',
      sound_dog_correct: soundDogChoice === 'dog',
      chosen_request: chosenRequest,
      named_object: namedObject,
      combined_phrase: combinedPhrase,
      social_phrase: socialPhrase,
      self_rating: selfRating,
      completed_steps: currentStepIndex + 1
    });
  };

  return (
    <div className="bg-white border border-pink-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-5 md:p-6 shadow-sm text-slate-800 max-w-3xl w-full mx-auto space-y-3 sm:space-y-4">
      {/* Activity Top Header: Compact & Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-pink-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
              Early Language
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Receptive & Expressive</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{currentStep.title}</h3>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-pink-500" />
          <span>Step {currentStepIndex + 1} of {STEPS.length}</span>
        </div>
      </div>

      {/* Progress Indicator: Compact 10-segment Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-pink-600 font-bold">{currentStep.badge}</span>
          <span className="text-slate-400 font-normal">
            {Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% Complete
          </span>
        </div>

        <div className="grid grid-cols-10 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
          {STEPS.map((s, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={s.key}
                className={`h-1.5 sm:h-2 rounded-md transition-all ${
                  isCurrent
                    ? 'bg-pink-600 ring-2 ring-pink-200'
                    : isDone
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`}
                title={s.title}
              />
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage Area */}
      <div className="space-y-4 pt-1">
        {/* Instruction Banner with Audio Speaker */}
        <div className="bg-pink-50/70 border border-pink-100 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              type="button"
              onClick={() => playAudioCue(currentStep.instruction)}
              title="Hear Instruction Out Loud"
              className="p-2 bg-white rounded-lg border border-pink-200 text-pink-600 hover:bg-pink-50 transition cursor-pointer shrink-0 shadow-2xs"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug truncate sm:whitespace-normal">
              {currentStep.instruction}
            </p>
          </div>
        </div>

        {/* STEP 1: EXPLORE & DISCOVERY */}
        {currentStep.key === 'EXPLORE' && (
          <div className="space-y-4 text-center py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 max-w-2xl mx-auto">
              {config.target_objects.map((item) => {
                const isExplored = exploredIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (!exploredIds.includes(item.id)) {
                        setExploredIds((prev) => [...prev, item.id]);
                      }
                      playAudioCue(`${item.name}! ${item.sound_cue}`);
                      onInteraction({
                        type: 'choice_selected',
                        payload: { step: 'EXPLORE', object_id: item.id }
                      });
                    }}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer transform hover:scale-105 active:scale-95 ${
                      isExplored
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-800 truncate w-full">{item.name}</span>
                    {isExplored && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Heard
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {exploredIds.length === 0
                ? '👉 Tap any item above to listen to its sound and unlock the next step.'
                : `Great! You've listened to ${exploredIds.length} of ${config.target_objects.length} words.`}
            </p>
          </div>
        )}

        {/* STEP 2: RECEPTIVE LISTENING - BALL */}
        {currentStep.key === 'RECEPTIVE_BALL' && (
          <div className="space-y-4 text-center py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 max-w-2xl mx-auto">
              {config.target_objects.map((item) => {
                const isSelected = selectedFindId === item.id;
                const isCorrect = item.id === 'ball';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedFindId(item.id);
                      if (isCorrect) {
                        playAudioCue('Hooray! You found the Ball! Great listening!');
                      } else {
                        playAudioCue(`That is the ${item.name}. Let’s find the Ball!`);
                      }
                      onInteraction({
                        type: 'choice_selected',
                        payload: { step: 'RECEPTIVE_BALL', selected_id: item.id, is_correct: isCorrect }
                      });
                    }}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer transform hover:scale-105 ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200 scale-105 shadow-xs'
                          : 'bg-amber-100 border-amber-400 ring-2 ring-amber-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-800 truncate w-full">{item.name}</span>
                    {isSelected && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Correct!
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-amber-700" /> Try Again
                          </>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedFindId && (
              <div
                className={`p-3 rounded-2xl text-sm font-black max-w-md mx-auto ${
                  selectedFindId === 'ball'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                {selectedFindId === 'ball'
                  ? '🎉 Super listening! You found the Ball!'
                  : 'Almost! Listen again: "Can you tap the Ball?"'}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: ACTION - CAR */}
        {currentStep.key === 'ACTION_CAR' && (
          <div className="space-y-4 text-center py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 max-w-2xl mx-auto">
              {config.target_objects.map((item) => {
                const isSelected = understandChoice === item.id;
                const isCorrect = item.id === 'car';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setUnderstandChoice(item.id);
                      if (isCorrect) {
                        playAudioCue('Vroom vroom! Yes, the Car drives fast!');
                      } else {
                        playAudioCue(`The ${item.name} does not go vroom. Let’s find what drives!`);
                      }
                      onInteraction({
                        type: 'choice_selected',
                        payload: { step: 'ACTION_CAR', selected_id: item.id, is_correct: isCorrect }
                      });
                    }}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer transform hover:scale-105 ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200 scale-105 shadow-xs'
                          : 'bg-amber-100 border-amber-400 ring-2 ring-amber-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-800 truncate w-full">{item.name}</span>
                    {isSelected && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Vroom!
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-amber-700" /> Try Again
                          </>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {understandChoice && (
              <div
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black max-w-md mx-auto ${
                  understandChoice === 'car'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                {understandChoice === 'car'
                  ? '🚗 Vroom vroom! You found the Car!'
                  : 'Which one has wheels and drives? Tap the Car!'}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: SOUND - DOG */}
        {currentStep.key === 'SOUND_DOG' && (
          <div className="space-y-4 text-center py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 max-w-2xl mx-auto">
              {config.target_objects.map((item) => {
                const isSelected = soundDogChoice === item.id;
                const isCorrect = item.id === 'dog';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSoundDogChoice(item.id);
                      if (isCorrect) {
                        playAudioCue('Woof woof! The puppy dog says woof woof!');
                      } else {
                        playAudioCue(`A ${item.name} does not bark. Which one says woof woof?`);
                      }
                      onInteraction({
                        type: 'choice_selected',
                        payload: { step: 'SOUND_DOG', selected_id: item.id, is_correct: isCorrect }
                      });
                    }}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer transform hover:scale-105 ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200 scale-105 shadow-xs'
                          : 'bg-amber-100 border-amber-400 ring-2 ring-amber-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-800 truncate w-full">{item.name}</span>
                    {isSelected && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Woof!
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-amber-700" /> Try Again
                          </>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {soundDogChoice && (
              <div
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black max-w-md mx-auto ${
                  soundDogChoice === 'dog'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                {soundDogChoice === 'dog'
                  ? '🐶 Woof woof! You found the Dog!'
                  : 'Which cute friend barks? Tap the Dog!'}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: CHOICE REQUEST */}
        {currentStep.key === 'REQUEST_CHOICE' && (
          <div className="space-y-4 text-center py-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 max-w-2xl mx-auto">
              {config.target_objects.map((item) => {
                const isSelected = chosenRequest === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setChosenRequest(item.id);
                      playAudioCue(`I want the ${item.name} please!`);
                      onInteraction({
                        type: 'choice_selected',
                        payload: { step: 'REQUEST_CHOICE', choice_id: item.id }
                      });
                    }}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer transform hover:scale-105 ${
                      isSelected
                        ? 'bg-purple-100 border-purple-500 ring-2 ring-purple-200 scale-105 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-800 truncate w-full">{item.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-black bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-purple-700" /> Selected!
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {chosenRequest && (
              <div className="p-2.5 sm:p-3 bg-purple-50 border border-purple-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-purple-900 max-w-md mx-auto">
                Caregiver Model: &quot;I want the {config.target_objects.find((o) => o.id === chosenRequest)?.name} please!&quot; 🎈
              </div>
            )}
          </div>
        )}

        {/* STEP 6: NAME & REPEAT */}
        {currentStep.key === 'NAME_REPEAT' && (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 sm:p-6 bg-teal-50 border-2 border-teal-200 rounded-2xl sm:rounded-3xl max-w-md mx-auto space-y-3 sm:space-y-4">
              <span className="text-5xl sm:text-7xl block">⚽</span>
              <div className="text-2xl sm:text-3xl font-black text-teal-900">Ball</div>
              <p className="text-[11px] sm:text-xs text-teal-700 font-semibold">
                Tap the button to listen, then practice saying the word out loud together!
              </p>

              <button
                type="button"
                onClick={() => {
                  setNamedObject('ball');
                  playAudioCue('Ball! B-A-L-L, Ball!');
                  onInteraction({
                    type: 'choice_selected',
                    payload: { step: 'NAME_REPEAT', object_id: 'ball' }
                  });
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-md shadow-teal-200 transform hover:scale-105 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Hear &quot;Ball&quot; Spoken 🔊</span>
              </button>

              {namedObject && (
                <div className="text-xs font-black text-emerald-700 bg-emerald-100 p-2 rounded-xl flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Great job practicing saying &quot;Ball&quot;!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: COMBINE TWO WORDS */}
        {currentStep.key === 'COMBINE_TWO_WORDS' && (
          <div className="space-y-4 text-center py-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 max-w-2xl mx-auto">
              {[
                { phrase: 'Big Ball ⚽', label: 'Size + Object' },
                { phrase: 'Red Car 🚗', label: 'Color + Object' },
                { phrase: 'More Apple 🍎', label: 'Request + Object' }
              ].map((item) => {
                const isSelected = combinedPhrase === item.phrase;
                return (
                  <button
                    key={item.phrase}
                    onClick={() => {
                      setCombinedPhrase(item.phrase);
                      playAudioCue(item.phrase);
                      onInteraction({
                        type: 'choice_selected',
                        payload: { step: 'COMBINE_TWO_WORDS', phrase: item.phrase }
                      });
                    }}
                    className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1 sm:space-y-2 cursor-pointer transform hover:scale-105 ${
                      isSelected
                        ? 'bg-pink-100 border-pink-500 ring-2 ring-pink-200 scale-105 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="font-black text-base sm:text-xl text-slate-800">{item.phrase}</span>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-bold">{item.label}</span>
                    {isSelected && (
                      <span className="text-[10px] sm:text-xs font-black bg-pink-200 text-pink-900 px-2 py-0.5 rounded-full">
                        Selected!
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {combinedPhrase && (
              <div className="p-2.5 sm:p-3 bg-pink-50 border border-pink-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-pink-900 max-w-md mx-auto">
                Together: &quot;{combinedPhrase}&quot; 🌟
              </div>
            )}
          </div>
        )}

        {/* STEP 8: FUNCTIONAL SOCIAL REQUEST */}
        {currentStep.key === 'SOCIAL_REQUEST' && (
          <div className="space-y-4 text-center py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 max-w-xl mx-auto">
              {[
                { phrase: 'Give ball please! ⚽', desc: 'Polite Request' },
                { phrase: 'Play together please! 🎉', desc: 'Social Request' }
              ].map((item) => {
                const isSelected = socialPhrase === item.phrase;
                return (
                  <button
                    key={item.phrase}
                    onClick={() => {
                      setSocialPhrase(item.phrase);
                      playAudioCue(item.phrase);
                      onInteraction({
                        type: 'choice_selected',
                        payload: { step: 'SOCIAL_REQUEST', phrase: item.phrase }
                      });
                    }}
                    className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1 sm:space-y-2 cursor-pointer transform hover:scale-105 ${
                      isSelected
                        ? 'bg-emerald-100 border-emerald-500 ring-2 ring-emerald-200 scale-105 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="font-black text-sm sm:text-base text-slate-900">{item.phrase}</span>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-bold">{item.desc}</span>
                    {isSelected && (
                      <span className="text-[10px] sm:text-xs font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                        Selected!
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {socialPhrase && (
              <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-emerald-900 max-w-md mx-auto">
                Great asking: &quot;{socialPhrase}&quot;
              </div>
            )}
          </div>
        )}

        {/* STEP 9: REVIEW / RATING */}
        {currentStep.key === 'REVIEW' && (
          <div className="space-y-4 text-center py-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 max-w-xl mx-auto">
              {[
                { id: 'great', label: 'Super Fun! 🌟', icon: Star, color: 'bg-amber-100 border-amber-400 text-amber-950' },
                { id: 'good', label: 'Great Job! 👍', icon: ThumbsUp, color: 'bg-teal-100 border-teal-400 text-teal-950' },
                { id: 'fun', label: 'Loved It! 😊', icon: Smile, color: 'bg-pink-100 border-pink-400 text-pink-950' }
              ].map((item) => {
                const isSelected = selfRating === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelfRating(item.id as any);
                      playAudioCue(`Thank you! ${item.label}`);
                      onInteraction({
                        type: 'choice_selected',
                        payload: { step: 'REVIEW', rating: item.id }
                      });
                    }}
                    className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer transform hover:scale-105 ${
                      isSelected
                        ? `${item.color} ring-2 ring-pink-200 scale-105 shadow-sm`
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <IconComp className="w-7 h-7 sm:w-9 sm:h-9 text-slate-700" />
                    <span className="font-black text-xs sm:text-sm">{item.label}</span>
                    {isSelected && (
                      <span className="text-[10px] font-black bg-white/80 px-2 py-0.5 rounded-full">
                        Selected!
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 10: CELEBRATION & COMPLETION */}
        {currentStep.key === 'CELEBRATE' && (
          <div className="space-y-6 my-auto text-center py-4 sm:py-6">
            {/* Friendly celebration icon */}
            <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center mx-auto text-pink-600 shadow-sm border border-pink-200">
              <Sparkles className="w-10 h-10 animate-pulse text-pink-600" />
            </div>

            {/* Clean title and message */}
            <div className="space-y-2">
              <h4 className="text-2xl sm:text-3xl font-black text-slate-900">Great exploring words!</h4>
              <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto font-medium">
                You finished today&apos;s word adventure. Well done!
              </p>
            </div>

            {/* Activity Recap: Actual objects and interactions explored */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-lg mx-auto text-left space-y-3">
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Today&apos;s Adventure Recap</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Listened to words */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center space-x-2.5">
                  <span className="text-2xl">🎧</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Listened to Words</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {exploredIds.length > 0
                        ? `${exploredIds.length} objects explored`
                        : 'Ball, Car & Dog'}
                    </span>
                  </div>
                </div>

                {/* Found in activity */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center space-x-2.5">
                  <span className="text-2xl">⚽</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Found the Ball</span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {selectedFindId === 'ball' ? '✓ Identified ball' : 'Completed listening'}
                    </span>
                  </div>
                </div>

                {/* Action sound */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center space-x-2.5">
                  <span className="text-2xl">🚗</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Action Sound &quot;Vroom&quot;</span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {understandChoice === 'car' ? '✓ Identified car' : 'Completed sound cue'}
                    </span>
                  </div>
                </div>

                {/* Animal sound */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center space-x-2.5">
                  <span className="text-2xl">🐶</span>
                  <div>
                    <span className="font-bold text-slate-800 block">Animal Sound &quot;Woof&quot;</span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {soundDogChoice === 'dog' ? '✓ Identified puppy' : 'Completed animal cue'}
                    </span>
                  </div>
                </div>

                {/* 2-Word phrase if chosen */}
                {combinedPhrase && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center space-x-2.5 sm:col-span-2">
                    <span className="text-2xl">💬</span>
                    <div>
                      <span className="font-bold text-slate-800 block">Word Combination</span>
                      <span className="text-[11px] text-purple-700 font-bold">&quot;{combinedPhrase}&quot;</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Prominent Primary CTA + Optional Try Again */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-sm sm:text-base rounded-2xl transition shadow-lg shadow-pink-200 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Marking as completed...' : 'Mark as completed 🚀'}</span>
              </button>

              <button
                type="button"
                onClick={handleTryAgain}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Control Bar (Hidden on celebration screen) */}
        {currentStep.key !== 'CELEBRATE' && (
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-extrabold rounded-xl transition ${
                currentStepIndex > 0
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isStepComplete()}
              className={`flex items-center justify-center space-x-2 px-6 py-3 font-black text-xs sm:text-sm rounded-xl transition shadow-md ${
                isStepComplete()
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-pink-200 transform hover:scale-105 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const EarlyLanguageActivityDefinition: RegisteredActivityDefinition<EarlyLanguageConfig> = {
  activity: {
    activity_id: 'act_speech_language_01',
    activity_version_id: '1.0.0',
    title: "Let's Explore Words!",
    short_description: 'Playful guided experience supporting receptive and expressive early language behaviors through listen, find, choose, name, combine, and communicate.',
    service: 'speech_therapy',
    target_skill: 'Receptive & Expressive Language Development',
    target_age_range: '2-6 years',
    estimated_duration_sec: 200,
    instructions: [
      { step_number: 1, title: 'Touch & Listen', text: 'Tap objects on the discovery table to hear their names and sounds.' },
      { step_number: 2, title: 'Listen & Find', text: 'Find the requested ball.' },
      { step_number: 3, title: 'Action Cue', text: 'Identify the car by its action sound.' },
      { step_number: 4, title: 'Animal Cue', text: 'Find the dog by its barking sound.' },
      { step_number: 5, title: 'Choice Making', text: 'Make a preferred toy choice.' },
      { step_number: 6, title: 'Name Practice', text: 'Practice vocalizing the target word.' },
      { step_number: 7, title: '2-Word Phrases', text: 'Combine two words into phrases.' },
      { step_number: 8, title: 'Social Request', text: 'Practice polite play requests.' },
      { step_number: 9, title: 'Check-In', text: 'Rate your practice experience.' },
      { step_number: 10, title: 'Badge', text: 'Earn the Word Explorer badge.' }
    ],
    interaction_type: 'visual_choice',
    activity_config: DEFAULT_LANGUAGE_CONFIG,
    completion_criteria: {
      min_accuracy_percent: 70,
      min_required_interactions: 5,
      max_allowed_time_sec: 300,
      required_artifact_types: ['response_matrix']
    },
    accessibility_metadata: {
      screen_reader_prompt: 'Interactive early language playground with auditory speech synthesis and high-contrast visual choices.',
      supports_high_contrast: true,
      supports_audio_cues: true,
      supports_motor_scaling: true,
      alternative_input_modes: ['keyboard', 'switch_access', 'voice', 'large_target']
    },
    clinical_review_notes: {
      evidence_base: 'Naturalistic developmental behavioral interventions (NDBI) and receptive-expressive pairing for toddlers.',
      therapist_guidance: 'Encourage caregiver to model target words with exaggerated intonation.',
      observed_behaviors: ['Receptive pointing', 'Spontaneous word imitation', 'Phrase combining'],
      parent_support_tips: ['Repeat target object names naturally during daily play routines.']
    }
  },
  Component: EarlyLanguageActivityComponent,
  defaultConfig: DEFAULT_LANGUAGE_CONFIG,
  validateConfig: (config: unknown) => {
    const cfg = config as Partial<EarlyLanguageConfig>;
    if (!cfg || !cfg.target_objects || cfg.target_objects.length === 0) {
      return { valid: false, errors: ['target_objects array is required'] };
    }
    return { valid: true };
  },
  evaluate: async (
    submission: ActivitySubmission,
    config: EarlyLanguageConfig,
    activity: Activity<EarlyLanguageConfig>
  ): Promise<ValidationResult> => {
    const payload = submission.raw_payload;
    const isBallCorrect = !!payload.receptive_ball_correct;
    const isCarCorrect = !!payload.action_car_correct;
    const isDogCorrect = !!payload.sound_dog_correct;

    const totalQuestions = 3;
    let correctCount = 0;
    if (isBallCorrect) correctCount += 1;
    if (isCarCorrect) correctCount += 1;
    if (isDogCorrect) correctCount += 1;

    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = accuracy >= 60;
    const now = new Date().toISOString();

    const generatedArtifacts: ActivityArtifact[] = [
      {
        artifact_id: `art_lang_${Date.now()}`,
        attempt_id: submission.attempt_id,
        activity_id: submission.activity_id,
        type: 'response_matrix',
        title: 'Early Language Interaction Matrix',
        data_url_or_blob: 'data:application/json,' + encodeURIComponent(JSON.stringify(payload)),
        metadata: { accuracy, correctCount, totalQuestions },
        created_at: now
      }
    ];

    return {
      is_passed: isPassed,
      accuracy_score: accuracy,
      score_breakdown: {
        receptive_ball: isBallCorrect ? 33 : 0,
        action_car: isCarCorrect ? 33 : 0,
        sound_dog: isDogCorrect ? 34 : 0
      },
      feedback_message: isPassed
        ? 'Outstanding early language exploration! Excellent receptive listening and word identification.'
        : 'Good effort! Let’s keep practicing listening and identifying everyday words.',
      clinical_observations: [
        `Receptive ball discrimination: ${isBallCorrect ? 'Accurate' : 'Required prompting'}`,
        `Functional action recognition (car): ${isCarCorrect ? 'Accurate' : 'Required prompting'}`,
        `Auditory animal sound match (dog): ${isDogCorrect ? 'Accurate' : 'Required prompting'}`,
        `Phrase combination practiced: ${payload.combined_phrase || 'None'}`
      ],
      artifacts_generated: generatedArtifacts,
      evaluated_at: now
    };
  }
};
