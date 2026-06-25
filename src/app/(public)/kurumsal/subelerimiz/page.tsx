import { getBranches, getSettings } from '@/lib/data';
import SubelerClient from './SubelerClient';
import { Metadata } from 'next';

import { MetaGenerator } from '@/domains/seo-engine';

export async function generateMetadata(): Promise<Metadata> {
  return MetaGenerator.generate({ pageKey: 'kurumsal/subelerimiz' });
}

export default async function SubelerPage() {
  const branches = await getBranches();
  const settings = await getSettings();

  return <SubelerClient branches={branches} settings={settings} />;
}
