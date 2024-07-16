import React, { useState,useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './NavBar';
import Login from './Login';
import Profile from './Profile';
import Home from './Home';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCookie, clearCookie, setCookie } from './cookieHelper'
import CreateExperience from './createExperience';
import DisplayExperience from './displayExperience';
import DisplayProfile from './displayProfile';
import DisplayFriends from './displayFriends';
import DisplayFriendProfile from './displayFriendProfile';
axios.defaults.withCredentials = true;

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId,setUserId]=useState(getCookie('userId') || null)
  const [user, setUser] = useState(null);
  const [experienceId,setExperienceId]=useState(getCookie('experienceId')||null)
  const[friendId,setFriendId]=useState(getCookie('friendId')||null)
const Navigate=useNavigate()
useEffect(() => {
 
  const authToken = getCookie('authToken');
  if (authToken) {
    setIsLoggedIn(true);
    return()=>{
      setIsLoggedIn(false)
    }
  }
}, []);
const handleLogout = async () => {
  try {
    await axios.post('/auth/logout');
    clearCookie('authToken');
    clearCookie('userId');
    clearCookie('experienceId')
    setIsLoggedIn(false);
    Navigate('/');
    setUser(null)
  } catch (error) {
    console.error('Logout error:', error);
  }
};
useEffect(() => {
  if (userId) {
    setCookie('userId', userId);
  }
}, [userId]);

useEffect(() => {
  if (experienceId) {
    console.log("Experience ID state:", experienceId);
    setCookie('experienceId', experienceId);
  }
}, [experienceId]);
  return (
    <>
      <NavBar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} setUserId={setUserId} />} />
        <Route path='/create' element={<CreateExperience />} />
        <Route path="/experience" element={<DisplayExperience experienceId={experienceId} isLoggedIn={isLoggedIn} />} />
        <Route path="/" element={<Home isLoggedIn={isLoggedIn}  userId={userId} user={user} setUser={setUser} setExperienceId={setExperienceId} />} />
        <Route path="/profile" element={<Profile userId={userId} setExperienceId={setExperienceId} />} />
        <Route path='/displayProfile' element={<DisplayProfile experienceId={experienceId} setExperienceId={setExperienceId} />} />
        <Route path='/friends' element={<DisplayFriends setFriendId={setFriendId} />} />
        <Route path='/friendProfile' element={<DisplayFriendProfile friendId={friendId} setExperienceId={setExperienceId} />} />
      </Routes>
    </>
  );
}

export default App;
