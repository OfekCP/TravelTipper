import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Profile.css';
import countryList from './countries.json';
import { Link } from 'react-router-dom';
import { setCookie } from './cookieHelper';
const defaultProfilePicture = '.\src\assets\blank-profile-picture-973460_960_720.webp';

const Profile = (setExperienceId) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editExperience, setEditExperience] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [editData, setEditData] = useState({
    location: '',
    startDate: '',
    endDate: '',
    writtenAccount: '',
    photos: []
  })
  const [userExperiences, setUserExperiences] = useState([]);
  const [city, setCity] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [editBio,setEditBio]=useState(false)
  const[bio,setBio]=useState('')
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUser();
    fetchUserExperiences();
    fetchFriendRequests();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`https://traveltipper.onrender.com/auth/userInfo`);
      setUser(response.data);
      setBio(response.data.bio);
      setFormData({
        email: response.data.email,
        password: ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  console.log(user);
  const fetchUserExperiences = async () => {
    try {
      const experiencesResponse = await axios.get('https://traveltipper.onrender.com/api/travel/experiences');
      console.log(experiencesResponse);
      setUserExperiences(experiencesResponse.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(`https://traveltipper.onrender.com/auth/users/friend-requests`);
      setFriendRequests(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const formData = new FormData();
    formData.append('file', selectedFile);
    const url = `https://traveltipper.onrender.com/auth/users/profile-picture`;

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser({ ...user, profilePicture: response.data.profilePicture });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };
  const handleEditFileChange = (event) => {
    setEditData({
      ...editData,
      photos: event.target.files
    });
  };
  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setFormData({
      username: user.username,
      email: user.email,
      password: ''
    });
  };

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };
  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setEditData((prevEditData) => ({
      ...prevEditData,
      [name]: value
    }));
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setEditData((prevEditData) => ({
      ...prevEditData,
      location: selectedCountry,
      city: '' // Reset the city when the country changes
    }));
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      // Only include the password field if it's not empty
      if (formData.password !== '') {
        updateData.password = formData.password;
      }

      await axios.post('https://traveltipper.onrender.com/auth/user/update', updateData);
      setEditMode(false);
      setUser({
        ...user,
        username: formData.username,
        email: formData.email
      });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };


  const handleDelete = async (experienceId) => {
    try {
      await axios.delete(`https://traveltipper.onrender.com/api/travel/experiences/${experienceId}`)
      fetchUserExperiences();
    } catch (error) {
      console.log(error);
    }
  };
  const handleExperienceUpdate = async (event, experienceId) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('location', editData.location);
      formData.append('city', city);
      formData.append('startDate', editData.startDate);
      formData.append('endDate', editData.endDate);
      formData.append('writtenAccount', editData.writtenAccount);

      // Append each file to the FormData object
      for (let i = 0; i < editData.photos.length; i++) {
        formData.append('photos', editData.photos[i]);
      }

      await axios.put(`https://traveltipper.onrender.com/api/travel/experiences/${experienceId}`, formData);
      setEditExperience(false);

      // Update the specific experience in userExperiences
      setUserExperiences((prevExperiences) => {
        return prevExperiences.map((experience) => {
          if (experience._id === experienceId) {
            // Update the experience with the new data
            return {
              ...experience,
              location: editData.location,
              city: editData.city,
              startDate: editData.startDate,
              endDate: editData.endDate,
              writtenAccount: editData.writtenAccount,
              photos: editData.photos
            };
          } else {
            return experience; // Return unchanged experience if not the one being updated
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  };
  const renderCities = () => {
    if (!editData.location) return null;
    const cities = countryList[editData.location];
    return (
      <select value={editData.city} onChange={handleEditInputChange} name="city">
        <option value="" disabled hidden>Select City</option>
        {cities.map((cityName, index) => (
          <option key={index} value={cityName}>{cityName}</option>
        ))}
      </select>
    );
  };

  const handlePick = (experienceId) => {
    console.log("Picked experienceId:", experienceId);
    setCookie('experienceId', experienceId)
    setExperienceId(experienceId)
  }
  const handleRemoveProfilePicture = async () => {
    try {
      await axios.delete(`https://traveltipper.onrender.com/auth/users/profile-picture`);
      setUser({ ...user, profilePicture: null });
    } catch (error) {
      console.error('Error removing profile picture:', error);
    }
  };
  const handleClick = () => {
    fileInputRef.current.click();
  };
  const handleFriendIconClick = () => {
    setShowFriendRequests(!showFriendRequests); 
    if (!showFriendRequests) {
      fetchFriendRequests(); 
    }
  };

  const handleAcceptFriendRequest = async (senderId) => {
    try {
      const response = await axios.post(`https://traveltipper.onrender.com/auth/users/${senderId}/accept-friend-request`);
      console.log(response.data.message); 
      fetchFriendRequests();
      fetchUser();
    } catch (error) {
      console.error('Error accepting friend request:', error);
     
    }
  };

  const handleDeclineFriendRequest = async (senderId) => {
    try {
      const response = await axios.post(`https://traveltipper.onrender.com/auth/users/${senderId}/decline-friend-request`);
      console.log(response.data.message); 
     fetchFriendRequests();
    } catch (error) {
      console.error('Error declining friend request:', error);
      
    }
  };
  

  const handleSaveBio = async () => {
    try {
      if(editBio){
        const response=await axios.put('https://traveltipper.onrender.com/auth/users/editBio',{bio:bio})
        setBio(response.data.bio)
        fetchUser();
      }
      const response=await axios.post('https://traveltipper.onrender.com/auth/users/createBio',{bio:bio})
      setBio(response.data.bio)
      setEditBio(false);
      fetchUser();
    } catch (error) {
      console.error('Error saving bio:', error);
      // Handle error
    }
  };

  const handleEditBioClick = () => {
    setEditBio(true); // Set edit mode to true
    setBio(user.bio); // Set the bio state to the current user's bio
  };
  return (
    <div className='profile-container'>
      <div className="friend-icon-container">
        <div className='friend-request-num'><span>{friendRequests.length}</span></div>
        <img src=".\src\assets\1182775.png" alt="" className='friends-icon' onClick={handleFriendIconClick} />
        {showFriendRequests && (
          <div className="friend-requests-card">
            <h3 className='request=header'>Friend Requests</h3>
            <ul>
              {friendRequests.map((request, index) => (
                <li key={index}>
                  <img src={`https://traveltipper.onrender.com/${request.profilePicture}`} alt="" />
                  <span className='request-note'>{request.username} wants to be your friend</span>
                  <button onClick={() => handleAcceptFriendRequest(request._id)} className="accept-button">Accept</button>
                  <button onClick={() => handleDeclineFriendRequest(request._id)} className="decline-button">Decline</button>
                </li>
              ))}

            </ul>
          </div>
        )}
      </div>

      {user && (
        <div className="profile-info">
          <h2 className="profile-heading">Profile</h2>
          <p className="username">Username: {user.username}</p>
          <p className="email">Email: {user.email}</p>
          <Link to='/friends' className='friends'>Friends: {user.friends.length} </Link>
          {editMode ? (
            <div className="edit-mode">
              <input
                type="text"
                name="username"
                value={formData.username || user.username}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button onClick={handleUpdate} className="update-button">Update</button>
              <button onClick={handleCancelEdit} className="cancel-button">Cancel</button>
            </div>
          ) : (
            <div className="profile-picture-section">
              <img src={user.profilePicture ? `https://traveltipper.onrender.com/${user.profilePicture}` : defaultProfilePicture} alt="Profile" className="profile-picture" onClick={handleClick} />
              {user.profilePicture && (
                <button onClick={handleRemoveProfilePicture} className="remove-picture-button">Remove Profile Picture</button>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                className="file-input"
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <button onClick={handleEditClick} className="edit-button">Edit</button>
            </div>
          )}
                <div className="bio-section">
        <h2 className="bio-heading">Bio</h2>
        {editBio ? (
          <div className="edit-bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bio-textarea"
              rows={4}
              placeholder="Enter your bio..."
            ></textarea>
            <button onClick={handleSaveBio} className="save-bio-button">Save</button>
            <button onClick={() => setEditBio(false)} className="cancel-bio-button">Cancel</button>
          </div>
        ) : (
          <div className="view-bio">
            <p>{user.bio}</p>
            <button onClick={handleEditBioClick} className="edit-bio-button">Edit Bio</button>
          </div>
        )}
      </div>
        </div>
      )}
      <div className="user-experiences-section">
        <h2 className="experiences-heading">User Experiences</h2>
        <ul className="experiences-list">
          {userExperiences.map((experience) => (
            <div key={experience._id} className="experience-container">
              <Link to={'/experience'} className="experience-link" onClick={() => handlePick(experience._id)}>
                <p className="experience-location">Location: {experience.location}</p>
                <p className="experience-city">City: {experience.city}</p>
                <p>Vacation Dates: {new Date(experience.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(experience.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="experience-written-account">Written Account: {experience.writtenAccount}</p>
              </Link>
              <button onClick={(event) => { event.preventDefault(); handleDelete(experience._id); }} className="delete-button">Delete</button>
              <button onClick={(event) => { event.preventDefault(); setEditExperience(true); }} className="edit-button">Edit</button>
              {editExperience && (
                <div className="edit-experience-form">
                  <form onSubmit={(event) => handleExperienceUpdate(event, experience._id)} encType="multipart/form-data" className='profileForm'>
                    <select value={editData.location} onChange={handleCountryChange} name="location" className="edit-location-select">
                      <option value="" disabled hidden>Select Location</option>
                      {Object.keys(countryList).map((country, index) => (
                        <option key={index} value={country}>{country}</option>
                      ))}
                    </select>
                    {renderCities()}
                    <input type='date' name='startDate' value={editData.startDate} onChange={handleEditInputChange} className="edit-start-date" />
                    <input type='date' name='endDate' value={editData.endDate} onChange={handleEditInputChange} className="edit-end-date" />
                    <input type='text' name='writtenAccount' value={editData.writtenAccount} onChange={handleEditInputChange} className="edit-written-account" />
                    <input type='file' name='photos' onChange={handleEditFileChange} multiple required className="edit-photos-input" />
                    <input type='file' name='photos' onChange={handleEditFileChange} multiple className="edit-photos-input" />
                    <input type='file' name='photos' onChange={handleEditFileChange} multiple className="edit-photos-input" />
                    <button type='submit' className="confirm-button">Confirm</button>
                    <button onClick={() => setEditExperience(false)} className="cancel-button">Cancel</button>
                  </form>
                </div>
              )}
            </div>
          ))}

        </ul>
      </div>
    </div>

  );
};

export default Profile;
