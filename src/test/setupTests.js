import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

if (!process.env.VITE_GNEWS_API_KEY) {
  process.env.VITE_GNEWS_API_KEY = "jest-test-gnews-key";
}

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}
