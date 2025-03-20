
const isAuthenticated =  (req, res) => {
    if (req.session.user) {
        return res.status(200).json({
            success: true,
            user: req.session.user,
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated.'
        });
    }
};

export default isAuthenticated;