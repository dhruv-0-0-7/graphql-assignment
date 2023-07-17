const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { loadSchemaSync } = require('@graphql-tools/load');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
const Post = require('./resolvers/Post');
const Comment = require('./resolvers/Comment');
const Union = require('./resolvers/Union');
const Subscription = require('./resolvers/Subscription');

const typeDefs = loadSchemaSync('src/typeDefs/*.graphql', {
    loaders: [new GraphQLFileLoader()]
});

const resolvers = {
    Query,
    Mutation,
    User,
    Post,
    Comment,
    Subscription,
    ...Union
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;