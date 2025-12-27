/**
 * Custom NextAuth Adapter for .NET Backend
 * Implements the NextAuth Adapter interface to call .NET API endpoints
 * for user, account, session, and verification token management
 */
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters"
import axios, { AxiosInstance } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Create a dedicated axios instance for adapter (no auth interceptors needed)
const adapterClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export function DotNetAdapter(): Adapter {
  return {
    // Create user in .NET database
    async createUser(user: Omit<AdapterUser, "id">): Promise<AdapterUser> {
      const response = await adapterClient.post<AdapterUser>('/api/auth/users', user);
      return response.data;
    },

    // Get user by ID
    async getUser(id: string): Promise<AdapterUser | null> {
      try {
        const response = await adapterClient.get<AdapterUser>(`/api/auth/users/${id}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },

    // Get user by email
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      try {
        const response = await adapterClient.get<AdapterUser>(`/api/auth/users/by-email/${encodeURIComponent(email)}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },

    // Get user by OAuth account
    async getUserByAccount({ provider, providerAccountId }: {
      provider: string
      providerAccountId: string
    }): Promise<AdapterUser | null> {
      try {
        const response = await adapterClient.get<AdapterUser>('/api/auth/users/by-account', {
          params: { provider, providerAccountId }
        });
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },

    // Update user
    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">): Promise<AdapterUser> {
      const response = await adapterClient.put<AdapterUser>(`/api/auth/users/${user.id}`, user);
      return response.data;
    },

    // Delete user
    async deleteUser(id: string): Promise<void> {
      await adapterClient.delete(`/api/auth/users/${id}`);
    },

    // Link OAuth account to user
    async linkAccount(account: AdapterAccount): Promise<AdapterAccount | null | undefined> {
      const response = await adapterClient.post<AdapterAccount>('/api/auth/accounts', account);
      return response.data;
    },

    // Unlink OAuth account
    async unlinkAccount({ provider, providerAccountId }: {
      provider: string
      providerAccountId: string
    }): Promise<void> {
      await adapterClient.delete('/api/auth/accounts', {
        params: { provider, providerAccountId }
      });
    },

    // Create session
    async createSession(session: {
      sessionToken: string
      userId: string
      expires: Date
    }): Promise<AdapterSession> {
      const response = await adapterClient.post<AdapterSession>('/api/auth/sessions', {
        ...session,
        expires: session.expires.toISOString()
      });
      return {
        ...response.data,
        expires: new Date(response.data.expires)
      };
    },

    // Get session and user
    async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
      try {
        const response = await adapterClient.get<{ session: AdapterSession; user: AdapterUser }>(
          `/api/auth/sessions/${sessionToken}`
        );
        return {
          session: {
            ...response.data.session,
            expires: new Date(response.data.session.expires)
          },
          user: response.data.user
        };
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },

    // Update session
    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">): Promise<AdapterSession | null | undefined> {
      try {
        const response = await adapterClient.put<AdapterSession>(
          `/api/auth/sessions/${session.sessionToken}`,
          {
            ...session,
            expires: session.expires?.toISOString()
          }
        );
        return {
          ...response.data,
          expires: new Date(response.data.expires)
        };
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },

    // Delete session
    async deleteSession(sessionToken: string): Promise<void> {
      await adapterClient.delete(`/api/auth/sessions/${sessionToken}`);
    },

    // Create verification token
    async createVerificationToken(verificationToken: VerificationToken): Promise<VerificationToken | null | undefined> {
      const response = await adapterClient.post<VerificationToken>(
        '/api/auth/verification-tokens',
        {
          ...verificationToken,
          expires: verificationToken.expires.toISOString()
        }
      );
      return {
        ...response.data,
        expires: new Date(response.data.expires)
      };
    },

    // Use (consume) verification token
    async useVerificationToken({ identifier, token }: {
      identifier: string
      token: string
    }): Promise<VerificationToken | null> {
      try {
        const response = await adapterClient.delete<VerificationToken>(
          '/api/auth/verification-tokens',
          {
            params: { identifier, token }
          }
        );
        return {
          ...response.data,
          expires: new Date(response.data.expires)
        };
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
      }
    },
  }
}
