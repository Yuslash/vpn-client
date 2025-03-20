import { validationResult } from 'express-validator'
import User from '../models/user.js'
import argon2 from 'argon2'
import dotenv from 'dotenv'

dotenv.config()

// Store email & username globally
let storedEmail = null
let storedUsername = null

const loginUser = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg, 
        })
    }

    const { email, password } = req.body

    try {
        const userEmail = await User.findOne({ email })

        if (!userEmail) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password.',
            })
        }

        const isPasswordValid = await argon2.verify(userEmail.passwordHash, password)
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect email or password.',
            })
        }
        
        // Store globally
        storedEmail = email
        storedUsername = userEmail.username

        req.session.user = {
            id: userEmail._id,
            username: userEmail.username,
            email: userEmail.email,
        }

        req.session.save((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Session save failed.',
                })
            }

            return res.status(200).json({
                success: true,
                message: 'Login successful!',
                user: req.session.user,
            })
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error.',
        })
    }
}

export default loginUser
export { storedEmail, storedUsername }
