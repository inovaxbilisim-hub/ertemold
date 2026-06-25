'use client';

import React from 'react';
import { HookRegistry } from '@/core/hooks/HookRegistry';
import { CONTENT_BEFORE_RENDER } from '@/core/hooks/hooks';

export default function HomeTemplateHooks({ settings, children }: { settings: any; children: React.ReactNode }) {
  React.useEffect(() => {
    HookRegistry.doAction(CONTENT_BEFORE_RENDER, { template: 'HomeTemplate', settings });
  }, [settings]);

  return <>{children}</>;
}
