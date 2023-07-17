const { filterUser, filterPost } = require('../prisma');
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

            const { author } = await prisma.comment.findUnique({
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
    async post(obj, _, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            if (obj.post) {
                if (obj.post.type) {
                    return {
                        type: 'Post',
                        ...filterPost(obj.post)
                    };
                }

                return obj.post;
            }

            const { post } = await prisma.comment.findUnique({
                where: { id: obj.id },
                include: { post: true }
            });

            return {
                type: 'Post',
                ...filterPost(post)
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    }
};