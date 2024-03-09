const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc,getDoc} = require('firebase/firestore');
const {firebase, admin, db} = require('../config')
const firestore = getFirestore(firebase);

const addTest = async (req, res) => {
    try {
      const myCollection = collection(firestore, 'Test');
      await addDoc(myCollection, req.body);
      console.log("Document successfully add!");
      res.send({ message: 'Test added successfully' });
    } catch (error) {
      console.error("Error adding document: ", error);
      res.status(500).json({ success: false, message: 'something went wrong when adding test'});
    }
};
const getAllTest = async (req, res) => {
    const myCollection = collection(firestore, 'Test');
    try{
    const querySnapshot = await getDocs(myCollection);
    const list = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const docId = doc.id;
        return { ...data, Id: docId };
      });
    res.json({success:true, tests:list});
    }
    catch(error){
        res.json({success:false, message: 'something went wrong when get data from Test'})
        console.log(error);
        return [];
    }
};
const updateTest = async (req, res) => {
    try {
      const myCollection = collection(firestore, 'Test');
      console.log(req.params.testId)
      const docRef1 = doc(myCollection, req.params.testId);
      let data = req.body;
      await updateDoc(docRef1, data);
      console.log("Document successfully updated!");
      res.send({ message: 'Document successfully updated!' });
    } catch (error) {
      console.error("Error updating test document: ", error);
      res.status(500).json({ success: false, message: 'something went wrong when update test data' });
    }
};
const deleteTest = async (req, res) => {
    try {
      const documentRef = db.collection('Test').doc(req.params.testId);
      await documentRef.delete();
      console.log('Document deleted successfully.');
    } catch (error) {
      console.log('Error deleting document:', error);
      res.status(500).json({ success: false, message: 'something went wrong when delete test' });
    }
};
const uploadTestHistory  = async(req,res)=>{
  const myCollection = collection(firestore, 'TestHistory');
  const data = req.body;
  await addDoc(myCollection, data)
  .then((docRef) => {
    res.send({ success: true, message: 'Data added successfully' });
  })
  .catch((error) => {
    res.send({ success: false, message: 'something went wrong when adding document TestHistory' });
    console.error('Error adding document TestHistory: ', error);
  });
}
module.exports={addTest, getAllTest, updateTest, deleteTest, uploadTestHistory}