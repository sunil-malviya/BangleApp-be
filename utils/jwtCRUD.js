import jwt from 'jsonwebtoken';



export const createToken = async(payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN } // Automatically sets 'exp' claim
  );
};

export const verifyToken = async(token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
    }

export const decodeToken = async(token) => {
    return jwt.decode(token);
    }

