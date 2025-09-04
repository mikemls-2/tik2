import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';

export default function UserProfile({ userId }){
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(()=>{
    load();
  },[userId]);

  async function load(){
    const { data } = await supabase.from('profiles').select('id, username, avatar_url').eq('id', userId).maybeSingle();
    setProfile(data);
    const { data: session } = await supabase.auth.getUser();
    if(session?.user){
      const { data: f } = await supabase.from('follows').select('id').eq('follower_id', session.user.id).eq('following_id', userId).maybeSingle();
      setIsFollowing(!!f);
    }
  }

  async function toggleFollow(){
    const { data: session } = await supabase.auth.getUser();
    if(!session?.user) return alert('Debes iniciar sesión');
    if(isFollowing){
      await supabase.from('follows').delete().eq('follower_id', session.user.id).eq('following_id', userId);
      setIsFollowing(false);
    } else {
      await supabase.from('follows').insert({ follower_id: session.user.id, following_id: userId });
      setIsFollowing(true);
    }
  }

  if(!profile) return null;
  return (
    <div className="flex items-center justify-between bg-white p-3 rounded shadow">
      <div className="flex items-center gap-3">
        <img src={profile.avatar_url||'https://via.placeholder.com/48'} alt="avatar" className="w-12 h-12 rounded-full object-cover"/>
        <Link to={`/profile/${profile.id}`} className="font-semibold">{profile.username||'Usuario'}</Link>
      </div>
      <div>
        <button onClick={toggleFollow} className={isFollowing? 'bg-red-500 text-white px-3 py-1 rounded':'bg-blue-500 text-white px-3 py-1 rounded'}>
          {isFollowing? 'Dejar de seguir':'Seguir'}
        </button>
      </div>
    </div>
  );
}
