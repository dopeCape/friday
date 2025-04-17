const envSchema = {
  IS_TEJAS_STUPID: {
    required: true,
    type: "boolean" as const,
    description:
      "This is the most important env of all, nothing will work without this. very very important. and the value should always be true. ",
  },
  NODE_ENV: {
    type: "enum" as const,
    required: true,
    default: "development",
    enum: ["development", "production", "test", "staging"],
  },
  AXIOM_TOKEN: {
    type: "string" as const,
    required: true,
  },
  AXIOM_DATASET: {
    type: "string" as const,
    required: true,
  },
  MONGO_URI: {
    type: "string" as const,
    required: true,
    description:
      "connection string for mongodb.",
  },
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
    type: "string" as const,
    required: true,
    description:
      "Clerk public key ",
  },
  CLERK_SECRET_KEY: {
    type: "string" as const,
    required: true,
    description:
      "Clerk secret key",
  },
  CLERK_WEBHOOK_SIGNING_SECRET: {
    type: "string" as const,
    required: true,
    description:
      "Signing secret for clerk webhooks",

  },
  OPENAI_API_KEY: {
    type: "string" as const,
    required: true,
    description: "openai api key",
  },
  // GEMINI_API_KEY: {
  //   type: "string" as const,
  //   required: true,
  //   description: "gemini api key",
  // }


  // REDIS_HOST: {
  //   type: "string" as const,
  //   required: true,
  //   description: "Redis host , most likely localhost",
  // },
  // REDIS_PORT: {
  //   type: "number" as const,
  //   required: true,
  // },
  // BACKGROUND_JOB_URL: {
  //   type: "string" as const,
  //   required: true,
  //   description:
  //     "background job url, when developing use hookdeck and set the lister url, other wise set it to the deployment url",
  // },
  // MERGENT_API_KEY: {
  //   type: "string" as const,
  //   required: true,
  //   description:
  //     "mergent api key",
  // },
  // PINECONE_API_KEY: {
  //   type: "string" as const,
  //   required: true,
  //   description: "Pinecone api key",
  // },
};

export default envSchema
