import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

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
