import React, { useState } from 'react';
import axios from 'axios';
import countryList from './countries.json'; // Import the JSON file
import './create.css'; // Import the CSS file

const CreateExperience = () => {
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [writtenAccount, setWrittenAccount] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const files = e.target.files;
    // Concatenate the newly selected files with the existing ones
    const newPhotos = Array.from(files);
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('location', location);
      formData.append('city', city);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('writtenAccount', writtenAccount);

      // Append each file to the FormData object
      for (let i = 0; i < photos.length; i++) {
        formData.append('photos', photos[i]);
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/travel/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Clear form fields after successful submission
      setLocation('');
      setCity('');
      setStartDate('');
      setEndDate('');
      setWrittenAccount('');
      setPhotos([]);

      // Redirect or show success message
    } catch (error) {
      console.error(error);
      setError('An error occurred while submitting the form. Please try again.');
    }
  };

  const handleCountryChange = (e) => {
    setLocation(e.target.value);
    setCity('');
  };

  const renderCities = () => {
    if (!location) return null;
    const cities = countryList[location];
    return (
      <select value={city} onChange={(e) => setCity(e.target.value)}>
        <option value="" disabled hidden>Select City</option>
        {cities.map((cityName, index) => (
          <option key={index} value={cityName}>{cityName}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="create-experience-container">
      <h2>Create New Experience</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className='createForm'>
        <select value={location} onChange={handleCountryChange}>
          <option value="" disabled hidden>Location</option>
          {Object.keys(countryList).map((country, index) => (
            <option key={index} value={country}>{country}</option>
          ))}
        </select>
        {renderCities()}
        <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <textarea placeholder="Written Account" value={writtenAccount} onChange={(e) => setWrittenAccount(e.target.value)} />
        <input type="file" accept="image/*" name="photos" onChange={handleImageChange} multiple required />
        <input type="file" accept="image/*" name="photos" onChange={handleImageChange} multiple />
        <input type="file" accept="image/*" name="photos" onChange={handleImageChange} multiple />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreateExperience;
