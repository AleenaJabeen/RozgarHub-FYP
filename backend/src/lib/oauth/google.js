import { Google } from "arctic";


const google_client_id=process.env.GOOGLE_CLIENT_ID;
const google_client_secret=process.env.GOOGLE_CLIENT_SECRET;

export const google=new Google(
    google_client_id,
    google_client_secret, 
    `https://rozgarhub-fyp.onrender.com/api/v1/auth/google/callback`
// we wil create this route to verify after login
)