import UserService from "@/lib/services/user.service";
import { beforeAll, beforeEach, describe, expect, Mock, test, vi, } from "vitest";
import { Logger as AxiomLogger } from '@/lib/services/logger.service';
import { Logger } from "@/types"
import { testUser, testUserWithoutId } from "../../fixture/data/user";
import UserRepository from "@/lib/repository/mongoose/user.mongoose.repository";


vi.mock('@/lib/repository/mongoose/user.mongoose.repository', async () => {
  const mockUserRepository = {
    create: vi.fn().mockImplementation((user) => Promise.resolve({ ...user })),
    get: vi.fn().mockImplementation((data: { email: string }) => {
      const { email } = data;
      if (email.includes("true")) {
        return true;
      }
      return false
    }),
    delete: vi.fn().mockImplementation((filter: { email: string }) => {
      if (filter.email.includes("exists")) {
        return testUser
      }
      return null
    }),
  };
  return {
    default: {
      getInstance: (logger: Logger) => mockUserRepository
    },
    UserRepository: {
      getInstance: (logger: Logger) => mockUserRepository
    }
  };
});


vi.mock('@/lib/services/logger.service', () => {
  const mockLogger = {
    error: vi.fn().mockImplementation((error, metadata) => {
      console.error(metadata);
    }),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
  return {
    Logger: {
      getInstance: () => mockLogger
    }
  };
});



describe("User Service Tests", () => {
  let loggerMock: Logger;
  let userService: UserService;
  let userRepositoryMock: UserRepository
  beforeAll(async () => {
    loggerMock = AxiomLogger.getInstance();
    userRepositoryMock = UserRepository.getInstance(loggerMock);
    userService = UserService.getInstance(loggerMock, userRepositoryMock);
  });
  beforeEach(async () => {
    vi.clearAllMocks();
  });


  describe(".createUser()", async () => {

    test("should create a user successfully", async () => {
      const user = await userService.createUser(testUserWithoutId);
      expect(user.name).toEqual(testUserWithoutId.name);
      expect(loggerMock.info).toHaveBeenCalledTimes(0);
    });
    test("should create a user successfully, when _id is present in user", async () => {
      const user = await userService.createUser(testUser);
      expect(user.name).toEqual(testUser.name);
      expect(loggerMock.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe(".checkIfUserExists()", async () => {
    test("Should return true if user exists", async () => {
      const result = await userService.checkIfUserExists("true");
      expect(result).toEqual(true);
      expect(loggerMock.info).toHaveBeenCalledTimes(1);
    });

    test("Should return false if user does not exists", async () => {
      const result = await userService.checkIfUserExists("false");
      expect(result).toEqual(false);
      expect(loggerMock.info).toHaveBeenCalledTimes(1);
    })
  })

  describe(".deleteUser()", async () => {
    test("Should return the deleted user if user exists", async () => {
      const result = await userService.deleteUser("exists@x.com");
      expect(result).toMatchObject(testUser);
    })

    test("Should return false if user does not exists", async () => {
      const result = await userService.deleteUser("asdfasdf@x.com");
      expect(result).toEqual(null);
    })
  })

  describe(".deleteUserWithClerkId()", async () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      (userRepositoryMock.delete as Mock).mockImplementation((filter) => {
        if (filter.clerkId.includes("exists")) {
          return testUser
        }
        return null
      });
    })
    test("Should return the deleted user if user exists", async () => {
      const result = await userService.deleteUserWithClerkId("exists");
      expect(result).toMatchObject(testUser);
    })

    test("Should return false if user does not exists", async () => {
      const result = await userService.deleteUserWithClerkId("doesNotEsists");
      expect(result).toEqual(null);
    })
  })
});
