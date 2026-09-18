import { BankMaster } from '../types';

export function getDomainFromWebsite(url: string): string {
  if (!url) return '';
  return String(url)
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .split('?')[0]
    .trim();
}

export function getBankLogoChain(bank: BankMaster): string[] {
  const d = getDomainFromWebsite(bank.website);
  const chain: string[] = [];
  if (d) {
    chain.push(`https://logo.clearbit.com/${d}`);
    chain.push(`https://www.google.com/s2/favicons?domain=${d}&sz=128`);
    chain.push(`https://icons.duckduckgo.com/ip3/${d}.ico`);
  }
  return chain;
}
