import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Chat(){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(()=>{
    load();
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload)=>{
        setMessages(m=>[...m, payload.new]);
      })
      .subscribe();

    return ()=> supabase.removeChannel(channel);
  },[]);

  async function load(){
    const { data } = await supabase.from('messages').select('id, content, user_id, created_at').order('created_at',{ascending:true});
    setMessages(data||[]);
  }

  async function send(e){
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return alert('Debes iniciar sesión');
    if(!text.trim()) return;
    await supabase.from('messages').insert({ user_id: user.id, content: text });
    setText('');
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Chat comunitario</h2>
      <div className="h-64 overflow-y-auto border p-2 bg-white rounded mb-2">
        {messages.map(m=> <div key={m.id} className="mb-1"><span className="text-xs text-gray-500">{m.user_id.slice(0,6)}:</span> {m.content}</div>)}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Escribe un mensaje..."/>
        <button className="bg-blue-500 text-white px-3 py-1 rounded">Enviar</button>
      </form>
    </div>
  );
}
