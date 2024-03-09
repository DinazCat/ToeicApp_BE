const { getFirestore, collection, getDocs,addDoc, updateDoc, doc, setDoc,getDoc} = require('firebase/firestore');
const {firebase,db}= require('../config')
const firestore = getFirestore(firebase);

// const myCollection = collection(firestore, 'VocabLesson');
const getVocabLesson = async (req,res)=>{
    const myCollection = collection(firestore, 'VocabLesson');
    try{
      // db.collection('VocabLesson')
      // .doc()
      // .get((doc)=>{
      //   const list = doc.docs.map((doc) => {
      //     const data = doc.data();
      //     const docId = doc.id;
      //     return { ...data, Id: docId };
      //   });
      // res.json({success:true, vocablesson:list});
      // })
    const querySnapshot = await getDocs(myCollection);
    // const list = querySnapshot.docs.map((doc) => doc.data());
    const list = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const docId = doc.id;
        return { ...data, Id: docId };
      });
    res.json({success:true, vocablesson:list});
    }
    catch(e){
        res.json({
            success:false,
            message:'something went wrong when get data from vocablesson'
        })
        console.log(e)
    }
}
 const getVocabs = async (req,res)=>{
    const myCollection = collection(firestore, 'Vocabulary');
    try{
        const querySnapshot = await getDocs(myCollection);
        // const list = querySnapshot.docs.map((doc) => doc.data());
        const list = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const docId = doc.id;
            return { ...data, Id: docId };
          });
         res.json({success:true, vocabs:list});
         return list
        }
        catch(e){
            console.log(e);
            res.json({
              success: false,
              message: "something went wrong when get data from getVocabs",
            });
            return [];
        }
 }
//  const filterVocab = async(IdLesson) => {
//   const result = await getVocabs(null, {});
//   const list = result.filter(i=>i.TopicId == IdLesson);
//     return list
//  }
 const getVocabinLesson = async (req,res)=>{
  const myCollection = collection(firestore, 'Vocabulary');
    try {
         const querySnapshot = await getDocs(myCollection);
         const list = []
          querySnapshot.docs.map((doc) => {
          if(doc.data().TopicId == req.params.TopicId){
             const data = doc.data();
             const docId = doc.id;
             list.push({ ...data, Id: docId });
          }
           });
          res.json({success:true, vocabs:list});
    } catch (e) {
      console.log(e);
      res.json({
        success: false,
        message: "something went wrong when get data from getVocabinLesson",
      });
      return [];
    }

 }
 const setAlarmVocab = async(req,res)=>{
    const myCollection = collection(firestore, 'Users');
    const docRef1 = doc(myCollection, req.params.userId);
    try {
      const docRef = await setDoc(docRef1, req.body );
      console.log("Document written ");
      res.send({ message: 'Data saved successfully' });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
 }

 const getAlarmVocab = async (req,res)=>{
    const myCollection = collection(firestore, 'Users');
    const docRef = doc(myCollection, req.params.userId);
    try{
    const documentSnapshot = await getDoc(docRef);
  
  if (documentSnapshot.exists()) {
    const data = documentSnapshot.data().vocabAlarms || [];
    res.json({success:true, vocabAlarm:data});
  } else {
    console.log('Document does not exist.');
    res.json({success:true, vocabAlarm:'-1'});
  }
    }
    catch(e){
        res.json({
            success:false,
            message:'something went wrong when get data from vocabAlarm'
        })
        console.log(e)
    }
}
const updateAlarmVocab = async(req,res)=>{
    const myCollection = collection(firestore, 'Users');
    const docRef = doc(myCollection, req.params.userId);
    try {
        await updateDoc(docRef, req.body);
        console.log('Document successfully updated!');
        res.send({ message: 'Document successfully updated!' });
      } catch (error) {
        console.error('Error updating document: ', error);
      }
}
const addVocabLesson = async(req,res)=>{
  const myCollection = collection(firestore, 'VocabLesson');
  try{
    const data = req.body; 
    await addDoc(myCollection, data)
    .then((docRef) => {
      const d = doc(myCollection, docRef.id);
      // updateDoc(d, {postId:docRef.id});
      res.json({ message: 'Data post successfully', TopicId:docRef.id});
    })
    .catch((error) => {
      console.error('Error adding document: ', error);
    });
  }
  catch(error){
      console.error("Error addpost: ", error);
  }
}
const addVocab = async(req,res)=>{
  const myCollection = collection(firestore, 'Vocabulary');
  try{
    const data = req.body; 
    await addDoc(myCollection, data)
    .then((docRef) => {
      res.send({ message: 'Data post successfully'});
    })
    .catch((error) => {
      console.error('Error adding document: ', error);
    });
  }
  catch(error){
      console.error("Error addpost: ", error);
  }
}
const updateVocab= async(req,res)=>{
  const myCollection = collection(firestore,'Vocabulary');
  const docRef = doc(myCollection, req.params.vocabId);
  try {
      await updateDoc(docRef, req.body);
      console.log('Document successfully updated!');
      res.send({ message: 'Document successfully updated!' });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
}
const deleteVocab = async (req, res) => {
  try {
    const documentRef = db.collection('Vocabulary').doc(req.params.vocabId);
    await documentRef.delete();
    console.log('Document deleted successfully.');
  } catch (error) {
    console.log('Error deleting document:', error);
  }
}
const updateTopic= async(req,res)=>{
  const myCollection = collection(firestore,'VocabLesson');
  const docRef = doc(myCollection, req.params.topicId);
  try {
      await updateDoc(docRef, req.body);
      console.log('Document successfully updated!');
      res.send({ message: 'Document successfully updated!' });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
}
const deleteTopic = async (req, res) => {
  try {
    const documentRef = db.collection('VocabLesson').doc(req.params.topicId);
    await documentRef.delete();
    const myCollection = collection(firestore, 'Vocabulary');
         const querySnapshot = await getDocs(myCollection);
         querySnapshot.docs.map(async (doc) => {
          if(doc.data().TopicId == req.params.topicId){
            const documentRef1 = db.collection('Vocabulary').doc(doc.id);
            await documentRef1.delete();
          }
           });
    console.log('Document deleted successfully.');
  } catch (error) {
    console.log('Error deleting document:', error);
  }
}
module.exports={getVocabLesson, getVocabinLesson, getVocabs, setAlarmVocab, getAlarmVocab, updateAlarmVocab, 
  addVocabLesson, addVocab, updateVocab, deleteVocab, updateTopic, deleteTopic}