import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function PrivateRoute({ children }){
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const check = async ()=>{
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    check();
  },[]);

  if(loading) return <p>Cargando...</p>;
  return user ? children : <Navigate to="/login" />;
}
