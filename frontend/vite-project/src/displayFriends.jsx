import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './displayFriends.css';
import {setCookie} from './cookieHelper'
const DisplayFriends = ({setFriendId}) => {
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchFriends(user.friends);
        }
    }, [user]);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/auth/userInfo');
            setUser(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchFriends = async (friendIds) => {
        try {
            const friendData = await Promise.all(
                friendIds.map(async (friendId) => {
                    const response = await axios.get(`/auth/users/friend/${friendId}`);
                    return response.data;
                })
            );
            setFriends(friendData);
        } catch (error) {
            console.log(error);
        }
    };
    const removeFriend = async (friendId) => {
        try {
            await axios.delete(`auth/users/friend/${friendId}`);
            setFriends((prevFriends) => prevFriends.filter((friend) => friend._id !== friendId));
        } catch (error) {
            console.log(error);
        }
    };
    const handleChoose=(friendId)=>{
        setCookie('friendId',friendId)
        setFriendId(friendId)
    }
    console.log(friends);
    return (
        <div className='friends-container'>
            <h1 className='friends-header'>Friends</h1>
            <div className='friends-list'>
                {friends.map((friend) => (
                    <Link to='/friendProfile' key={friend._id} onClick={()=>handleChoose(friend._id)}>
                    <div className="friend-card">
                        <img src={`https://traveltipper.onrender.com/${friend.profilePicture}`} alt={friend.username} className="friend-image" />
                        <div className="friend-details">
                            <p className="friend-username">{friend.username}</p>
                            <button className='remove-button' onClick={(event)=>{event.preventDefault(); removeFriend(friend._id)}}>remove</button>
                        </div>
                    </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DisplayFriends;
