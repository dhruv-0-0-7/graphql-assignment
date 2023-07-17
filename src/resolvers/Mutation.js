const { filterUser, filterPost, filterComment } = require('../prisma');
const { throwError, throwAuthorizationError, generateAuthToken, verifyPassword, hashPassword } = require('../utils');

const Mutation = {
    async signup(_, { input }, { prisma }) {
        try {
            let userExists = await prisma.user.findUnique({ where: { username: input.username } });

            if (userExists) return throwError({
                message: 'Username already exists'
            });

            userExists = await prisma.user.findUnique({ where: { email: input.email } });

            if (userExists) return throwError({
                message: 'Email already exists'
            });

            input.password = await hashPassword(input.password);

            let user = await prisma.user.create({
                data: input
            });

            const token = generateAuthToken(user.id);

            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    tokens: { push: token }
                }
            });

            return {
                type: 'AuthenticatedUser',
                ...filterUser(user),
                posts: {
                    type: 'PostsList',
                    posts: [],
                    count: 0
                },
                comments: {
                    type: 'CommentsList',
                    comments: [],
                    count: 0
                },
                token
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async login(_, { input }, { prisma }) {
        try {
            let userExists = await prisma.user.findFirst({ where: { OR: [{ username: input.identity }, { email: input.identity }] } });

            if (!userExists) return throwError({
                message: 'User not found'
            });

            const isValid = await verifyPassword(input.password, userExists.password);

            if (!isValid) return throwError({
                message: 'Invalid credentials'
            });

            const token = generateAuthToken(userExists.id);

            const user = await prisma.user.update({
                where: {
                    id: userExists.id
                },
                data: {
                    tokens: { push: token }
                }
            });

            return {
                type: 'AuthenticatedUser',
                ...filterUser(user),
                token
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async logout(_, __, { prisma, user, token }) {
        try {
            if (!user) return throwAuthorizationError();

            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    tokens: user.tokens.filter(t => t !== token)
                }
            });

            return {
                type: 'LoggedOutUser',
                id: user.id,
                username: user.username
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async updateUser(_, { input }, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            user = await prisma.user.update({
                where: { id: user.id },
                data: input,
                include: {
                    posts: true,
                    comments: true
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
    async deleteUser(_, __, { prisma, user }) {
        try {
            if (!user) return throwAuthorizationError();

            user = await prisma.user.delete({ where: { id: user.id } });

            return {
                type: 'DeletedUser',
                ...user
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async createPost(_, { input }, { prisma, user, pubsub }) {
        try {
            if (!user) return throwAuthorizationError();

            const post = await prisma.post.create({
                data: {
                    ...input,
                    author: { connect: { id: user.id } }
                },
                include: { author: true }
            });

            pubsub.publish(`posts-${user.id}`, {
                mutation: 'CREATED',
                data: {
                    type: 'Post',
                    ...filterPost(post)
                }
            });

            return {
                type: 'Post',
                ...filterPost(post),
                comments: {
                    type: 'CommentsList',
                    comments: [],
                    count: 0
                }
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async updatePost(_, { postId, input }, { prisma, user, pubsub }) {
        try {
            if (!user) return throwAuthorizationError();

            const postExists = await prisma.post.count({
                where: {
                    id: postId,
                    authorId: user.id
                }
            });

            if (!postExists) return throwError({
                code: '404',
                message: 'Post not found'
            });

            const post = await prisma.post.update({
                where: { id: postId },
                data: input,
                include: {
                    author: true,
                    comments: true
                }
            });

            pubsub.publish(`posts-${user.id}`, {
                mutation: 'UPDATED',
                data: {
                    type: 'Post',
                    ...filterPost(post)
                }
            });

            return {
                type: 'Post',
                ...filterPost(post)
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async deletePost(_, { postId }, { prisma, user, pubsub }) {
        try {
            if (!user) return throwAuthorizationError();

            const postExists = await prisma.post.count({
                where: {
                    id: postId,
                    authorId: user.id
                }
            });

            if (!postExists) return throwError({
                code: '404',
                message: 'Post not found'
            });

            const post = await prisma.post.delete({
                where: { id: postId }
            });

            pubsub.publish(`posts-${user.id}`, {
                mutation: 'DELETED',
                data: {
                    type: 'DeletedPost',
                    ...filterPost(post)
                }
            });

            return {
                type: 'DeletedPost',
                ...post
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async createComment(_, { postId, input }, { prisma, user, pubsub }) {
        try {
            if (!user) return throwAuthorizationError();

            const postPublished = await prisma.post.count({
                where: {
                    id: postId,
                    isPublished: true
                }
            });

            if (!postPublished) return throwError({
                code: '404',
                message: 'Post not found'
            });

            const comment = await prisma.comment.create({
                data: {
                    ...input,
                    author: { connect: { id: user.id } },
                    post: { connect: { id: postId } }
                }
            });

            pubsub.publish(`comments-${postId}`, {
                mutation: 'CREATED',
                data: {
                    type: 'Comment',
                    ...filterComment(comment)
                }
            });

            return {
                type: 'Comment',
                ...filterComment(comment),
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async updateComment(_, { commentId, input }, { prisma, user, pubsub }) {
        try {
            if (!user) return throwAuthorizationError();

            const commentExists = await prisma.comment.count({
                where: {
                    id: commentId,
                    authorId: user.id,
                    post: {
                        isPublished: true
                    }
                }
            });

            if (!commentExists) return throwError({
                code: '404',
                message: 'Comment not found'
            });

            const comment = await prisma.comment.update({
                where: { id: commentId },
                data: input,
                include: {
                    author: true,
                    post: true
                }
            });

            pubsub.publish(`comments-${comment.post.id}`, {
                mutation: 'UPDATED',
                data: {
                    type: 'Comment',
                    ...filterComment(comment)
                }
            });

            return {
                type: 'Comment',
                ...filterComment(comment)
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    },
    async deleteComment(_, { commentId }, { prisma, user, pubsub }) {
        try {
            if (!user) return throwAuthorizationError();

            const commentExists = await prisma.comment.count({
                where: {
                    id: commentId,
                    authorId: user.id,
                    post: {
                        isPublished: true
                    }
                }
            });

            if (!commentExists) return throwError({
                code: '404',
                message: 'Comment not found'
            });

            const comment = await prisma.comment.delete({ where: { id: commentId } });

            pubsub.publish(`comments-${comment.post.id}`, {
                mutation: 'DELETED',
                data: {
                    type: 'DeletedComment',
                    ...filterComment(comment)
                }
            });

            return {
                type: 'DeletedComment',
                ...comment
            };
        } catch (err) {
            console.error(err);
            return throwError(err);
        }
    }
};

module.exports = Mutation;