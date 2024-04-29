const {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
} = require("firebase/firestore");
const { firebase } = require("../config");
const firestore = getFirestore(firebase);

const addClass = async (req, res) => {
  const myCollection = collection(firestore, "Class");
  try {
    const data = req.body;

    await addDoc(myCollection, data)
      .then((docRef) => {
        const d = doc(myCollection, docRef.id);
        updateDoc(d, { classId: docRef.id });
        res.send({ message: "Data saved successfully" });
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  } catch (error) {
    console.error("Error addClass: ", error);
  }
};

module.exports = { addClass };
