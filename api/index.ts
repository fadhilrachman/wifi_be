import app from "../src/app";

// Standard Vercel Node handler that delegates to Express
export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
