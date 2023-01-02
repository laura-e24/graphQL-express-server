import { ApolloServer } from '@apollo/server';
// import { startStandaloneServer } from '@apollo/server/standalone';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

const people = [
  {
  "id": 1,
  "first_name": "Tina",
  "last_name": "Croci",
  "email": "tcroci0@paginegialle.it",
}, 
{
  "id": 2,
  "first_name": "Ginnifer",
  "last_name": "Slade",
  "email": "gslade1@fema.gov",
}, 
{
  "id": 3,
  "first_name": "Boycey",
  "last_name": "Livezey",
  "email": "blivezey2@gizmodo.com",
}, 
{
  "id": 4,
  "first_name": "Cristi",
  "last_name": "Tether",
  "email": "ctether3@msu.edu",
}, 
{
  "id": 5,
  "first_name": "Lucienne",
  "last_name": "Swinbourne",
  "email": "lswinbourne4@deliciousdays.com",
}]

// Required logic for integrating with Express
const app = express();

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Person {
    id: String
    first_name: String
    last_name: String
    email: String
    fullName: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    people: [Person]
    peopleCount: Int
    findPerson(last_name: String): Person
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    people: () => people,
    peopleCount: () => people.length,
    findPerson: (root, args) => {
      const { last_name } = args;
      return people.find(p => p.last_name === last_name)
    }
  },
  Person: {
    fullName: (root) => `${(root.last_name).toUpperCase()}, ${root.first_name}`
  }
};

// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Ensure we wait for our server to start
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
  '/',
  cors(),
  bodyParser.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, 
    // {context: async ({ req }) => ({ token: req.headers.token })}
  ),
);

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhost:4000/`);