const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const app = express();
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLScalarType
} = require('graphql')

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represent an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) }, 
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represent a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) }, 
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve : (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'Single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id )
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of all books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'An author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a Book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }

            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId };
                books.push(book);
                return book
            }
        },
        UpdateBook: {
            type: BookType,
            description: 'Update a Book',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt)},
                name: { type: GraphQLString },
                authorId: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                const id = args.id;
                if(args.name) {
                    books[id-1].name = args.name
                }
                if(args.authorId) {
                    book[id-1].authorId = args.authorId
                }
                return books.find(book => book.id === id)
            }
        },
        DeleteBook: {
            type: BookType,
            description: 'Delete an Book',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const id = args.id;
                books.splice(id-1,1);
                for(var i = id-1;i < books.length; i++){
                    books[i].id = books[i].id - 1; 
                }
            }
        },
        addAuthor: {
            type: AuthorType,
            description:'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name };
                authors.push(author);
                return author
            }
        },
        UpdateAuthor: {
            type: AuthorType,
            description: 'Update an Author',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt)},
                name: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                const id = args.id;
                if(args.name) {
                    authors[id-1].name = args.name
                }
                return authors.find(author => author.id === id)
            }
        },
        DeleteAuthor: {
            type: AuthorType,
            description: 'Delete an Author',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const id = args.id;
                authors.splice(id-1,1);
                for(var i = id-1;i < authors.length; i++){
                    authors[i].id = authors[i].id - 1; 
                }
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(3000, () => {
    console.log('server is running!!');
});

