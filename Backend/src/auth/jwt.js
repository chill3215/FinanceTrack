import jwt from 'jsonwebtoken';

export function signToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

export function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401).body({message: "Token invalid"});

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId; //später verwenden für die Verarbeitung der Anfrage
        next();
    } catch (error){
        return res.status(401).body({message: "Token invalid"});
    }
}