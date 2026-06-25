import { config } from "dotenv";
import path from "path";
import { vi } from "vitest";

// Load environment variables from .env file
config({
  path: path.resolve(__dirname, ".env"),
});

// Mock Next.js config
vi.mock("next/config", () => ({
  __esModule: true,
  default: () => ({
    serverRuntimeConfig: {},
    publicRuntimeConfig: {},
  }),
}));
