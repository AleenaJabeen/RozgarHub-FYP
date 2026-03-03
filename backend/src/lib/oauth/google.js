import { Google } from "arctic";

export const google=new Google(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5173/google/callback"
// we wil create this rouute to verify after login
)