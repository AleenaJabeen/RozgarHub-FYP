import admin from "../config/firebaseAdmin.js";
import { User } from "../models/user.model.js";

export const sendPushNotification = async ({
  userId,
  title,
  body,
  data = {},
}) => {
  try {
    const user = await User.findById(userId);

    if (!user?.fcmTokens?.length) {
      console.log("No FCM tokens found");
      return;
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens: user.fcmTokens,

      data: {
        title,
        body,
        ...Object.entries(data).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {}),
      },
    });
    console.log("FCM RESPONSE:", response);
    response.responses.forEach(async (resp, idx) => {
      if (!resp.success) {
        console.error("FCM Error:", resp.error);

        // remove invalid token
        if (resp.error.code === "messaging/registration-token-not-registered") {
          const invalidToken = user.fcmTokens[idx];

          await User.findByIdAndUpdate(userId, {
            $pull: {
              fcmTokens: invalidToken,
            },
          });

          console.log("Removed invalid token:", invalidToken);
        }
      }
    });
  } catch (error) {
    console.error("Push notification error:", error);
  }
};