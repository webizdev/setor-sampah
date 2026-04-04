import { supabase } from '../supabase.js';

/**
 * Global Recalculation of User Tiers
 * Based on percentage contribution against total global kg
 */
export async function updateAllUserTiers() {
    console.log("Recalculating all user tiers...");
    
    // 1. Fetch Company Configuration for Tiers
    const { data: config } = await supabase
        .from('yari_company_profile')
        .select('tier_prioritas_threshold, tier_gold_threshold, tier_silver_threshold')
        .single();

    const prioritasThreshold = parseFloat(config?.tier_prioritas_threshold ?? 60);
    const goldThreshold = parseFloat(config?.tier_gold_threshold ?? 30);
    const silverThreshold = parseFloat(config?.tier_silver_threshold ?? 20);

    // 2. Fetch all users
    const { data: users, error } = await supabase
        .from('yari_users')
        .select('id, total_contribution_kg');
    
    if (error) {
        console.error("Error fetching users for tier update:", error);
        return { success: false, error };
    }

    // 3. Calculate Total Global Kg
    const totalGlobalKg = (users || []).reduce((acc, u) => acc + (parseFloat(u.total_contribution_kg) || 0), 0);

    if (totalGlobalKg === 0) {
        console.log("Total global kg is zero, skipping updates.");
        return { success: true, message: "No contribution yet." };
    }

    // 4. Determine Tiers for each user
    const updates = (users || []).map(user => {
        const userKg = parseFloat(user.total_contribution_kg || 0);
        const percentage = (userKg / totalGlobalKg) * 100;
        
        let tier = 'BRONZE';
        if (percentage >= prioritasThreshold) tier = 'PRIORITAS';
        else if (percentage >= goldThreshold) tier = 'GOLD';
        else if (percentage >= silverThreshold) tier = 'SILVER';

        return {
            id: user.id,
            tier: tier
        };
    });

    // 5. Perform Serial Updates
    const results = await Promise.all(updates.map(u => 
        supabase.from('yari_users').update({ tier: u.tier }).eq('id', u.id)
    ));

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
        console.error("Some users failed to update tiers:", errors);
        return { success: false, errors };
    }

    console.log(`Sucessfully updated tiers for ${updates.length} users.`);
    return { success: true };
}
