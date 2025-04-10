export const envSchema = {
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
  PORT: {
    type: "string" as const,
    required: false,
    default: 6969,
  },
  MONGO_URI: {
    type: "string" as const,
    required: true,
    description:
      "connection string for mongodb, message @dopeCape to get one of your own.",
  },
  VER_TOKEN: {
    type: "string" as const,
    required: true,
    description:
      "api key for vercel rest api, get it from https://vercel.com/account/tokens, in scope seleted realply",
  },
  VER_ENDPOINT: {
    type: "url" as const,
    required: true,
    description: "vercel rest endpiont",
  },
  VER_TEAMID: {
    type: "string" as const,
    required: true,
    description: "team id for Realply, you can get it from team settings.",
  },
  VER_TEAM_SLUG: {
    type: "string" as const,
    required: true,
    description: "Team name from vercel, i.e Realply",
  },
  JWT_SECRET: {
    type: "string" as const,
    required: true,
    description:
      "Random jwt secret generated through open ssl, do not generate one of your own , jwt auth will fail.  ",
  },
  REDIS_HOST: {
    type: "string" as const,
    required: true,
    description: "Redis host , most likely localhost",
  },
  REDIS_PORT: {
    type: "number" as const,
    required: true,
  },

  OPENAI_API_KEY: {
    type: "string" as const,
    required: true,
    description: "openai api key, message @dopeCape to get one of your own.",
  },
  BACKGROUND_JOB_URL: {
    type: "string" as const,
    required: true,
    description:
      "background job url, when developing use hookdeck and set the lister url, other wise set it to the deployment url",
  },
  MERGENT_API_KEY: {
    type: "string" as const,
    required: true,
    description:
      "mergent api key, get from app.mergent.co, login with eng@mattyoungmedia.com and you will recive a magic login link ",
  },
  ENCRYPTION_KEY: {
    type: "string" as const,
    required: true,
    description:
      "encryption key for encrypting and decrypting envs for internal tool,get it from @dopeCape  ",
  },
  INTERNAL_TOOL_REPO_URL: {
    type: "string" as const,
    required: true,
    description: "Repository url for internal tool",
  },
  INTERNAL_TOOL_BRANCH: {
    type: "string" as const,
    required: true,
    description: "Branch name for the internal tool",
  },
  RESEND_API_KEY: {
    type: "string" as const,
    required: true,
    description: "Resend api key, get it from @dopeCape",
  },
  EMAIL_DOMAIN: {
    type: "string" as const,
    required: true,
    description: "email domain for realply",
  },
  ADMIN_EMAIL: {
    type: "string" as const,
    required: true,
    description: "This will be used for sending admin related eamils and stuff",
  },
  REAPLY_REPO_ID: {
    type: "string" as const,
    required: true,
    description: "Github repo id, dont even ask how to find it",
  },
  COMMON_EMAIL: {
    type: "string" as const,
    required: true,
    description:
      "This email will be used to send calendar invites and will attend calls with clients",
  },
  REFRESH_TOKEN: {
    type: "string" as const,
    required: true,
    description: "Refresh token for google calendar api, for the common email",
  },
  GOOGLE_CLIENT_ID: {
    type: "string" as const,
    required: true,
  },
  GOOGLE_CLIENT_SECRET: {
    type: "string" as const,
    required: true,
  },
  FIREFLIES_API_URL: {
    type: "url" as const,
    required: true,
  },
  FIREFLIES_API_TOKEN: {
    type: "string" as const,
    required: true,
  },
  LINKEDIN_CLIENT_ID: {
    type: "string" as const,
    required: true,
  },
  LINKEDIN_CLIENT_SECRET: {
    type: "string" as const,
    required: true,
  },
  AUTH_SECRET: {
    type: "string" as const,
    required: true,
  },
  RAPID_API_PROFILE_API_URL: {
    type: "string" as const,
    required: true,
  },
  RAPID_API_KEY: {
    type: "string" as const,
    required: true,
  },
  PINECONE_API_KEY: {
    type: "string" as const,
    required: true,
    description: "Pinecone api key, get it from @dopeCape",
  },
};
