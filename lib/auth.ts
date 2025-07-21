import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import clientPromise from './mongodb';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Check for admin login
        if (credentials.email === 'test@example.com' && credentials.password === 'Password@1234') {
          return {
            id: 'admin',
            email: 'test@example.com',
            name: 'Administrator',
            userType: 'admin',
          };
        }
        const client = await clientPromise;
        const db = client.db('autodoc_ai');
        
        const user = await db.collection('users').findOne({
          email: credentials.email
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          userType: user.userType,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = (user as any).userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub;
        (session.user as any).userType = token.userType;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
