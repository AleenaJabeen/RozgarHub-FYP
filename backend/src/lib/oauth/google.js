import { Google } from "arctic";


const google_client_id=process.env.GOOGLE_CLIENT_ID;
const google_client_secret=process.env.GOOGLE_CLIENT_SECRET;

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const google=new Google(
    google_client_id,
    google_client_secret, 
    `${BASE_URL}/api/v1/auth/google/callback`
)