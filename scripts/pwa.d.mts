import type { Plugin } from 'vite';
export function pwa(): Plugin;
export function serviceWorker(fichiers: string[], version: string): string;
