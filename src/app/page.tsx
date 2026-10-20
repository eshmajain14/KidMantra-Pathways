'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentService, getAvailableActivities, preserveQueryParams, handleExit } from '@/mantra';
import { resolveLessonView } from '@/views/viewResolver';
import DeveloperLessonsPage from '@/views/DeveloperLessonsPage';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { registerAllActivities } from '@/registry/registerAllActivities';

function AppRoot() {
  const getPath = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const paramTask =
        searchParams.get('task') ||
        searchParams.get('lesson_id') ||
        searchParams.get('lessonId') ||
        searchParams.get('lesson') ||
        searchParams.get('activity') ||
        searchParams.get('activityId') ||
        searchParams.get('id');

      if (paramTask) {
        const cleanTask = paramTask.startsWith('/') ? paramTask : `/task/${paramTask}`;
        return cleanTask.split('?')[0];
      }

      // Check hash
      if (window.location.hash) {
        const rawHash = window.location.hash.replace(/^#\/?/, '');
        if (rawHash) {
          const pathOnly = rawHash.split('?')[0];
          const cleanPath = pathOnly.startsWith('task/')
            ? `/${pathOnly}`
            : pathOnly.startsWith('/')
            ? pathOnly
            : `/task/${pathOnly}`;
          if (cleanPath.startsWith('/task/') || cleanPath.length > 1) {
            return cleanPath;
          }
        }
      }

      const pathname = window.location.pathname;
      if (pathname && pathname !== '/' && pathname.startsWith('/task/')) {
        return pathname;
      }
    }

    return '/';
  };

  const [currentPath, setCurrentPath] = useState(getPath());
  const [currentService, setCurrentService] = useState('speech');
  const [activitiesList, setActivitiesList] = useState<any[]>([]);

  useEffect(() => {
    registerAllActivities();
    setCurrentService(getCurrentService());
    setActivitiesList(getAvailableActivities());

    // Clean mock / dummy user query parameters from the address bar if present
    if (typeof window !== 'undefined' && window.location) {
      const searchParams = new URLSearchParams(window.location.search || '');
      let hasMockUser = false;
      ['uid', 'user_id', 'userId', 'encrypted_user_id'].forEach((key) => {
        const val = searchParams.get(key);
        if (
          val &&
          (val.includes('mock') ||
            val.includes('@') ||
            val === 'user_demo_01' ||
            val === 'ketan.gulati@mantra.care')
        ) {
          searchParams.delete(key);
          hasMockUser = true;
        }
      });
      if (hasMockUser) {
        const newSearch = searchParams.toString();
        const cleanedUrl = newSearch
          ? `${window.location.pathname}?${newSearch}`
          : window.location.pathname;
        window.history.replaceState({}, '', cleanedUrl);
      }
    }

    const handlePopState = () => {
      setCurrentPath(getPath());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (newPath: string) => {
    let finalPath = newPath || '/';
    const preservedPath = preserveQueryParams(finalPath);
    window.history.pushState({}, '', preservedPath);
    setCurrentPath(finalPath.split('?')[0]);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
      handleExit();
      return;
    }
    navigate('/');
  };

  const renderView = () => {
    if (currentPath === '/' || currentPath === '/dashboard') {
      return <DeveloperLessonsPage onNavigate={navigate} />;
    }

    const resolved = resolveLessonView({
      currentPath,
      currentService,
      onBack: handleBack,
      onNavigate: navigate,
      activities: activitiesList
    });

    if (resolved) {
      return resolved;
    }

    return <DeveloperLessonsPage onNavigate={navigate} />;
  };

  return (
    <DashboardThemeProvider>
      {renderView()}
    </DashboardThemeProvider>
  );
}

export default function Home() {
  return <AppRoot />;
}
