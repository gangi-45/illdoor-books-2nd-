import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { PickupPoint } from '@/types/database';
import crypto from 'crypto';

export const FALLBACK_PICKUP_POINT: PickupPoint = {
  id: 'p0000000-0000-0000-0000-000000000001',
  institute_id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Central Campus Student Counter (Gate 1)',
  location_description: 'Ground Floor, Student Activities Center, near MPI Main Gate 1',
  opening_time: '09:00:00',
  closing_time: '17:00:00',
  phone: '01711000000',
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function getPickupPoints(instituteId?: string): Promise<PickupPoint[]> {
  if (!isSupabaseConfigured()) {
    return [FALLBACK_PICKUP_POINT];
  }
  try {
    const supabase = await createClient();
    let query = supabase.from('pickup_points').select('*').eq('active', true).order('name');
    if (instituteId) {
      query = query.eq('institute_id', instituteId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return [FALLBACK_PICKUP_POINT];
    }
    return data;
  } catch {
    return [FALLBACK_PICKUP_POINT];
  }
}

/**
 * Generate a secure 6-digit PIN and its SHA-256 hash.
 */
export function generatePin(): { pin: string; hash: string } {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = hashPin(pin);
  return { pin, hash };
}

/**
 * Hash PIN with SHA-256 for secure storage at rest.
 */
export function hashPin(pin: string): string {
  const salt = process.env.PIN_SALT || 'polytechnic-marketplace-secure-salt';
  return crypto.createHash('sha256').update(`${pin}:${salt}`).digest('hex');
}

/**
 * Verify a plain text PIN against stored hash.
 */
export function verifyPin(pin: string, storedHash: string): boolean {
  const computedHash = hashPin(pin.trim());
  return computedHash === storedHash;
}
