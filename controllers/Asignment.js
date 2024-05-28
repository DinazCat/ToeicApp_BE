const {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  getDoc,
} = require("firebase/firestore");
const { firebase, admin, db } = require("../config");
const firestore = getFirestore(firebase);

const addAsignment = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Asignment");
    const docRef = await addDoc(myCollection, req.body);
    console.log("Document successfully added with ID: ", docRef.id);
    res.send({ message: "Asignment added successfully", id: docRef.id });
  } catch (error) {
    console.error("Error adding document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when adding Asignment",
    });
  }
};
const getClassAsignments = async (req, res) => {
  const myCollection = collection(firestore, "Asignment");
  const classIds = req.query.classIds;
  console.log(classIds);
  const classIdsArray = Array.isArray(classIds) ? classIds : [classIds];
  try {
    const querySnapshot = await getDocs(myCollection);
    const list = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((doc) => classIdsArray?.includes(doc.classId));

    list.sort((a, b) => {
      return new Date(b) - new Date(a);
    });

    res.json({ success: true, list: list });
  } catch (error) {
    res.json({
      success: false,
      message: "something went wrong when get data from Asignment",
    });
    console.log(error);
    return [];
  }
};

const getAsignment = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Asignment");
    const docRef1 = doc(myCollection, req.params.id);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      res.send({ success: true, data: documentSnapshot.data() });
    } else {
      res.status(404).send({ success: false, message: "Asignment not found" });
    }
  } catch (error) {
    console.error("Error get Asignment document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when get data from Asignment",
    });
  }
};

const updateAsignment = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Asignment");
    const docRef1 = doc(myCollection, req.params.id);
    let data = req.body;
    await updateDoc(docRef1, { submissions: data });
    console.log("Document successfully updated!");
    res.send({ message: "Document successfully updated!" });
  } catch (error) {
    console.error("Error updating Asignment document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when update Asignment data",
    });
  }
};

const deleteAsignment = async (req, res) => {
  try {
    const documentRef = db.collection("Asignment").doc(req.params.id);
    await documentRef.delete();
    console.log("Document deleted successfully.");
  } catch (error) {
    console.log("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when delete Asignment",
    });
  }
};

module.exports = {
  addAsignment,
  updateAsignment,
  getAsignment,
  getClassAsignments,
  deleteAsignment,
};
