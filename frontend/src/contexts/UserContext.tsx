import React, { createContext, useContext } from "react";
import { UserDto } from "@/lib/types";

const MOCK_USER: UserDto = {
  id: "user-123",
  name: "Jane Doe",
  email: "jane.doe@example.com",
  phoneNumber: "+254700000000",
  image: "https://randomuser.me/api/portraits/women/44.jpg",
  verified: false,
  createdAt: new Date().toISOString(),
};

interface UserContextType {
  currentUser: UserDto;
  getCurrentUser: () => UserDto;
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
