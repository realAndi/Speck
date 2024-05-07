import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

export const onUserCreated =
    functions.https.onCall(async (data, context) => {
      const {uid, email, firstName, lastName, base64ProfilePicture} = data;

      try {
        // Upload the profile picture to Firebase Storage
        let avatarUrl = "";
        if (base64ProfilePicture) {
          const bucket = storage.bucket();
          const profilePicturePath =
            `users/${uid}/profile/${Date.now()}.jpg`;
          const file = bucket.file(profilePicturePath);

          const buffer = Buffer.from(base64ProfilePicture, "base64");
          await file.save(buffer, {
            metadata: {
              contentType: "image/jpeg",
            },
          });

          // Wait for the extension to convert the image to WebP format
          await new Promise((resolve) =>
            setTimeout(resolve, 5000));

          // Get the URL of the converted WebP image
          const webpProfilePicturePath =
            profilePicturePath.replace(/\.jpg$/, ".webp");
          const webpFile = bucket.file(webpProfilePicturePath);
          const [metadata] = await webpFile.getMetadata();
          avatarUrl = metadata.mediaLink;
        }

        // Store the user data in Firestore
        await db.collection("users").doc(uid).set({
          firstName,
          lastName,
          email,
          avatarUrl,
          organizations: [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`User ${uid} created and data stored successfully.`);
      } catch (error) {
        console.error("Error storing user data:", error);
      }
    });
