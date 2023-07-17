const { throwAuthorizationError, throwError } = require('../utils');

module.exports = {
    async posts(obj, _, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            if (obj.posts) {
                if (obj.posts instanceof Array) {
                    return {
                        type: 'PostsList',
                        posts: obj.posts,
                        count: obj.posts.length
                    };
                }

                return obj.posts;
            }

            const { posts } = await prisma.user.findUnique(({
                where: { id: user.id },
                include: { posts: true }
            }));

            return {
                type: 'PostsList',
                posts,
                count: posts.length
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

            const { comments } = await prisma.user.findUnique({
                where: { id: user.id },
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