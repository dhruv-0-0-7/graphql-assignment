const { prisma, filterUser, filterPost, filterComment } = require('../prisma');
const { throwError, throwAuthorizationError } = require('../utils');

const Query = {
    hello() {
        return 'Hello World';
    },
    async allUsers() {
        try {
            const users = await prisma.user.findMany({ include: { posts: true, comments: true } });

            return {
                type: 'UsersList',
                users,
                count: users.length
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async allPosts() {
        try {
            const posts = await prisma.post.findMany();

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
    async allComments() {
        try {
            const comments = await prisma.comment.findMany();

            return {
                type: 'CommentsList',
                comments,
                count: comments.length
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async getUser(_, { userId }, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            user = await prisma.user.findUnique({
                where: { id: userId ?? user.id },
                include: {
                    posts: !userId ? true : (
                        (userId === user.id) ? true : { where: { isPublished: true } }
                    ),
                    comments: !userId ? true : (
                        userId === user.id ? true : { where: { post: { isPublished: true } } }
                    )
                }
            });

            return {
                type: 'User',
                ...filterUser(user)
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async getPost(_, { postId }, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: { author: true, comments: true }
            });

            if (!post) return throwError({
                code: '404',
                message: 'Post not found'
            });

            if (!post.isPublished) {
                if (user.id !== post.authorId) return throwError({
                    code: '404',
                    message: 'Post not found'
                });
            }

            return {
                type: 'Post',
                ...filterPost(post)
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async getComment(_, { commentId }, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
                include: { post: true, author: true }
            });

            if (!comment) return throwError({
                code: '404',
                message: 'Comment not found'
            });

            if (!comment.post.isPublished) {
                if (user.id === comment.post.authorId) return {
                    type: 'Comment',
                    ...filterComment(comment)
                };
                return throwError({
                    code: '404',
                    message: 'Comment not found'
                });
            }

            return {
                type: 'Comment',
                ...filterComment(comment)
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    }
};

module.exports = Query;