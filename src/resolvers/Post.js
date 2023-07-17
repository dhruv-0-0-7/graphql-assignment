const { filterUser } = require('../prisma');
const { throwAuthorizationError, throwError } = require('../utils');

module.exports = {
    async author(obj, _, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            if (obj.author) {
                if (!obj.author.type) {
                    return {
                        type: 'User',
                        ...filterUser(obj.author)
                    };
                }
                return obj.author;
            }

            const { author } = await prisma.post.findUnique({
                where: { id: obj.id },
                include: { author: true }
            });

            return {
                type: 'User',
                ...filterUser(author)
            };

        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async comments(obj, _, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            if (obj.comments) {
                if (obj.comments instanceof Array) {
                    return {
                        type: 'CommentsList',
                        comments: obj.comments,
                        count: obj.comments.length
                    };
                }

                return obj.comments;
            }

            const { comments } = await prisma.post.findUnique({
                where: { id: obj.id },
                include: { comments: true }
            });

            return {
                type: 'CommentsList',
                comments,
                count: comments.length
            };

        } catch (err) {
            console.error(err);
            return throwError(err);
        }

    }
};