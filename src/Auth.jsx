import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth(){
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    if(isLogin){
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if(error) return alert(error.message);
      navigate('/me');
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if(error) return alert(error.message);
      // create profile
      if(data?.user){
        await supabase.from('profiles').upsert({ id: data.user.id, username: email.split('@')[0], avatar_url: '' });
      }
      navigate('/me');
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">{isLogin? 'Iniciar sesión':'Crear cuenta'}</h2>
        <input className="w-full p-2 border rounded mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input className="w-full p-2 border rounded mb-2" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required/>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">{isLogin? 'Entrar':'Registrar'}</button>
          <button type="button" onClick={()=>setIsLogin(!isLogin)} className="bg-gray-200 px-3 py-1 rounded">{isLogin? 'Crear cuenta':'Entrar'}</button>
        </div>
      </form>
    </div>
  );
}
