const { throwAuthorizationError, throwError } = require('../utils');

module.exports = {
    posts: {
        async subscribe(_, { userId }, { pubsub, prisma, user }) {
            try {
                if (!user) return throwAuthorizationError();

                if (user.id === userId) throw new Error('You cannot subscribe to your own posts');

                user = await prisma.user.count({ where: { id: userId } });

                if (!user) throw new Error('User not found');

                return pubsub.asyncIterator(`posts-${userId}`);
            } catch (err) {
                console.error(err);
                throw err;
            }
        },
        resolve: payload => payload

    },
    comments: {
        async subscribe(_, { postId }, { pubsub, prisma, user }) {
            try {
                if (!user) return throwAuthorizationError();

                const post = await prisma.post.count({ where: { id: postId } });

                if (!post) return throwError({
                    code: '404',
                    message: 'Post not found'
                });

                return pubsub.asyncIterator(`comments-${postId}`);
            } catch (err) {
                console.error(err);
                return throwError(err);
            }
        },
        resolve: payload => payload
    }
};