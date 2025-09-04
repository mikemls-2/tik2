import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function FeedWithTabs(){
  const [tab, setTab] = useState('foryou');
  const [videos, setVideos] = useState([]);

  useEffect(()=>{ load(); },[tab]);

  async function load(){
    if(tab==='foryou'){
      const { data } = await supabase.from('videos').select('id, public_url, caption, user_id').order('created_at', { ascending: false});
      setVideos(data || []);
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if(!userData?.user) {
        setVideos([]);
        return;
      }
      const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', userData.user.id);
      const ids = (following||[]).map(f=>f.following_id);
      if(ids.length===0){ setVideos([]); return; }
      const { data } = await supabase.from('videos').select('id, public_url, caption, user_id').in('user_id', ids).order('created_at', { ascending: false});
      setVideos(data || []);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('foryou')} className={tab==='foryou'? 'bg-blue-500 text-white px-3 py-1 rounded':'bg-gray-200 px-3 py-1 rounded'}>👉 Para ti</button>
        <button onClick={()=>setTab('following')} className={tab==='following'? 'bg-blue-500 text-white px-3 py-1 rounded':'bg-gray-200 px-3 py-1 rounded'}>👥 Siguiendo</button>
      </div>

      <div className="grid gap-4">
        {videos.map(v=>(
          <div key={v.id} className="bg-white rounded overflow-hidden shadow">
            <video controls src={v.public_url} className="w-full h-64 object-cover" />
            <div className="p-2">
              <p className="font-medium">{v.caption}</p>
            </div>
          </div>
        ))}
        {videos.length===0 && <p className="text-gray-500">No hay videos.</p>}
      </div>
    </div>
  );
}
