require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../db');

module.exports.login = async (req, res) => {

    const { email, password } = req.body;

    db.query('SELECT * FROM User WHERE Email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }


        module.exports.login = async (req, res) => {
            const { email, password } = req.body;

            db.query('SELECT * FROM User WHERE Email = ?', [email], async (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error' });
                }

                if (results.length === 0) {
                    return res.status(400).json({ message: 'User not found' });
                }

                const user = results[0];
                const validPassword = await bcrypt.compare(password, user.Password);
                if (!validPassword) {
                    return res.status(400).json({ message: 'Invalid password or email' }); //we know it's invalid password but to not let malicious hackers know
                }

                const token = jwt.sign(
                    { id: user.CWID, email: user.Email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );



                res.status(200).json({ message: 'Login successful', token });
            });
        };
        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.Password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password or email' }); //we know it's invalid password but to not let malicious hackers know
        }

        const token = jwt.sign(
            { id: user.CWID, email: user.Email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );



        res.status(200).json({ message: 'Login successful', token });
    });
};
