import { supabase } from '../lib/supabase';
import RNShare from 'react-native-share';
import RNFS from 'react-native-fs';

export async function exportUserData() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('Not authenticated');

  const [profileRes, sessionsRes, graveyardRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('writing_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }),
    supabase.from('graveyard').select('*').eq('user_id', user.id).order('deleted_at', { ascending: false }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId: user.id,
    email: user.email,
    profile: profileRes.data,
    writingSessions: sessionsRes.data || [],
    graveyard: graveyardRes.data || [],
  };

  const json = JSON.stringify(exportData, null, 2);
  const fileName = `deepflow-export-${new Date().toISOString().split('T')[0]}.json`;
  const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  await RNFS.writeFile(filePath, json, 'utf8');
  await RNShare.open({
    url: `file://${filePath}`,
    type: 'application/json',
    fileName,
    title: 'Export DeepFlow Data',
  });

  await RNFS.unlink(filePath);
  return exportData;
}

export async function deleteAccount() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('Not authenticated');

  const errors = [];

  const { error: sessionsErr } = await supabase
    .from('writing_sessions')
    .delete()
    .eq('user_id', user.id);
  if (sessionsErr) errors.push('sessions');

  const { error: graveyardErr } = await supabase
    .from('graveyard')
    .delete()
    .eq('user_id', user.id);
  if (graveyardErr) errors.push('vault');

  const { error: profileErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);
  if (profileErr) errors.push('profile');

  if (errors.length > 0) {
    throw new Error(`Could not delete some data. Please try again or contact support.`);
  }

  await supabase.auth.signOut({ scope: 'global' });
  return true;
}
