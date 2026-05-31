import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Answers = {
  general?: Record<string, any>;
  stage?: 'pre' | 'post' | null;
  pre?: Record<string, any>;
  post?: Record<string, any>;
  // optional follow-ups stored per-section (general|pre|post)
  followUps?: {
    general?: Record<string, any>;
    pre?: Record<string, any>;
    post?: Record<string, any>;
  };
};

type OnboardingCtx = {
  answers: Answers;
  setGeneral: (k: string, v: any) => void;
  setPre: (k: string, v: any) => void;
  setPost: (k: string, v: any) => void;
  setFollowUp: (section: 'general' | 'pre' | 'post', k: string, v: any) => void;
  setStage: (s: 'pre' | 'post' | null) => void;
  clear: () => void;
  ready: boolean;
};

const KEY = '@scalpify:onboarding:v1';
const Ctx = createContext<OnboardingCtx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({ general: {}, stage: null, pre: {}, post: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setAnswers(JSON.parse(raw));
      } catch (e) {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    // autosave on change
    (async () => {
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(answers));
      } catch (e) {
        // ignore
      }
    })();
  }, [answers]);

  const setGeneral = (k: string, v: any) => setAnswers(a => ({ ...a, general: { ...(a.general || {}), [k]: v } }));
  const setPre = (k: string, v: any) => setAnswers(a => ({ ...a, pre: { ...(a.pre || {}), [k]: v } }));
  const setPost = (k: string, v: any) => setAnswers(a => ({ ...a, post: { ...(a.post || {}), [k]: v } }));
  const setFollowUp = (section: 'general' | 'pre' | 'post', k: string, v: any) =>
    setAnswers(a => ({
      ...a,
      followUps: {
        ...(a.followUps || {}),
        [section]: { ...((a.followUps || {})[section] || {}), [k]: v },
      },
    }));
  const setStage = (s: 'pre' | 'post' | null) => setAnswers(a => ({ ...a, stage: s }));
  const clear = () => setAnswers({ general: {}, stage: null, pre: {}, post: {}, followUps: {} });

  return (
    <Ctx.Provider value={{ answers, setGeneral, setPre, setPost, setFollowUp, setStage, clear, ready }}>
      {children}
    </Ctx.Provider>
  );
}

export function useOnboarding() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return c;
}
