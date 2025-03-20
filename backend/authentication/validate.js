import { body } from 'express-validator';

export const loginValidation = [
    body('email')
        .isEmail().withMessage('Email cannot be empty'),
    body('password')
        .notEmpty().withMessage('Password cannot be empty')
];
