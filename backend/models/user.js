import mongoose from 'mongoose';
import argon2 from 'argon2';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    emailVerified: {
        type: Boolean,
        default: false, 
    },
    ipAddress : {
        type: String,
        default: "",
    },
    role: {
        type : String,
        enum: ['user', 'ctfAdmin', 'admin'],
        default: 'user',
    },
    country: {
        type: String,
        default: "India",
    },
    imageUrl: {
        type: String,
        default: '',
    },
    github: {
        type: String,
        default: '',
    },
    instagram: {
        type: String,
        default: '',
    },
    portfolio: {
        type: String,
        default: '',
    },
    userFriends: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
            username: { type: String, required: true }
        }
    ],
    additionalEmail: {
        type: String,
        default: '',
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
}, {
    timestamps: true,
});

userSchema.methods.isPasswordMatch = async function(password) {
    return await argon2.verify(this.passwordHash, password);
};

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('user', userSchema);

export default User;
