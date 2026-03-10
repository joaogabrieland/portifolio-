import { query } from '@/lib/db';
import { PLANS, PlanKey } from '@/lib/stripe';

// Feature types that can be tracked
export type TrackableFeature = 'script_generator' | 'proposals' | 'image_analysis' | 'storyboard';

// Map feature names to plan limit keys
const FEATURE_TO_LIMIT: Record<TrackableFeature, keyof typeof PLANS.solo.limits> = {
  script_generator: 'scriptGenerator',
  proposals: 'proposals',
  image_analysis: 'imageAnalysis',
  storyboard: 'storyboard',
};

// Get or create current month's usage record
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrCreateUsage(userId: string): Promise<any> {
  // Ensure table exists (safe for first-time users)
  await query(`
    CREATE TABLE IF NOT EXISTS usage (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      script_generator INT DEFAULT 0,
      proposals INT DEFAULT 0,
      image_analysis INT DEFAULT 0,
      storyboard INT DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, period_start)
    )
  `);

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // Try to get existing record
  let result = await query(
    'SELECT * FROM usage WHERE user_id = $1 AND period_start = $2',
    [userId, periodStart]
  );

  if (result.rows.length === 0) {
    // Create new record for this month
    result = await query(
      `INSERT INTO usage (user_id, period_start, period_end)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, period_start) DO NOTHING
       RETURNING *`,
      [userId, periodStart, periodEnd]
    );

    // If ON CONFLICT hit, fetch it
    if (result.rows.length === 0) {
      result = await query(
        'SELECT * FROM usage WHERE user_id = $1 AND period_start = $2',
        [userId, periodStart]
      );
    }
  }

  return result.rows[0];
}

// Check if user can use a feature (returns remaining count or false)
export async function checkLimit(userId: string, plan: PlanKey, feature: TrackableFeature): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const planData = PLANS[plan];
  if (!planData) {
    return { allowed: false, used: 0, limit: 0, remaining: 0 };
  }

  const limitKey = FEATURE_TO_LIMIT[feature];
  const limit = planData.limits[limitKey] as number;

  const usage = await getOrCreateUsage(userId);
  const used = usage[feature] || 0;

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

// Valid feature columns (whitelist to prevent SQL injection)
const VALID_FEATURES: ReadonlySet<string> = new Set(['script_generator', 'proposals', 'image_analysis', 'storyboard']);

// Increment usage counter for a feature
export async function incrementUsage(userId: string, feature: TrackableFeature, count: number = 1): Promise<void> {
  if (!VALID_FEATURES.has(feature)) {
    throw new Error(`Invalid feature: ${feature}`);
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  await query(
    `INSERT INTO usage (user_id, period_start, period_end)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, period_start)
     DO UPDATE SET
       script_generator = CASE WHEN $4 = 'script_generator' THEN usage.script_generator + $5 ELSE usage.script_generator END,
       proposals = CASE WHEN $4 = 'proposals' THEN usage.proposals + $5 ELSE usage.proposals END,
       image_analysis = CASE WHEN $4 = 'image_analysis' THEN usage.image_analysis + $5 ELSE usage.image_analysis END,
       storyboard = CASE WHEN $4 = 'storyboard' THEN usage.storyboard + $5 ELSE usage.storyboard END,
       updated_at = NOW()`,
    [userId, periodStart, periodEnd, feature, count]
  );
}

// Get actual storage used by a user (stock assets + client videos) in bytes
export async function getStorageUsed(userId: string): Promise<number> {
  let stockTotal = 0;
  let videoTotal = 0;

  try {
    const stockResult = await query(
      'SELECT COALESCE(SUM(size), 0) AS total FROM stock_assets WHERE user_id = $1',
      [userId]
    );
    stockTotal = Number(stockResult.rows[0].total);
  } catch {
    // Table may not exist yet — return 0
  }

  try {
    const videoResult = await query(
      `SELECT COALESCE(SUM(cv.size), 0) AS total
       FROM client_videos cv
       JOIN team_invites ti ON cv.token = ti.token
       WHERE ti.user_id = $1 AND cv.expires_at > NOW()`,
      [userId]
    );
    videoTotal = Number(videoResult.rows[0].total);
  } catch {
    // Tables may not exist yet — return 0
  }

  return stockTotal + videoTotal;
}

// Check if user can upload additionalBytes within their plan's storage limit
export async function checkStorageLimit(userId: string, plan: PlanKey, additionalBytes: number): Promise<{
  allowed: boolean;
  usedBytes: number;
  limitBytes: number;
}> {
  const planData = PLANS[plan];
  const limitBytes = (planData.limits.storage as number) * 1024 * 1024 * 1024; // GB → bytes

  if (limitBytes === 0) {
    return { allowed: false, usedBytes: 0, limitBytes: 0 };
  }

  const usedBytes = await getStorageUsed(userId);
  return {
    allowed: usedBytes + additionalBytes <= limitBytes,
    usedBytes,
    limitBytes,
  };
}

// Count team invites for a user
export async function getTeamMemberCount(userId: string): Promise<number> {
  const result = await query(
    'SELECT COUNT(*) AS count FROM team_invites WHERE user_id = $1',
    [userId]
  );
  return Number(result.rows[0].count);
}

// Get all usage for current month
export async function getUsageSummary(userId: string, plan: PlanKey): Promise<{
  features: Record<string, { used: number; limit: number; remaining: number; percentage: number }>;
  storage: { usedBytes: number; limitBytes: number; percentage: number };
}> {
  const planData = PLANS[plan];
  const usage = await getOrCreateUsage(userId);

  const features: Record<string, { used: number; limit: number; remaining: number; percentage: number }> = {};

  for (const [dbField, limitKey] of Object.entries(FEATURE_TO_LIMIT)) {
    const limit = planData.limits[limitKey as keyof typeof planData.limits] as number;
    const used = usage[dbField] || 0;
    features[dbField] = {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      percentage: limit > 0 ? Math.round((used / limit) * 100) : 0,
    };
  }

  const storageLimit = (planData.limits.storage as number) * 1024 * 1024 * 1024; // GB to bytes
  const storageUsed = await getStorageUsed(userId);

  return {
    features,
    storage: {
      usedBytes: storageUsed,
      limitBytes: storageLimit,
      percentage: storageLimit > 0 ? Math.round((storageUsed / storageLimit) * 100) : 0,
    },
  };
}
