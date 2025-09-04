import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Auth from './Auth';
import MyProfile from './MyProfile';
import PublicProfile from './PublicProfile';
import FeedWithTabs from './FeedWithTabs';
import UserList from './UserList';
import Chat from './Chat';
import PrivateRoute from './PrivateRoute';

export default function App(){
  return (
    <Router>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<FeedWithTabs />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/explore" element={<UserList />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/chat" element={<PrivateRoute><Chat/></PrivateRoute>} />
          <Route path="/me" element={<PrivateRoute><MyProfile/></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}
