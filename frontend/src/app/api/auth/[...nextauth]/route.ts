import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

async function refreshAccessToken(token: any) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
      { refreshToken: token.refreshToken }
    );

    return {
      ...token,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (response.data && response.data.accessToken) {
            const { accessToken, refreshToken } = response.data;
            const decoded: any = jwtDecode(accessToken);

            return {
              id: decoded.id,
              name: decoded.name,
              email: decoded.sub,
              role: decoded.role,
              photo: decoded.photo,
              accessToken: accessToken,
              refreshToken: refreshToken,
            };
          }
          return null;
        } catch (error: any) {
          console.error("NextAuth authorize error:", error.response?.data || error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user && account) {
        return {
          accessToken: user.accessToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000,
          refreshToken: user.refreshToken,
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          photo: user.photo,
        };
      }

      if (trigger === "update" && session?.image) {
        token.photo = session.image;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.photo;
        session.user.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
