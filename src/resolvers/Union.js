const { isTypeError } = require('../utils');

const Union = {
    AuthResult: {
        __resolveType(obj) {
            if (obj.type) return obj.type;
            return isTypeError(obj) ? 'Error' : 'AuthenticatedUser';
        }
    },
    UserResult: {
        __resolveType(obj) {
            if (obj.type) return obj.type;
            return isTypeError(obj) ? 'Error' : 'User';
        }
    },
    PostResult: {
        __resolveType(obj) {
            if (obj.type) return obj.type;
            return isTypeError(obj) ? 'Error' : 'Post';
        }
    },
    CommentResult: {
        __resolveType(obj) {
            if (obj.type) return obj.type;
            return isTypeError(obj) ? 'Error' : 'Comment';
        }
    },
    UsersResult: {
        __resolveType(obj) {
            if (obj.type) return obj.type;
            return isTypeError(obj) ? 'Error' : 'UsersList';
        }
    },
    PostsResult: {
        __resolveType(obj) {
            if (obj.type) return obj.type;
            return isTypeError(obj) ? 'Error' : 'PostsList';
        }
    },
    CommentsResult: {
        __resolveType(obj) {
            if (obj.type) return obj.type;
            return isTypeError(obj) ? 'Error' : 'CommentsList';
        }
    },
    PostsSubscriptionData: {
        __resolveType: obj => obj.type
    },
    CommentsSubscriptionData: {
        __resolveType: obj => obj.type
    }
};

module.exports = Union;