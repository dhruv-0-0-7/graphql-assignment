const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateAuthToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

const verifyAuthToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

const throwError = (err) => {
    return {
        type: 'Error',
        code: err.code?.toString() ?? '500',
        message: err.message
    };
};

const throwAuthorizationError = () => {
    return {
        type: 'Error',
        code: '401',
        message: 'Authorization required'
    };
};

const isTypeError = (obj) => {
    return obj.message || obj.code;
};

module.exports = {
    isTypeError,
    throwError,
    throwAuthorizationError,
    generateAuthToken,
    verifyAuthToken,
    hashPassword,
    verifyPassword
};