## Error

```gql
type Error {
  code: String
  message: String!
}
```

## User

```gql
type AuthenticatedUser {
  id: ID!
  username: String!
  firstName: String!
  lastName: String!
  email: String!
  posts: PostsResult!
  comments: CommentsResult!
  token: String!
}

type LoggedOutUser {
  id: ID!
  username: String!
}

type User {
  id: ID!
  username: String!
  firstName: String!
  lastName: String!
  email: String!
  posts: PostsResult!
  comments: CommentsResult!
}

type DeletedUser {
  id: ID!
  username: String!
  firstName: String!
  lastName: String!
  email: String!
}
```

## Post

```gql
type Post {
  id: ID!
  title: String!
  description: String
  isPublished: Boolean!
  author: UserResult!
  comments: CommentsResult!
}

type DeletedPost {
  id: ID!
  title: String!
  description: String
}
```

## Comment

```gql
type Comment {
  id: ID!
  text: String!
  author: UserResult!
  post: PostResult!
}

type DeletedComment {
  id: ID!
  text: String!
}
```

## List Types

```gql
type PostsList {
  posts: [PostResult!]!
  count: Int!
}

type CommentsList {
  comments: [CommentResult!]!
  count: Int!
}

type UsersList {
  users: [UserResult!]!
  count: Int!
}
```

## Union

```gql
union AuthResult = AuthenticatedUser | LoggedOutUser | Error

union UserResult = User | DeletedUser | Error
union PostResult = Post | DeletedPost | Error
union CommentResult = Comment | DeletedComment | Error

union UsersResult = UsersList | Error
union PostsResult = PostsList | Error
union CommentsResult = CommentsList | Error

union PostsSubscriptionData = Post | DeletedPost | Error
union CommentsSubscriptionData = Comment | DeletedComment | Error
```

## Query

```gql
type Query {
  hello: String!
  allUsers: UsersResult!
  allPosts: PostsResult!
  allComments: CommentsResult!
  getUser(userId: ID): UserResult!
  getPost(postId: ID!): PostResult!
  getComment(commentId: ID!): CommentResult!
}
```

## Mutation

```gql
type Mutation {
  signup(input: SignupInput!): AuthResult!
  login(input: LoginInput!): AuthResult!
  logout: AuthResult!
  updateUser(input: UpdateUserInput!): UserResult!
  deleteUser: UserResult!

  createPost(input: CreatePostInput!): PostResult!
  updatePost(postId: ID!, input: UpdatePostInput!): PostResult!
  deletePost(postId: ID!): PostResult!

  createComment(postId: ID!, input: CreateCommentInput!): CommentResult!
  updateComment(commentId: ID!, input: UpdateCommentInput!): CommentResult!
  deleteComment(commentId: ID!): CommentResult!
}
```

## Subscription

```gql
type Subscription {
  posts(userId: ID!): PostsSubscriptionPayload!
  comments(postId: ID!): CommentsSubscriptionPayload!
}

enum MUTATION {
  CREATED
  UPDATED
  DELETED
}

type PostsSubscriptionPayload {
  mutation: MUTATION!
  data: PostsSubscriptionData!
}

type CommentsSubscriptionPayload {
  mutation: MUTATION!
  data: CommentsSubscriptionData!
}
```

## Input

```gql
input SignupInput {
  username: String!
  firstName: String!
  lastName: String!
  email: String!
  password: String!
}

input LoginInput {
  identity: String!
  password: String!
}

input UpdateUserInput {
  firstName: String
  lastName: String
  email: String
  username: String
}

input CreatePostInput {
  title: String!
  description: String!
  isPublished: Boolean!
}

input UpdatePostInput {
  title: String
  description: String
  isPublished: Boolean
}

input CreateCommentInput {
  text: String!
}

input UpdateCommentInput {
  text: String
}
```
