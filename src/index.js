const express = require('express');
const { createServer } = require('http');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { ApolloServer } = require('apollo-server-express');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { PubSub } = require('graphql-subscriptions');
const schema = require('./schema');
const firewall = require('./firewall');
const { prisma } = require('./prisma');

const app = express();
const PORT = process.env.PORT;

const httpServer = createServer(app);

const WSServer = new WebSocketServer({
    server: httpServer,
    path: '/'
});

const pubsub = new PubSub();

const serverCleanup = useServer({
    schema,
    async context(req) {
        const { user, token } = await firewall(req);
        return { prisma, pubsub, user, token };
    }
}, WSServer);

const apolloServer = new ApolloServer({
    schema,
    async context({ req }) {
        const { user, token } = await firewall(req);
        return { prisma, user, token, pubsub };
    },
    cache: 'bounded',
    persistedQueries: false,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    }
                };
            }
        }
    ]
});

const startServer = async () => {
    await apolloServer.start();

    apolloServer.applyMiddleware({ app, path: '/' });

    httpServer.listen(PORT, () => {
        console.log('Server is up on PORT: ', PORT);
    });
};

startServer();