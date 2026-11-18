export const SITE_URL = 'https://web.kamen.in';
export const WHATSAPP_URL = 'https://wa.me/917021995833?text=Hey%20I%20want%20help%20for%20my%20business';
export const SOCIAL = {
  instagram: 'https://www.instagram.com/webkamen',
  facebook: 'https://www.facebook.com/profile.php?id=61576799994690',
};
export const SERVICES = {
  websites: 'Website',
  advertising: 'Advertising',
  'ai-agents': 'AI agent',
  multiple: 'Multiple services',
  exploring: 'Still exploring',
} as const;
export type ServiceKey = keyof typeof SERVICES;
export function isService(value: unknown): value is ServiceKey {
  return typeof value === 'string' && Object.hasOwn(SERVICES, value);
}
