// page 4 for forgot password, this one handles updating the password in db


import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../db';


const SECRET_KEY = process.env.JWT_SECRET;

const updateUserPassword = async (email: string, hashedPassword: string) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE User SET Password = ? WHERE Email = ?';

        db.query(query, [hashedPassword, email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
            } else if (results && 'affectedRows' in results && results.affectedRows === 0) {
                reject(new Error('User not found.'));
            } else {
                resolve(results);
            }
        });
    });
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { token, newPassword } = req.body;

        try {
            if (!SECRET_KEY) {
                return res.status(500).json({ success: false, message: 'Server error: missing secret key for JWT.' });
            }

            const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
            const email = decoded.email;

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await updateUserPassword(email, hashedPassword);

            res.status(200).json({ success: true, message: 'Password reset successfully.' });
            
        } catch (error) {
            console.error('Error during password reset:', error);

            const errorMessage = (error instanceof Error) ? error.message : 'Invalid or expired token.';
            res.status(400).json({ success: false, error: errorMessage });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
