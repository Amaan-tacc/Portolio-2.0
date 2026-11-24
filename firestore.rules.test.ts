export interface DirtyPayloadCase {
  id: number;
  name: string;
  targetPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedOutcome: 'PERMISSION_DENIED';
  payload: Record<string, unknown>;
}

export const DIRTY_DOZEN_PAYLOADS: DirtyPayloadCase[] = [
  {
    id: 1,
    name: 'Unauthenticated project create',
    targetPath: '/projects/test-proj',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { id: 'test-proj', title: 'Hijack' },
  },
  {
    id: 2,
    name: 'Non-admin signed-in site_content update',
    targetPath: '/site_content/main',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { updatedBy: 'random-user' },
  },
  {
    id: 3,
    name: 'Unverified email spoofing admin email',
    targetPath: '/projects/test-proj',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { id: 'test-proj', title: 'Spoofed' },
  },
  {
    id: 4,
    name: 'Shadow field injection on project create',
    targetPath: '/projects/shadow-proj',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { id: 'shadow-proj', isAdmin: true, title: 'Shadow' },
  },
  {
    id: 5,
    name: 'Oversized / invalid document ID',
    targetPath: `/projects/${'x'.repeat(160)}`,
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { id: 'x'.repeat(160), title: 'Long ID' },
  },
  {
    id: 6,
    name: 'Forged client timestamp instead of request.time',
    targetPath: '/site_content/main',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { updatedAt: '1999-01-01T00:00:00Z' },
  },
  {
    id: 7,
    name: 'Identity spoofing in updatedBy field',
    targetPath: '/site_content/main',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { updatedBy: 'spoofed-uid-123' },
  },
  {
    id: 8,
    name: 'Invalid niche enum value',
    targetPath: '/projects/bad-niche',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { id: 'bad-niche', niche: 'unauthorized-category' },
  },
  {
    id: 9,
    name: 'Oversized specs array (> 10)',
    targetPath: '/projects/bad-specs',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: {
      id: 'bad-specs',
      specs: Array.from({ length: 15 }, (_, idx) => `Spec ${idx}`),
    },
  },
  {
    id: 10,
    name: 'Mutating immutable project id during update',
    targetPath: '/projects/westvue-identity',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { id: 'renamed-id' },
  },
  {
    id: 11,
    name: 'Self-assigned admin privilege escalation',
    targetPath: '/admins/attacker-uid',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: { uid: 'attacker-uid', email: 'attacker@example.com', role: 'admin' },
  },
  {
    id: 12,
    name: 'Unauthorized listing of admins collection',
    targetPath: '/admins',
    operation: 'list',
    expectedOutcome: 'PERMISSION_DENIED',
    payload: {},
  },
];
