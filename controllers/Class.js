const {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  arrayUnion,
} = require("firebase/firestore");
const { firebase } = require("../config");
const firestore = getFirestore(firebase);

const addClass = async (req, res) => {
  const classCollection = collection(firestore, "Class");
  const userCollection = collection(firestore, "Users");

  try {
    const data = req.body;
    let classId = "";

    await addDoc(classCollection, data)
      .then((docRef) => {
        const d = doc(classCollection, docRef.id);
        classId = docRef.id;
        updateDoc(d, { classId: docRef.id });
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
    const docRef1 = doc(userCollection, data.userId);
    await updateDoc(docRef1, { Classes: arrayUnion(classId) });
    console.log("Document successfully add!");
    res.send({ message: "Class added successfully!" });
  } catch (error) {
    console.error("Error addClass: ", error);
  }
};

const getAllClasses = async (req, res) => {
  const myCollection = collection(firestore, "Class");
  try {
    const querySnapshot = await getDocs(myCollection);
    const list = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        let userName;

        if (doc.data().userId) {
          userName = await getUserName(doc.data().userId)
            .then((res) => {
              return res.userName;
            })
            .catch((error) => console.log("error:" + error));
        }

        const data = { ...doc.data(), userName: userName };
        return { ...data };
      })
    );
    res.json({ success: true, classes: list });
  } catch (error) {
    res.json({
      success: false,
      message: "something went wrong when get data from Class",
    });
    console.log(error);
    return [];
  }
};
const getUserName = async (userId) => {
  try {
    const myCollection = collection(firestore, "Users");
    const docRef1 = doc(myCollection, userId);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      return { success: true, userName: documentSnapshot.data().name };
    }
  } catch (error) {
    console.error("Error get user document: ", error);
  }
};

module.exports = { addClass, getAllClasses };
