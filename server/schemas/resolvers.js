const { User, Book } = require('../models')
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    // getSingleUser
    // createUser
    // login
    // saveBook
    // deleteBook

    Query: {
        // getSingleUser
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')

                return userData;
            }
            throw new AuthenticationError('Not Logged In');
        }
    },

    Mutation: {
        // addUser
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        // login
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Credentials');
            }

            const token = signToken(user);
            return { token, user };
        },

        // saveBook
        saveBook: async (parent, { input }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { saveBooks: input } },
                    { new: true }
                );

                return updatedUser;
            }
            throw new AuthenticationError('You Need to Be Logged In')
        },

        // removeBook 
        removeBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { saveBooks: { bookId: args.bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You Need To Be Logged In')
        }
    }
};