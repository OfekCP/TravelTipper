// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../authMiddleware');
const {removeFriend,getFriendById,createOrUpdateBio,declineFriendRequest,acceptFriendRequest,getAllFriendRequests,sendFriendRequest,creatorProfile,getExperienceById, register, login, logout,getAllUsers,getUserById,uploadProfilePicture,deleteProfilePicture,updateUserById } = require('../controllers/userController');
// const {upload}=requir authenticateUser e('../server')
const multer = require('multer');
var upload = multer({ dest: 'uploads/' });

router.post('/register', register);
router.post('/login', login);
router.post('/logout',logout);
router.get('/users',getAllUsers);
router.get('/userInfo',authenticateUser,getUserById);
router.post('/user/update',authenticateUser,updateUserById);
router.post('/users/profile-picture',authenticateUser, upload.single('file'),uploadProfilePicture);
router.delete('/users/profile-picture',authenticateUser,deleteProfilePicture);
router.route('/experience/creator/:id').get(getExperienceById)
router.route('/experience/creatorDisplay/:id').get(creatorProfile)
// Send Friend Request
router.post('/users/:recipientId/send-friend-request', authenticateUser, sendFriendRequest);

// Get All Friend Requests
router.get('/users/friend-requests', authenticateUser, getAllFriendRequests);
router.get('/users/friend/:friendId',authenticateUser,getFriendById)
router.delete('/users/friend/:friendId',authenticateUser,removeFriend)
// Accept Friend Request
router.post('/users/:senderId/accept-friend-request', authenticateUser, acceptFriendRequest);
router.post('/users/:senderId/decline-friend-request', authenticateUser, declineFriendRequest);
router.post('/users/createBio', authenticateUser, createOrUpdateBio);
router.put('/users/editBio', authenticateUser, createOrUpdateBio);
module.exports = router;
