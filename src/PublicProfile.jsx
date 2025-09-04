import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useParams } from 'react-router-dom';

export default function PublicProfile(){
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(()=>{ if(userId) load(); },[userId]);

  async function load(){
    const { data } = await supabase.from('profiles').select('id, username, avatar_url, created_at').eq('id', userId).maybeSingle();
    setProfile(data);
    const { data: vids } = await supabase.from('videos').select('id, public_url, caption').eq('user_id', userId).order('created_at',{ascending:false});
    setVideos(vids||[]);
    const { count: followers } = await supabase.from('follows').select('*',{head:true, count:'exact'}).eq('following_id', userId);
    const { count: following } = await supabase.from('follows').select('*',{head:true, count:'exact'}).eq('follower_id', userId);
    setFollowersCount(followers||0);
    setFollowingCount(following||0);
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
      setFollowersCount(c=>c-1);
    } else {
      await supabase.from('follows').insert({ follower_id: session.user.id, following_id: userId });
      setIsFollowing(true);
      setFollowersCount(c=>c+1);
    }
  }

  if(!profile) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <div className="bg-white rounded p-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={profile.avatar_url||'https://via.placeholder.com/80'} alt="avatar" className="w-20 h-20 rounded-full object-cover"/>
          <div>
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <p className="text-sm text-gray-500">Miembro</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="font-semibold">{followersCount}</span> seguidores
              <span className="font-semibold">{followingCount}</span> seguidos
            </div>
          </div>
        </div>
        <button onClick={toggleFollow} className={isFollowing? 'bg-red-500 text-white px-3 py-1 rounded':'bg-blue-500 text-white px-3 py-1 rounded'}>
          {isFollowing? 'Dejar de seguir':'Seguir'}
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map(v=>(
          <div key={v.id} className="bg-white rounded shadow overflow-hidden">
            <video src={v.public_url} controls className="w-full h-56 object-cover"/>
            <div className="p-2">{v.caption}</div>
          </div>
        ))}
        {videos.length===0 && <p className="text-gray-500">No hay videos.</p>}
      </div>
    </div>
  );
}
