import React, { createContext, useContext } from "react";
import { User } from "@/lib/types";

const MOCK_USER: User = {
  id: "user-123",
  name: "Jane Doe",
  email: "jane.doe@example.com",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
};

interface UserContextType {
  currentUser: User;
  getCurrentUser: () => User;
  isCurrentUser: (userId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const getCurrentUser = () => MOCK_USER;
  const isCurrentUser = (userId: string) => userId === MOCK_USER.id;

  return (
    <UserContext.Provider
      value={{ currentUser: MOCK_USER, getCurrentUser, isCurrentUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
