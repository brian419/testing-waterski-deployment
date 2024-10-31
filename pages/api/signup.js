// const bcrypt = require('bcrypt');
// const db = require('../../db');

// module.exports.signup = async (req, res) => {
//     const { email, password, fname, lname, cwid, phone, gradYear, major } = req.body;
//     const pfpimage = req.file ? req.file.buffer : null; 

//     // Check if the user already exists
//     db.query('SELECT * FROM User WHERE Email = ?', [email], async (err, results) => {
//         if (err) {
//             console.error('Database query error:', err);
//             return res.status(500).json({ message: 'Database error' });
//         }

//         // Check if the email already exists
//         if (results && results.length > 0) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         try {
//             // Hash the password
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(password, salt);

//             // Insert the new user into the database
//             db.query(
//                 `INSERT INTO User (Email, Password, Fname, Lname, CWID, Phone, GradYear, Major, PfpImage) 
//                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [email, hashedPassword, fname, lname, cwid, phone, gradYear, major, pfpimage],
//                 (err, result) => {
//                     if (err) {
//                         console.error('Database insert error:', err);
//                         return res.status(500).json({ message: 'Database error' });
//                     }
//                     res.status(201).json({ message: 'Signup successful!' });

//                 }
//             );
//         } catch (err) {
//             console.error('Hashing error:', err);
//             res.status(500).json({ message: 'Server error' });
//         }
//     });
// };



// require('dotenv').config();
// const bcrypt = require('bcrypt');
// const db = require('../../db');

// const signup = async (req, res) => {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ message: 'Method Not Allowed' });
//     }

//     const { email, password, fname, lname, cwid, phone, gradYear, major } = req.body;
//     console.log('req.body:', req.body);
//     const pfpimage = req.file ? req.file.buffer : null;
//     console.log('password:', password)

//     try {
//         console.log('password at try block 1:', password);
//         db.query('SELECT * FROM User WHERE Email = ?', [email], async (err, results) => {
//             if (err) {
//                 console.error('Database query error:', err);
//                 return res.status(500).json({ message: 'Database error' });
//             }

//             if (results && results.length > 0) {
//                 return res.status(400).json({ message: 'User already exists' });
//             }

//             try {
//                 console.log('password at try block 2:', password);
//                 const salt = await bcrypt.genSalt(10);
//                 console.log("Password received:", password);
//                 const hashedPassword = await bcrypt.hash(password, salt);

//                 db.query(
//                     `INSERT INTO User (Email, Password, Fname, Lname, CWID, Phone, GradYear, Major, PfpImage) 
//                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                     [email, hashedPassword, fname, lname, cwid, phone, gradYear, major, pfpimage],
//                     (err, result) => {
//                         if (err) {
//                             console.error('Database insert error:', err);
//                             return res.status(500).json({ message: 'Database error' });
//                         }
//                         res.status(201).json({ message: 'Signup successful!' });
//                     }
//                 );
//             } catch (err) {
//                 console.error('Hashing error:', err);
//                 res.status(500).json({ message: 'Server error' });
//             }
//         });
//     } catch (error) {
//         console.error('Unexpected error during signup:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// export default signup;








require('dotenv').config();
const bcrypt = require('bcrypt');
const multer = require('multer');
const db = require('../../db');

const upload = multer({ storage: multer.memoryStorage() }).fields([
    { name: 'email', maxCount: 1 },
    { name: 'password', maxCount: 1 },
    { name: 'fname', maxCount: 1 },
    { name: 'lname', maxCount: 1 },
    { name: 'cwid', maxCount: 1 },
    { name: 'phone', maxCount: 1 },
    { name: 'gradYear', maxCount: 1 },
    { name: 'major', maxCount: 1 },
    { name: 'pfpimage', maxCount: 1 }
]);

const signup = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    upload(req, res, async (err) => {
        if (err) {
            console.error("File upload error:", err);
            return res.status(500).json({ message: "File upload error" });
        }

        console.log('Parsed req.body:', req.body);

        const email = req.body.email?.[0];
        const password = req.body.password?.[0];
        const fname = req.body.fname?.[0];
        const lname = req.body.lname?.[0];
        const cwid = req.body.cwid?.[0];
        const phone = req.body.phone?.[0];
        const gradYear = req.body.gradYear?.[0];
        const major = req.body.major?.[0];
        const pfpimage = req.files.pfpimage ? req.files.pfpimage[0].buffer : null;

        console.log('email:', email);
        console.log('password', password);
        console.log('fname:', fname);
        console.log('lname:', lname);
        console.log('cwid:', cwid);
        console.log('phone:', phone);
        console.log('gradYear:', gradYear);
        console.log('major:', major);
        console.log('pfpimage:', pfpimage);

        if (!password) {
            console.error("Password is missing in req.body after parsing.");
            return res.status(400).json({ message: "Password is required." });
        }

        try {
            db.query('SELECT * FROM User WHERE Email = ?', [email], async (err, results) => {
                if (err) {
                    console.error('Database query error:', err);
                    return res.status(500).json({ message: 'Database error' });
                }

                if (results && results.length > 0) {
                    return res.status(400).json({ message: 'User already exists' });
                }

                try {
                    const salt = await bcrypt.genSalt(10);
                    console.log("Password received before hashing:", password);
                    const hashedPassword = await bcrypt.hash(password, salt);

                    db.query(
                        `INSERT INTO User (Email, Password, Fname, Lname, CWID, Phone, GradYear, Major, PfpImage) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [email, hashedPassword, fname, lname, cwid, phone, gradYear, major, pfpimage],
                        (err, result) => {
                            if (err) {
                                console.error('Database insert error:', err);
                                return res.status(500).json({ message: 'Database error' });
                            }
                            res.status(201).json({ message: 'Signup successful!' });
                        }
                    );
                } catch (err) {
                    console.error('Hashing error:', err);
                    res.status(500).json({ message: 'Server error' });
                }
            });
        } catch (error) {
            console.error('Unexpected error during signup:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
};

export default signup;
