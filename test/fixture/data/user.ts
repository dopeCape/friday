import { User, WithoutId } from "@/types";

export const testUserToBeCreated: WithoutId<User> = {
  name: "John Doe",
  clerkId: "123",
  email: "8U6lU@example.com",
  profileImage: "https://example.com/profile.jpg",
  stats: {
    level: "intermediate",
    stack: ["asdf"],
    os: "linux",
    knowsBasicCommands: true,
  }
}
export const testUser: User = {
  _id: "67f7bc13936315660e38e5e3",
  name: "John Doe",
  clerkId: "1234",
  email: "6lU@example.com",
  profileImage: "https://example.com/profile.jpg",
  stats: {
    level: "intermediate",
    stack: ["asdf"],
    os: "linux",
    knowsBasicCommands: true,
  }
}

export const testUserWithoutId: WithoutId<User> = {
  name: "John Doe",
  clerkId: "12346",
  email: "6lU@example.com",
  profileImage: "https://example.com/profile.jpg",
  stats: {
    level: "intermediate",
    stack: ["asdf"],
    os: "linux",
    knowsBasicCommands: true,
  }
}



