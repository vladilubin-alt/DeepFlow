import { supabase } from './supabase';

const COOLDOWN_DAYS = 30;

export async function canShowReviewPrompt() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('has_been_prompted, purchase_count, review_cooldown_until')
      .eq('id', user.id)
      .single();

    if (!profile) return false;
    if (profile.has_been_prompted) return false;
    if (profile.purchase_count < 1) return false;

    if (profile.review_cooldown_until) {
      const cooldown = new Date(profile.review_cooldown_until);
      if (cooldown > new Date()) return false;
    }

    return true;
  } catch (e) {
    console.warn('[ReviewManager] canShowReviewPrompt error:', e.message);
    return false;
  }
}

export async function markReviewPrompted() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ has_been_prompted: true })
      .eq('id', user.id);
  } catch (e) {
    console.warn('[ReviewManager] markReviewPrompted error:', e.message);
  }
}

export async function setReviewCooldown() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const until = new Date(Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('profiles')
      .update({ review_cooldown_until: until })
      .eq('id', user.id);
  } catch (e) {
    console.warn('[ReviewManager] setReviewCooldown error:', e.message);
  }
}

export async function incrementPurchaseCount() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('purchase_count')
      .eq('id', user.id)
      .single();
    const current = profile?.purchase_count ?? 0;
    await supabase
      .from('profiles')
      .update({ purchase_count: current + 1 })
      .eq('id', user.id);
  } catch (e) {
    console.warn('[ReviewManager] incrementPurchaseCount error:', e.message);
  }
}
