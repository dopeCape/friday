import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { clearCollection, connectToTestDb, disconnectToTestDb } from "../../../fixture/utils/testDatabase";
import UserRepository from "@/lib/repository/mongoose/user.mongoose.repository";
import { Logger as AxiomLogger } from '@/lib/services/logger.service';
import { Logger, User } from "@/types"
import { testUser, testUserToBeCreated } from "../../../fixture/data/user";
import mongoose from "mongoose";

vi.mock('@/lib/services/logger.service', () => {
  const mockLogger = {
    error: vi.fn(),
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

describe("User Repository Tests", () => {
  let loggerMock: Logger;
  let userRepository: ReturnType<typeof UserRepository.getInstance>;
  const testUserId = "67f7bc13936315660e38e5e3"
  beforeAll(async () => {
    await connectToTestDb();
    loggerMock = AxiomLogger.getInstance();
    userRepository = UserRepository.getInstance(loggerMock);
    await mongoose.models["user"].create(testUser)
  });

  beforeEach(async () => {
    vi.clearAllMocks();
  });
  afterEach(async () => {
    await clearCollection("user");
    await mongoose.models["user"].create(testUser)
  })
  afterAll(async () => {
    await clearCollection("user");
    await disconnectToTestDb();
  });


  describe("get() method suit", async () => {
    test("should get user, if the user exists", async () => {
      const user = await userRepository.get({ _id: testUserId });
      expect(user).not.toBeNull()
    });
    test("Should return null if user does not exists", async () => {
      const user = await userRepository.get({ _id: "67f7bc13936315660e38e5e4" });
      expect(user).toBeNull()
    })
    test("Check if projection works", async () => {
      const user = await userRepository.get({ _id: testUserId }, { email: 1 });
      expect(user?.profileImage).toBeUndefined();
    })
    test("Should handle invalid Object Id gracefully", async () => {
      await expect(userRepository.get({ _id: "sasdfasdf" })).rejects.toThrow();
    })
  })
  test("should create a user successfully", async () => {
    const user = await userRepository.create(testUserToBeCreated);
    expect(user.name).toEqual(testUser.name);
    expect(loggerMock.info).toHaveBeenCalled();
  });

  test("should delete the user, when the user exists", async () => {
    const user = (await userRepository.delete({ _id: testUserId })) as User;
    expect(user.name).toEqual(testUser.name);
    expect(loggerMock.info).toHaveBeenCalledTimes(2);
  })

  test("should return null, when the user does not exists ", async () => {
    const user = (await userRepository.delete({ _id: "67f7bc13936315660e38e5e6" })) as User;
    expect(user).toBeNull();
    expect(loggerMock.info).toHaveBeenCalledTimes(1);
    expect(loggerMock.warn).toHaveBeenCalledTimes(1);
  });
});
