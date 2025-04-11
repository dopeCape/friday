import { User } from "@/types";

export const testUserToBeCreated: User = {
  name: "John Doe",
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
  email: "6lU@example.com",
  profileImage: "https://example.com/profile.jpg",
  stats: {
    level: "intermediate",
    stack: ["asdf"],
    os: "linux",
    knowsBasicCommands: true,
  }
}

export const testUserWithoutId: User = {
  name: "John Doe",
  email: "6lU@example.com",
  profileImage: "https://example.com/profile.jpg",
  stats: {
    level: "intermediate",
    stack: ["asdf"],
    os: "linux",
    knowsBasicCommands: true,
  }
}



