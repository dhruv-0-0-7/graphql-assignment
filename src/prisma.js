const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const filterUser = (user) => {
    delete user.tokens;
    delete user.password;

    user.posts && (user.posts = {
        type: 'PostsList',
        posts: user.posts,
        count: user.posts.length
    });

    user.comments && (user.comments = {
        type: 'CommentsList',
        comments: user.comments,
        count: user.comments.length
    });

    return user;
};

const filterPost = (post) => {
    post.author && (post.author = {
        type: 'User',
        ...filterUser(post.author)
    });

    post.comments && (post.comments = {
        type: 'CommentsList',
        comments: post.comments,
        count: post.comments.length
    });

    return post;
};

const filterComment = (comment) => {
    comment.author && (comment.author = {
        type: 'User',
        ...filterUser(comment.author)
    });

    comment.post && (comment.post = {
        type: 'Post',
        ...filterPost(comment.post)
    });

    return comment;
};

module.exports = {
    prisma,
    filterUser,
    filterPost,
    filterComment
};