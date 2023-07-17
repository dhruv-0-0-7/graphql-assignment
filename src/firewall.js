const { verifyAuthToken } = require('./utils');
const { prisma } = require('./prisma');

module.exports = async (req) => {
    let token = null, user = null;
    try {
        token = (req.headers?.['authorization'] ?? req.connectionParams?.['Authorization'])?.replace('Bearer ', '');

        if (!token) return { token };

        const decoded = verifyAuthToken(token);

        user = await prisma.user.findFirst({ where: { id: decoded.id, tokens: { has: token } } });

        return { user, token };
    } catch (err) {
        console.error(err);
        return { token };
    }
};