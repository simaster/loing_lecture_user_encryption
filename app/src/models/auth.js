const jwt = require('jsonwebtoken');
const database = require('../database');

const validUser = (req, res, next) => {
    
    const {access_token} = req.cookies;

    if (!access_token) {
        res.status(401).send('Access token is missing');
        return;
    }
    try {
    
        const { username } = jwt.verify(access_token, 'secure');
        const userInfo = database.find((data) => data.username === username);
        
        if (!userInfo) {
            throw('Invalid access token');
        }

        next(); // 다음 미들웨어로 넘어가기

    } catch (error) {
        console.error(error);
        res.status(401).send('Invalid access token');
    }
};

module.exports = { validUser };