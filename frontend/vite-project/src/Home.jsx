
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import './Home.css';
import { setCookie } from './cookieHelper';
import { FaStar } from 'react-icons/fa';

const Home = ({ setExperienceId, averageRating, totalVotes }) => {
  const [randomExperiences, setRandomExperiences] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    fetchRandomExperiences();
  }, []);

  const fetchRandomExperiences = async () => {
    try {
      const response = await axios.get('https://traveltipper.onrender.com/api/travel/all-experiences');
      console.log(response);
      const shuffledExperiences = response.data.sort(() => 0.5 - Math.random());
      const selectedExperiences = shuffledExperiences.slice(0, 10);
      setRandomExperiences(selectedExperiences);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://traveltipper.onrender.com/api/travel/search-experiences`, {
        params: {
          location: searchLocation, 
        },
      });
      setSearchResults(response.data);
      setSearchPerformed(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setSearchLocation(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const handleChoose = (experienceId) => {
    setCookie('experienceId', experienceId)
    setExperienceId(experienceId)
  }
  const calculateAverageRating = (ratings) => {
    const totalRating = ratings.reduce((acc, rate) => acc + rate.value, 0);
    const averageRating = totalRating / ratings.length;
    return averageRating.toFixed(1);
  };

  return (
<div className="home-container">
  <h2 className='logo'>Search for amazing trips</h2>
  <div className='search-container'>
  <input
  className='search-input'
    type="text"
    placeholder="Search by location"
    value={searchLocation}
    onChange={handleInputChange}
    onKeyPress={handleKeyPress}
    style={{ width: '50vw', height: '5vh' }}
  />
  <button className='search-button' onClick={handleSearch} style={{ width: '10vw', height: '5vh' }} disabled={!searchLocation.trim()}>
    Search
  </button>
  </div>
  {searchPerformed && searchResults.length === 0 && (
    <div className="no-results" style={{ marginTop: '5vh' }}>
      <p>No experiences found for the location "{searchLocation}".</p>
    </div>
  )}
  {searchResults.length > 0 ? (
      <div><h3>Search Results</h3>
    <div className="search-results" style={{ marginTop: '5vh' }}>
      {searchResults.map(experience => (
        <Link key={experience._id} to={'/experience'} className="experience-link" onClick={() => handleChoose(experience._id)}>
          <div className="experience-item" style={{ marginBottom: '5vh' }}>
            <img className='experience-image' src={`https://traveltipper.onrender.com/${experience.photos[0].imageUrl}`} alt="" />
            <h4 className='experienceLocation'>{experience.location}</h4>
            <p className='experienceCity'>{experience.city}</p>
            {experience.ratings.length > 0 && (
              <span className="average-rating">
                {calculateAverageRating(experience.ratings)} <FaStar className="star" color={'#ffc107'} size={20} />
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
    </div>
  ) : (
    <div><h3 className='random'>Some of our Experiences</h3>
      <div className="random-experiences" style={{ marginTop: '5vh' }}>
        {randomExperiences.map(experience => (
          <Link key={experience._id} to={'/experience'} className="experience-link" onClick={() => handleChoose(experience._id)}>
            <div className="experience-item" style={{ marginBottom: '5vh' }}>
              <img className='experience-image' src={`https://traveltipper.onrender.com/${experience.photos[0].imageUrl}`} alt="" />
              <h4 className='experienceLocation'>{experience.location}</h4>
              <p className='experienceCity'>{experience.city}</p>
              {experience.ratings.length > 0 ? (
                <span className="average-rating">
                  {calculateAverageRating(experience.ratings)} <FaStar className="star" color={'#ffc107'} size={20} />
                </span>
              ):(
                <span className="average-rating">
                  0 <FaStar className="star" color={'#ffc107'} size={20} />
                </span>
              )}
            </div>
          </Link>
        ))}
      </div></div>
  )}
</div>

  );
};

export default Home;
