
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './display.css'; 
import { useNavigate } from 'react-router-dom';
import { getCookie } from './cookieHelper';
import { FaStar } from 'react-icons/fa';

const DisplayExperience = ({ experienceId, isLoggedIn }) => {
    const [experience, setExperience] = useState(null);
    const [error, setError] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [creator, setCreator] = useState(null);
    const [comment, setComment] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [allComments, setAllComments] = useState([]);
    const [editMode, setEditMode] = useState(false); 
    const [editingCommentId, setEditingCommentId] = useState(null); 
    const [ratings, setRatings] = useState([]); 
    const [averageRating, setAverageRating] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    const nav = useNavigate();
    const fetchAllComments = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/travel/experiences/${experienceId}/comments`)
            setAllComments(response.data)
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        fetchExperience();
        fetchAllComments();
        fetchRatings();
        console.log("Received experienceId prop:", experienceId);
    }, [experienceId]);

    const fetchRatings = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/travel/experiences/${experienceId}/ratings`);
            const fetchedRatings = response.data;
            setRatings(fetchedRatings);
            const totalRating = fetchedRatings.reduce((acc, curr) => acc + curr.value, 0);
            const avgRating = fetchedRatings.length > 0 ? totalRating / fetchedRatings.length : 0;
            setAverageRating(avgRating);
            setTotalVotes(fetchedRatings.length);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchExperience = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/travel/experiences/${experienceId}`);
            setExperience(response.data);
            console.log(response.data);
            const creatorResponse = await axios.get(`${import.meta.env.VITE_API_URL}/auth/experience/creator/${experienceId}`);
            console.log(creatorResponse);
            setCreator(creatorResponse.data)
        } catch (error) {
            console.error(error);
            setError('Failed to fetch experience data');
        }
    };


    const handleNextPhoto = () => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % experience.photos.length);
    };

    const handlePrevPhoto = () => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + experience.photos.length) % experience.photos.length);
    };

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!experience) {
        return <div className="loading">Loading...</div>;
    }
    const handleDisplayProfile = () => {
        if (creator.id === getCookie('userId')) {
            nav('/profile')
        } else {
            nav('/displayProfile')
        }
    }
    const handleSend = async () => {
        if (!isLoggedIn) {
            nav('/login')
        } else {
            try {
                if (editMode) {
                    await axios.put(`${import.meta.env.VITE_API_URL}/api/travel/comments/${experienceId}/${editingCommentId}`, { content: commentText });
                } else {
                    await axios.post(`${import.meta.env.VITE_API_URL}/api/travel/experiences/${experienceId}/comments`, { content: commentText });
                }
                setEditMode(false); 
                setEditingCommentId(null); 
                setCommentText(''); 
                fetchAllComments(); 
            } catch (error) {
                console.log(error);
            }
        }
    };
    const handleEditComment = (commentId) => {
        const commentToEdit = allComments.find(comment => comment._id === commentId);
        setCommentText(commentToEdit.content);
        setEditMode(true); 
        setEditingCommentId(commentId); 
    };
    const formatTimeDifference = (createdAt) => {
        const currentTime = new Date();
        const commentTime = new Date(createdAt);
        const timeDifference = currentTime - commentTime;
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else if (weeks > 0) {
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    };
    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/travel/comments/${experienceId}/${commentId}`)
            fetchAllComments();
        } catch (error) {
            console.log(error);
        }
    }
    const handleRating = async (value) => {
        if (!isLoggedIn) {
            nav('/login')
        } else {
            try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/travel/experiences/${experienceId}/ratings`, { value });
                fetchRatings();
            } catch (error) {
                console.log(error);
            }
        }
    };
    return (
        <div className="display-experience-container">
            <div className="creator-info" onClick={handleDisplayProfile}>
                {creator && (
                    <>
                        <img src={`${import.meta.env.VITE_API_URL}/${creator.profilePicture}`} alt="" />
                        <span className="creator-username">{creator.username}</span>
                    </>
                )}
            </div>
            <h2 className="experience-location">{experience.location}</h2>
            <div className="star-rating">
                {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    return (
                        <label key={index}>
                            <input type="radio" name="rating" value={ratingValue} onClick={() => handleRating(ratingValue)} />
                            <FaStar className="star" color={ratingValue <= averageRating ? '#ffc107' : '#e4e5e9'} size={20} />
                        </label>
                    );
                })}
                <div className="average-rating">{averageRating.toFixed(1)} ({totalVotes} votes)</div>
            </div>
            <h3 className="experience-city">{experience.city}</h3>
            <p className="experience-date">{new Date(experience.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="experience-description">
                <p className="vacation-dates">Vacation Dates: {new Date(experience.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(experience.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="written-account">{experience.writtenAccount}</p>
            </div>
            <div className="experience-photo-container">
                <img src={`${import.meta.env.VITE_API_URL}/${experience.photos[currentPhotoIndex].imageUrl}`} alt="" className="experience-image" />
                <div className="arrow-container">
                    <button className="prev-arrow" onClick={handlePrevPhoto}>{'<'}</button>
                    <button className="next-arrow" onClick={handleNextPhoto}>{'>'}</button>
                </div>
                <img src=".\src\assets\preview-removebg-preview.png" alt="" className="comment-icon" onClick={() => setComment(prevComment => !prevComment)} />
            </div>
            {comment && (
                <div className="comment-section">
                    {allComments.map((user, index) => (
                        <div key={index} className="comment">
                            {getCookie('userId') === user.user ? (
                                <div>
                                    <span className="your-comment">You: {user.content}</span>
                                    <button className='delete-comment' onClick={() => handleDeleteComment(user._id)}>delete</button>
                                    <button className='edit-comment' onClick={() => handleEditComment(user._id)}>edit</button>
                                    <p className="experience-date">{formatTimeDifference(user.createdAt)}</p>
                                </div>
                            ) : (
                                experience.createdBy === user.user ? (
                                    <div>
                                        <span><img src="https://cdn-icons-png.flaticon.com/512/1995/1995571.png" alt="" style={{ height: '3vh', width: '1vw' }} />
                                            {user.username}: {user.content}</span>
                                        <p className="experience-date">{formatTimeDifference(user.createdAt)}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="other-comment">{user.username}: {user.content}</span>
                                        <p className="experience-date">{formatTimeDifference(user.createdAt)}</p>
                                    </div>
                                )
                            )}
                        </div>
                    ))}

                    <input type="text" onChange={(e) => setCommentText(e.target.value)} className="comment-input" value={commentText} placeholder="Add a comment..." />
                    <button onClick={handleSend} className="send-button" disabled={!commentText.trim()}>Send</button>
                </div>
            )}
        </div>

    );
};

export default DisplayExperience;
