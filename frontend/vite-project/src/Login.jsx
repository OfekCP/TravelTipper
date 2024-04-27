import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setCookie } from './cookieHelper';

axios.defaults.withCredentials = true;

const Login = ({ setIsLoggedIn, isLoggedIn,setUserId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const nav = useNavigate();

  const handleLoginRegister = async () => {
    try {
      if (isLogin) {
        const response = await axios.post('/auth/login', { email, password });
        if (response.status === 200) {
          setIsLoggedIn(true);
          setCookie('authToken', response.data.token);
          const userId = response.data.userid;
          setUserId(userId)
          setCookie('userId', userId);
          console.log(userId);
          console.log('Login successful');
          nav('/');
        }
      } else {
        const response = await axios.post('/auth/register', { username, email, password });
        if (response.status === 201) {
          console.log('Registration successful'); 
          setIsLogin(true);
          setMessage('Registration successful. Please log in.');
        }
      }
    } catch (error) {
      console.error('Login/Register error:', error);
      setMessage('Login/Register failed. Please try again.');
    }
  };

  return (
    <div className="login-box">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {!isLogin && <div className="user-box"><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required /><label>Username</label></div>}
      <div className="user-box"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /><label>Email</label></div>
      <div className="user-box"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /><label>Password</label></div>
      <button onClick={handleLoginRegister}>{isLogin ? 'Login' : 'Register'}</button>
      <p>{message}</p>
      <p>{isLogin ? "Don't have an account? " : "Already have an account? "}
        <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign up' : 'Log in'}</span>
      </p>
      <style>
        {`
.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  padding: 40px;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9); /* Brighter background color */
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
}

.login-box .user-box {
  position: relative;
  margin-bottom: 30px; /* Moved margin from input to user-box */
}

.login-box .user-box input {
  width: 100%;
  padding: 10px 0;
  font-size: 16px;
  color: #333; /* Brighter text color */
  border: none;
  border-bottom: 1px solid #333; /* Brighter border color */
  outline: none;
  background: transparent;
}

.login-box .user-box label {
  position: absolute;
  top: 10px; /* Adjusted top position to align with input */
  left: 0;
  padding: 10px 0;
  font-size: 16px;
  color: #333; /* Brighter text color */
  pointer-events: none;
  transition: .5s;
}


.login-box .user-box input:focus ~ label,
.login-box .user-box input:valid ~ label,
.login-box .user-box input:not(:empty) ~ label  {
  top: -20px;
  left: 0;
  color: white;
  font-size: 12px;
}

.login-box button {
  position: relative;
  display: inline-block;
  padding: 10px 20px;
  color: #ffffff;
  font-size: 16px;
  text-decoration: none;
  text-transform: uppercase;
  overflow: hidden;
  transition: .5s;
  margin-top: 40px;
  letter-spacing: 4px;
  background: #2b99c1;
}

.login-box button:hover {
  background: #57d2ff;
  color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px #00ff00,
              0 0 25px #00ff00,
              0 0 50px #00ff00,
              0 0 100px #00ff00;
}

.login-box button span {
  position: absolute;
  display: block;
}

@keyframes btn-anim1 {
  0% {
    transform: translateX(-100%);
  }

  50%, 100% {
    transform: translateX(100%);
  }
}

.login-box button span:nth-child(1) {
  bottom: 2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff00);
  position: absolute;
  overflow: hidden;
}

.login-box button:hover span:nth-child(1) {
  animation: btn-anim1 2s linear infinite;
}

}


        `}
      </style>
    </div>
  );
};

export default Login;
