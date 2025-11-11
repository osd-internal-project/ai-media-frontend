import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { axiosUser } from "@/app/lib/axios/axios";
export const authOptions = {
    providers: [
        CredentialsProvider({
            id: "username-login",
            name: "Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                type: { label: "Type", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }
                try {
                    const response = await axiosUser
                        .post(`${process.env.AUTH_BACKEND_URL}/auth/login`, {
                            username: credentials?.username,
                            password: credentials?.password,
                            type: credentials?.type,
                        })
                        .catch(() => {
                            // console.log(e);
                            return null;
                        });
                    // console.log("login response");
                    if (!response) {
                        return null;
                    }
                    const token = response.data;
                    const accessTokenExpires = Date.now() + 60 * 1000;
                    return { ...token, accessTokenExpires: accessTokenExpires };
                } catch (error) {
                    return error;
                }
            },
        }),
    ],
    session: {
        jwt: true,
        maxAge: 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            return { ...token, ...user };
        },
        async session({ session, token }: { session: any; token: any }) {
            // const authToken = await refreshAccessToken(session, token);
            const profile = jwt.decode(token.accessToken) as jwt.JwtPayload;
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.user = { ...profile };
            const permission = await axiosUser
                .get(`${process.env.AUTH_BACKEND_URL}/auth/permission/${profile.userId}`)
                .then((res: any) => {
                    return res.data;
                })
                .catch(() => {
                    // console.log(" error permission");
                    return null;
                });

            if (permission) {
                session.grouplist = permission.grouplist;
                session.rulelist = permission.rulelist;
            }
            session.error = token.error;
            return session;
        },
    },
    secret: `${process.env.NEXT_AUTH_SECRET_KEY}`,
    pages: {
        signIn: "/signin",
    },
};

// async function refreshAccessToken(session: any, token: any) {
//   try {
//     if (!session.refreshToken) {
//       const response = await axios.post(`${process.env.BACKEND_USER_URL}/auth/refresh`, {
//         refreshToken: token.refreshToken,
//       });
//       token.accessToken = response.data.accessToken;
//       token.refreshToken = response.data.refreshToken;
//       // const refreshedTokens = await response.json();

//       return {
//         ...token,
//         accessTokenExpires: Date.now() + 1 * 60 * 1000,
//       };
//     } else {
//       const response = await axios.post(`${process.env.BACKEND_USER_URL}/auth/refresh`, {
//         refreshToken: session.refreshToken,
//       });
//       token.accessToken = response.data.accessToken;
//       token.refreshToken = response.data.refreshToken;
//       // const refreshedTokens = await response.json();

//       return {
//         ...token,
//         accessTokenExpires: Date.now() + 1 * 60 * 1000,
//       };
//     }
//   } catch (error) {
//     return {
//       ...token,
//       error: "RefreshAccessTokenError",
//     };
//   }
// }
