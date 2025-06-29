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
  TAVILY_API_KEY: {
    type: "string" as const,
    required: true,
    description: "tavilya api key",
    transform: (value: string) => { return value.split(",") }
  },
  PINECONE_API_KEY: {
    type: "string" as const,
    required: true,
    description: "Pinecone api key",
  },
  ICONS_PINECONE_INDEX: {
    type: "string" as const,
    required: true,
    description: "Index name for icons saved in pinecone",
  },
  VIDEO_PINEONE_INDEX: {
    type: "string" as const,
    required: true,
    description: "Index name for videos saved in pinecone",
  },
  MEME_PINECONE_INDEX: {
    type: "string" as const,
    required: true,
    description: "Index name for memes saved in pinecone",
  },
  DEFAULT_EMBEDDING_MODEL: {
    type: "string" as const,
    required: true,
    description: "Default embedding model for embedding service",
  },
  IMGFLIP_USERNAME: {
    type: "string" as const,
    required: true,
    description: "username for imgflip",
  },
  IMGFLIP_PASSWORD: {
    type: "string" as const,
    required: true,
    description: "password for imgflip",
  },


  // GEMINI_API_KEY: {
  //   type: "string" as const,
  //   required: true,
  //   description: "gemini api key",
  // }


};

export default envSchema
