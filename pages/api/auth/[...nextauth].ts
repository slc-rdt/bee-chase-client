import axios from 'axios';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt_decode from 'jwt-decode';
import { SessionUser } from '../../../models/SessionUser';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credential',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        try {
          const { username, password } = credentials as any;
          if (!username || !password) {
            throw new Error('Username and password must be filled');
          }

          const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
          const API_URL = `${BASE_API_URL}/auth/login`;
          const response = await axios.post(API_URL, { username, password });
          const user: SessionUser = response.data;

          return user;
        } catch (e) {
          console.log(e);
          throw e;
        }
      },
    }),
  ],
  jwt: {
    maxAge: 1 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
});
