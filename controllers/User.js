const {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  arrayUnion,
  runTransaction,
} = require("firebase/firestore");
const {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");
const { firebase, admin, db } = require("../config");
const firestore = getFirestore(firebase);
const storage = getStorage();

const createNotiBody = async (id) => {
  const myCollection = collection(firestore, "Vocabulary");
  const docRef = doc(myCollection, id);
  const documentSnapshot = await getDoc(docRef);

  if (documentSnapshot.exists()) {
    const data = documentSnapshot.data();
    const body =
      data.Vocab +
      " " +
      data.Spelling +
      " (" +
      data.Type +
      ") " +
      data.Translate;
    return body;
  } else {
    console.log("Document does not exist.");
    return "";
  }
};
const sendNotification = async (token, message) => {
  let data = "";
  await createNotiBody(message).then((item) => {
    data = item;
  });
  const notificationPayload = {
    notification: {
      title: "Alarm Vocab",
      body: data,
    },
  };

  admin
    .messaging()
    .sendToDevice(token, notificationPayload)
    .then((response) => {
      console.log("Notification sent successfully:", response.results);
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
    });
};

const setUserInfo = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Users");
    const docRef1 = doc(myCollection, req.params.userId);
    await setDoc(docRef1, req.body);
    console.log("Document successfully set!");
    res.send({ message: "User data set successfully" });
  } catch (error) {
    console.error("Error setting user document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when set user data",
    });
  }
};
const uploadImage = async (img) => {
  try {
    if (img == null) return null;
    const bucket = admin.storage().bucket();
    const timestamp = new Date().getTime().toString();

    // Đường dẫn trong Firebase Storage, ví dụ: 'Photos/photo123.jpg'
    const filePath = `Photos/photo${timestamp}.jpg`;

    // Upload file
    await bucket.upload(img, {
      destination: filePath,
      metadata: {
        contentType: "image/jpeg",
      },
    });

    // Lấy URL của file đã upload
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(filePath)}?alt=media`;

    return fileUrl;
  } catch (error) {
    console.error("Error upload img: ", error);
    return null;
  }
};
const setTeacherInfo = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Users");
    const docRef1 = doc(myCollection, req.params.userId);
    let data = req.body;
    await uploadImage(req.body.backIDImage).then((x) => {
      data.backIDImage = x;
    });
    await uploadImage(req.body.frontIDImage).then((x) => {
      data.frontIDImage = x;
    });
    await uploadImage(req.body.toeicCertificateImage).then((x) => {
      data.toeicCertificateImage = x;
    });
    for (let i = 0; i < req.body.otherCertificateImages.length; i++) {
      await uploadImage(req.body.otherCertificateImages[i]).then((x) => {
        data.otherCertificateImages[i] = x;
      });
    }
    await setDoc(docRef1, data);
    console.log("Document successfully set!");
    res.send({ message: "User data set successfully" });
  } catch (error) {
    console.error("Error setting teacher document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when set teacher data",
    });
  }
};
const updateUserPrivate = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Users");
    const docRef1 = doc(myCollection, req.params.userId);
    let data = req.body;
    await uploadImage(req.body.userImg).then((x) => {
      data.userImg = x;
    });
    await updateDoc(docRef1, data);
    console.log("Document successfully updated!");
    res.send({ message: "Document successfully updated!" });
  } catch (error) {
    console.error("Error updating user document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when update user data",
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Users");
    const docRef1 = doc(myCollection, req.params.userId);
    let data = req.body;
    await updateDoc(docRef1, data);
    console.log("Document successfully updated!");
    res.send({ message: "Document successfully updated!" });
  } catch (error) {
    console.error("Error updating user document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when update user data",
    });
  }
};
const getUserData = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Users");
    const docRef1 = doc(myCollection, req.params.userId);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      res.send({ success: true, userData: documentSnapshot.data() });
    } else {
      res.status(404).send({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error get user document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when get data from users",
    });
  }
};
const getAllUsers = async (req, res) => {
  const myCollection = collection(firestore, "Users");
  try {
    const querySnapshot = await getDocs(myCollection);
    const list = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return { ...data };
    });
    res.json({ success: true, users: list });
  } catch (error) {
    res.json({
      success: false,
      message: "something went wrong when get data from Users",
    });
    console.log(error);
    return [];
  }
};
const getAllTeachers = async (req, res) => {
  const myCollection = collection(firestore, "Users");
  try {
    const q = query(myCollection, where("type", "==", "Teacher"));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      let rating = 0;

      for (let i = 0; i < data?.reviews?.length; i++)
        rating += data?.reviews[i]?.rating;

      if (rating > 0) rating = (rating / data?.reviews?.length).toFixed(1);

      const result = { ...data, rating: rating };

      return { ...result };
    });
    res.json({ success: true, teachers: list });
  } catch (error) {
    res.json({
      success: false,
      message: "something went wrong when get data from Users",
    });
    console.log(error);
    return [];
  }
};
const addReview = async (req, res) => {
  const myColllection = collection(firestore, "Users");
  const data = req.body;
  const docRef1 = doc(myColllection, data.id);
  try {
    await updateDoc(docRef1, { reviews: arrayUnion(data.review) });
    console.log("Document successfully set!");
    res.send({ message: "Add review successfully" });
  } catch (error) {
    console.error("Error setting user document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when add review",
    });
  }
};
const updateReview = async (req, res) => {
  const myColllection = collection(firestore, "Users");
  const data = req.body;
  const docRef1 = doc(myColllection, data.id);

  try {
    await runTransaction(firestore, async (transaction) => {
      const documentSnapshot = await transaction.get(docRef1);
      if (!documentSnapshot.exists()) {
        throw "Document does not exist!";
      }

      const reviews = documentSnapshot.data().reviews;

      const result = reviews.map((item) =>
        item.id === data.id ? item : data.review
      );

      transaction.update(docRef1, { reviews: result });
    });
    console.log("Document successfully updated!");
    res.send({ message: "Document successfully updated!" });
  } catch (error) {
    console.error("Error get user document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when update review",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const documentRef = db.collection("Users").doc(req.params.userId);
    await documentRef.delete();
    console.log("Document deleted successfully.");
  } catch (error) {
    console.log("Error deleting document:", error);
  }
};
module.exports = {
  sendNotification,
  setUserInfo,
  updateUser,
  getAllUsers,
  getUserData,
  createNotiBody,
  uploadImage,
  updateUserPrivate,
  getAllTeachers,
  addReview,
  updateReview,
  setTeacherInfo,
  deleteUser,
};
