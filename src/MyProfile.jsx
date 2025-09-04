import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function MyProfile(){
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{ loadUser(); },[]);

  async function loadUser(){
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) { navigate('/login'); return; }
    setUser(user);
    const { data } = await supabase.from('profiles').select('username, avatar_url, created_at').eq('id', user.id).maybeSingle();
    setProfile(data);
    if(data){ setUsername(data.username||''); setAvatarUrl(data.avatar_url||''); }
    const { data: vids } = await supabase.from('videos').select('id, public_url, caption, created_at').eq('user_id', user.id).order('created_at',{ ascending:false});
    setVideos(vids || []);
  }

  async function updateProfile(){
    if(!user) return;
    await supabase.from('profiles').upsert({ id: user.id, username, avatar_url: avatarUrl });
    alert('Perfil actualizado');
    loadUser();
  }

  async function uploadVideo(e){
    e.preventDefault();
    if(!videoFile || !caption) return alert('Completa los campos');
    setUploading(true);
    try{
      const ext = videoFile.name.split('.').pop();
      const filePath = `videos/${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('videos').upload(filePath, videoFile);
      if(uploadError) throw uploadError;
      const { data } = await supabase.storage.from('videos').getPublicUrl(filePath);
      await supabase.from('videos').insert({ user_id: user.id, public_url: data.publicUrl, caption });
      setCaption(''); setVideoFile(null);
      loadUser();
      alert('Video subido');
    }catch(err){
      console.error(err); alert('Error subiendo');
    }finally{ setUploading(false); }
  }

  async function deleteVideo(id, public_url){
    if(!confirm('Eliminar video?')) return;
    // remove from storage by extracting path from public_url
    try{
      // public_url contains /storage/v1/object/public/videos/<path>
      const parts = public_url.split('/videos/');
      const path = parts.length>1 ? parts[1] : null;
      if(path) await supabase.storage.from('videos').remove([path]);
      await supabase.from('videos').delete().eq('id', id);
      loadUser();
    }catch(err){ console.error(err); alert('Error eliminando'); }
  }

  async function handleLogout(){
    await supabase.auth.signOut();
    navigate('/login');
  }

  if(!profile) return <p>Cargando...</p>;

  return (
    <div>
      <div className="bg-white rounded p-4 flex items-center gap-4 mb-4">
        <img src={profile.avatar_url||'https://via.placeholder.com/80'} alt="avatar" className="w-20 h-20 rounded-full object-cover"/>
        <div>
          <h2 className="text-2xl font-bold">{profile.username}</h2>
          <p className="text-sm text-gray-500">Miembro</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Cerrar sesión</button>
        </div>
      </div>

      <div className="bg-white rounded p-4 mb-4">
        <h3 className="font-semibold mb-2">Editar perfil</h3>
        <input className="w-full p-2 border rounded mb-2" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Nombre de usuario"/>
        <input className="w-full p-2 border rounded mb-2" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} placeholder="URL del avatar"/>
        <button onClick={updateProfile} className="bg-blue-500 text-white px-3 py-1 rounded">Guardar</button>
      </div>

      <div className="bg-white rounded p-4 mb-4">
        <h3 className="font-semibold mb-2">Subir video</h3>
        <form onSubmit={uploadVideo}>
          <input className="w-full p-2 border rounded mb-2" placeholder="Descripción" value={caption} onChange={e=>setCaption(e.target.value)}/>
          <input type="file" accept="video/*" onChange={e=>setVideoFile(e.target.files[0])} className="mb-2"/>
          <button type="submit" disabled={uploading} className="bg-green-500 text-white px-3 py-1 rounded">{uploading? 'Subiendo...':'Subir'}</button>
        </form>
      </div>

      <h3 className="text-xl font-semibold mb-2">Mis videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map(v=>(
          <div key={v.id} className="bg-white rounded shadow overflow-hidden">
            <video src={v.public_url} controls className="w-full h-56 object-cover"/>
            <div className="p-2 flex justify-between items-center">
              <div>{v.caption}</div>
              <button onClick={()=>deleteVideo(v.id, v.public_url)} className="text-red-500">Eliminar</button>
            </div>
          </div>
        ))}
        {videos.length===0 && <p className="text-gray-500">Aún no tienes videos.</p>}
      </div>
    </div>
  );
}
