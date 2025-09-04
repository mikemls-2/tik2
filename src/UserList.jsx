import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import UserProfile from './UserProfile';

export default function UserList(){
  const [users, setUsers] = useState([]);

  useEffect(()=>{ load() },[]);

  async function load(){
    const { data } = await supabase.from('profiles').select('id, username, avatar_url').order('created_at', { ascending: false});
    setUsers(data || []);
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Explorar usuarios</h2>
      <div className="space-y-3">
        {users.map(u=> <UserProfile key={u.id} userId={u.id} />)}
      </div>
    </div>
  );
}
