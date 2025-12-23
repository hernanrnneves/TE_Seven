import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDriverStats } from '@/lib/sheets';

export const dynamic = 'force-dynamic'; // Ensure not cached

export async function GET() {
    try {
        // 1. Get all profiles
        // Note: In production, verify the caller has 'admin' role!
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, google_sheet_id');

        if (error) throw error;
        if (!profiles) return NextResponse.json([]);

        // 2. Fetch stats for each profile with a sheet ID in parallel
        const statsPromises = profiles.map(async (profile) => {
            if (!profile.google_sheet_id) {
                return {
                    ...profile,
                    stats: { totalTrips: 0, averagePerDay: 0 }
                };
            }

            const stats = await getDriverStats(profile.google_sheet_id);
            return {
                ...profile,
                stats
            };
        });

        const results = await Promise.all(statsPromises);

        return NextResponse.json(results);

    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
