import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import { Link } from 'react-router-dom';
import { getCookie,setCookie } from './cookieHelper';
const defaultProfilePicture = '.\src\assets\blank-profile-picture-973460_960_720.webp';
const DisplayFriendProfile = ({friendId,setExperienceId}) => {
    const [user, setUser] = useState(null);
    const [userExperiences, setUserExperiences] = useState([]);
    const [friendRequestSent, setFriendRequestSent] = useState(false);
useEffect(()=>{
    fetchFriendUser();
    console.log(friendId);
},[])
useEffect(()=>{
    fetchUserExperiences();
},[user])

    const fetchFriendUser = async () => {
        try {
            const response = await axios.get(`/auth/users/friend/${friendId}`)
            console.log(response);
            setUser(response.data);
            console.log(response);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    console.log(user);
    const fetchUserExperiences = async () => {
        if (user) {
            try {
                const experiencesResponse = await axios.get(`/api/travel/experiencesCreator/${user._id}`);
                console.log(experiencesResponse);
                setUserExperiences(experiencesResponse.data);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handlePick = (experience_Id) => {
        console.log("Picked experienceId:", experience_Id);
        setCookie('experienceId', experience_Id)
        setExperienceId(experience_Id)
    }
    const sendFriendRequest = async () => {
        try {
            await axios.post(`/auth/users/${user._id}/send-friend-request`);
            setFriendRequestSent(true); 
            alert('friend request been sent successfully')
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };
    return (
        <div className='profile-container'>
            {user && (
                <div className="profile-info">
                    <h2 className="profile-heading">Profile</h2>
                    <p className="username">{user && user.username}</p>
                        <div className="profile-picture-section">
                            <img src={user && user.profilePicture ? `https://traveltipper.onrender.com/${user.profilePicture}` : defaultProfilePicture} alt="Profile" className="profile-picture" />
                        </div>
                    {user && user.friendrequests && user.friendrequests.includes(getCookie('userId')) ? (
                        <span>Friend request has already been sent</span>
                    ) : user && user.friends && user.friends.includes(getCookie('userId')) ? (
                        <span>You are already friends with {user.username}</span>
                    ) : (
                        !friendRequestSent && (
                            <button className='friend-button' onClick={sendFriendRequest}>Send Friend Request</button>
                        )
                    )}

                </div>

            )}
            <div className="bio-section">
        <h2 className="bio-heading">Bio</h2>
          <div className="view-bio">
            {user&&user.bio?(<p>{user.bio}</p>):(<p>not bio existed</p>)}
            
          </div>
      </div>
            <div className="user-experiences-section">
                <h2 className="experiences-heading">User Experiences</h2>
                <ul className="experiences-list">
                    {userExperiences.map((experience) => (
                        <Link to={'/experience'} key={experience._id} className="experience-link" onClick={() => handlePick(experience._id)}>
                            <p className="experience-location">Location: {experience.location}</p>
                            <p className="experience-city">City: {experience.city}</p>
                            <p> Vacation Dates: {new Date(experience.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(experience.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="experience-written-account">Written Account: {experience.writtenAccount}</p>
                        </Link>
                    ))}
                </ul>
            </div>
        </div>
    )
};

export default DisplayFriendProfile;