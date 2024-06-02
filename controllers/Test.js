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
const get2Q = (list)=>{
  let B = []
  let firstIndex = Math.floor(Math.random() * list.length);
  B.push(list[firstIndex]);

  // Đảm bảo câu hỏi thứ hai không trùng với câu hỏi đầu tiên
  let secondIndex;
  do {
      secondIndex = Math.floor(Math.random() * list.length);
  } while (secondIndex === firstIndex);

  B.push(list[secondIndex]);
  return B
}
const getTestTeacher = async(req,res)=>{
  let list14Q = []
  const collectionL = ['ListenPart1','ListenPart2','ListenPart3','ListenPart4','ReadPart1','ReadPart2','ReadPart3']
  const collectionL1 = ['L1','L2','L3','L4','R1','R2','R3']
  for(let i = 0; i < 7; i++){
    const myCollection = collection(firestore, collectionL[i]);
    try{
    const querySnapshot = await getDocs(myCollection);
    const list = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const docId = doc.id;
        return { ...data, Id: docId, part:collectionL1[i]};
      });
      let temp = get2Q(list);
      list14Q.push(...temp)
    }
    catch(error){
        console.log(error);
    }
  }
  res.json({success:true, tests:list14Q});
  
}
module.exports={addTest, getAllTest, updateTest, deleteTest, uploadTestHistory, getTestTeacher}