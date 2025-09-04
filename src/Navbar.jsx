import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function Navbar(){
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(()=>{
    const load = async ()=>{
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if(user){
        const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).maybeSingle();
        setProfile(data);
      } else setProfile(null);
    };
    load();
    const { data: listener } = supabase.auth.onAuthStateChange(()=> load());
    return ()=> listener.subscription.unsubscribe();
  },[]);

  return (
    <nav className="bg-white shadow p-4 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">SoloTok 🎬</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className={location.pathname==='/'? 'font-semibold text-blue-600':''}>Inicio</Link>
          <Link to="/explore" className={location.pathname==='/explore'? 'font-semibold text-blue-600':''}>Explorar</Link>
          <Link to="/chat" className={location.pathname==='/chat'? 'font-semibold text-blue-600':''}>Chat</Link>
          {user ? (
            <Link to="/me" className="flex items-center gap-2">
              <img src={profile?.avatar_url || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full object-cover"/>
              <span className="hidden sm:inline">{profile?.username || 'Mi perfil'}</span>
            </Link>
          ) : (
            <Link to="/login" className="bg-blue-500 text-white px-3 py-1 rounded">Iniciar sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
