import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

export const joinOrganization =
  functions.https.onCall(async (data, context) => {
    const {code, userId} = data;

    if (!code || typeof code !== "string") {
      throw new functions.https.HttpsError("invalid-argument",
        "Code must be a non-empty string");
    }

    if (!userId || typeof userId !== "string") {
      throw new functions.https.HttpsError("invalid-argument",
        "User ID must be a non-empty string");
    }

    try {
      const orgSnapshot = await db.collection("organizations")
        .where("inviteCode", "==", code).get();
      if (orgSnapshot.empty) {
        throw new functions.https.HttpsError("not-found",
          "Organization not found");
      }

      const orgRef = orgSnapshot.docs[0].ref;
      await orgRef.collection("members").doc(userId).set({
        role: "member",
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection("users").doc(userId).update({
        organizations: admin.firestore.FieldValue.arrayUnion(orgRef),
      });

      return {organizationId: orgRef.id};
    } catch (error) {
      console.error("Error joining organization:", error);
      throw new functions.https.HttpsError("internal",
        "Error joining organization");
    }
  });

/**
 * Generates a unique alphanumeric code of the specified length.
 * @param {number} [length=8] - The length of the code to generate.
 * @return {string} The generated unique code.
 */
function generateUniqueCode(length = 8) {
  const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const generateInviteCode =
  functions.https.onCall(async (data, context) => {
    const {organizationId, uid} = data;

    if (!organizationId || typeof organizationId !== "string") {
      throw new functions.https.HttpsError("invalid-argument",
        "organizationId must be a non-empty string");
    }

    if (!uid || typeof uid !== "string") {
      throw new functions.https.HttpsError("invalid-argument",
        "uid must be a non-empty string");
    }

    try {
      const inviteCode = generateUniqueCode();
      const orgRef = db.collection("organizations").doc(organizationId);

      // Check if the organization exists
      const orgSnapshot = await orgRef.get();
      if (!orgSnapshot.exists) {
        throw new functions.https.HttpsError("not-found",
          "Organization not found");
      }

      // Store the invite code in the organization document
      await orgRef.update({
        inviteCode: inviteCode,
      });

      return {code: inviteCode};
    } catch (error) {
      console.error("Error generating invite code:", error);
      throw new functions.https.HttpsError("internal",
        "Error generating invite code");
    }
  });

export const addExpense = functions.https.onCall(async (data, context) => {
  const {organizationId, expense} = data;

  if (!organizationId || typeof organizationId !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "organizationId must be a non-empty string"
    );
  }

  try {
    // Get the organization document reference
    const orgRef = db.collection("organizations").doc(organizationId);

    // Check if the organization exists
    const orgSnapshot = await orgRef.get();
    if (!orgSnapshot.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Organization not found"
      );
    }

    // Get the user document reference
    const userRef = db.collection("users").doc(expense.createdBy);

    // Create a new expense document in the expenses subcollection
    const expenseRef = await orgRef.collection("expenses").add({
      ...expense,
      createdBy: userRef, // Store the user reference instead of UID
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {expenseId: expenseRef.id};
  } catch (error) {
    console.error("Error adding expense:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Error adding expense"
    );
  }
});

export const createOrganization =
    functions.https.onCall(async (data, context) => {
      const {orgName, ownerId, useCase} = data;

      try {
        // Create a new organization document in Firestore
        const orgRef = await db.collection("organizations").add({
          name: orgName,
          owner: db.collection("users").doc(ownerId),
          type: useCase,
          description: "",
          groupPictureURL: "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create a blank subcollection for expenses
        await orgRef.collection("expenses").doc("placeholder").set({});

        // Add the owner to the members subcollection
        await orgRef.collection("members").doc(ownerId).set({
          role: "owner",
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update the user's organizations field
        await db.collection("users").doc(ownerId).update({
          organizations: admin.firestore.FieldValue.arrayUnion(orgRef),
        });

        console.log(`Organization ${orgRef.id} created successfully.`);

        return {organizationId: orgRef.id};
      } catch (error) {
        console.error("Error creating organization:", error);
        throw new functions.https.HttpsError("internal",
          "Error creating organization");
      }
    });

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
            profilePicturePath.replace(/\.jpg$/, "_128x128.webp");
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
