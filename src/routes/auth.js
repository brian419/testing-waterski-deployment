const express = require('express');
const multer = require('multer');
const router = express.Router();
const { login } = require('../../pages/api/login.js');
const { signup } = require('../../pages/api/signup.js');

const { getRoster } = require('../../pages/api/roster.js');
const { getSetList, registerReservation, deleteReservation } = require('../../pages/api/setlist.js');
const { profile } = require('../../pages/api/profile.js');
const { getMeetingNotes, addMeetingNote, deleteMeetingNote } = require('../../pages/api/meetingnotes.js');

// multer is the middleware for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const checkAuth = (req, res, next) => {
    // console.log('Checking authentication for Express routes');

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.redirect('/login-page');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.redirect('/login-page');
    }


    next();
};


router.post('/login', login);
router.post('/signup', upload.single('pfpimage'), signup);
router.get('/roster', checkAuth, getRoster);
router.get('/profile', profile);
router.get('/setlist', getSetList);
router.post('/setlist', registerReservation);
router.delete('/setlist', deleteReservation);

router.get('/meetingnotes', getMeetingNotes);
router.post('/meetingnotes', upload.single('file'), addMeetingNote);
router.delete('/meetingnotes/:id', deleteMeetingNote);

module.exports = router;

