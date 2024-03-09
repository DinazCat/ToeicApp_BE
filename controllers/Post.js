const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc,getDoc} = require('firebase/firestore');
const {storage} = require('firebase/storage')
const {firebase,admin,db}= require('../config')
const firestore = getFirestore(firebase);
const moment = require('moment');
  const {uploadImage} = require('./User')
  const uploadPdf=async(localFilePath)=>{
    const bucket = admin.storage().bucket();
    const destinationFileName = 'PDF/'+localFilePath+'.pdf';
 
    bucket.upload(localFilePath, {
      destination: destinationFileName,
      metadata: {
        contentType: 'application/pdf', // Set the content type of the file
      },
    })
    .then((file) => {
      console.log('File uploaded successfully.');
    })
    .catch((error) => {
      console.error('Error uploading file:', error);
      return null
    });
    const [url] = await bucket.file(destinationFileName).getSignedUrl({
      action: 'read',
      expires: '03-01-3000' // Set an expiration date for the URL if required
    });
    return url;
  }
  const uploadVideo = async(video)=>{
    const bucket = admin.storage().bucket();
    return new Promise((resolve, reject) => {
  
      const timestamp = new Date().getTime().toString();

      const destination = `Videos/video${timestamp}.mp4`;

      const options = {
        contentType: 'video/mp4'
      };
  
      // Upload file lên Firebase Storage
      bucket.upload(video, {
        destination: destination,
        ...options
      }, function(err, file) {
        if (err) {
          reject(err);
          return;
        }
  
        // Lấy URL của file vừa upload
        file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491' // Thay thế bằng thời gian hết hạn theo mong muốn
        }, function(err, url) {
          if (err) {
            reject(err);
            return;
          }
  
          resolve(url);
        });
      });
    });
  }
const addPost = async(req,res)=>{
    const myCollection = collection(firestore, 'Posts');
    try{
      const data = req.body;
      if(data.postImg != null)
      for(let i = 0; i < data.postImg.length; i++){
        if(data.postImg[i].type=='img'){
          await uploadImage(data.postImg[i].uri).then((x)=>{
            data.postImg[i].uri = x      
          })
        }
        else if(data.postImg[i].type=='video'){
          await uploadVideo(data.postImg[i].uri).then((x)=>{
            data.postImg[i].uri = x  
            console.log('x:'+x)    
          })
        }
        else if(data.postImg[i].type=='pdf'){
          await uploadPdf(data.postImg[i].uri).then((x)=>{
            data.postImg[i].uri = x  
            console.log('x:'+x)    
          })
        }
      }
      
      await addDoc(myCollection, data)
      .then((docRef) => {
        const d = doc(myCollection, docRef.id);
        updateDoc(d, {postId:docRef.id});
        res.send({ message: 'Data saved successfully' });
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
    }
    catch(error){
        console.error("Error addpost: ", error);
    }
}
const updatePost = async(req,res)=>{
  const myCollection = collection(firestore, 'Posts');
  const docRef = doc(myCollection, req.params.postId);
  try {
      await updateDoc(docRef, req.body);
      console.log('Document successfully updated!');
      res.send({ message: 'Document successfully updated!' });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
}
const updateCommentTree =async(sign, id, momId)=>{
  if(sign=='noreply'){

    const collectionRef = admin.firestore().collection('Posts');
const docRef = collectionRef.doc(momId);

docRef.update({ comments: admin.firestore.FieldValue.arrayUnion(id) });
  }
  else{
    const collectionRef = admin.firestore().collection('Comments');
    const docRef = collectionRef.doc(momId);
    docRef.update({ replies: admin.firestore.FieldValue.arrayUnion(id) });
  }
}

const addComment = async(req,res)=>{
  const myCollection = collection(firestore, 'Comments');
  try{
    const data = req.body;
    await addDoc(myCollection, data)
    .then((docRef) => {
      const d = doc(myCollection, docRef.id);
      updateDoc(d, {commentId:docRef.id});
      updateCommentTree(req.params.sign,docRef.id,req.params.momId)
      res.send({ message: 'Data saved successfully' });
    })
    .catch((error) => {
      console.error('Error adding document: ', error);
    });
  }
  catch(error){
    console.error("Error addcomment: ", error);
  }
}
const getOneComment = async (req,res)=>{
  const myCollection = collection(firestore, 'Comments');
  const docRef = doc(myCollection, req.params.commentId);
  try{
  const documentSnapshot = await getDoc(docRef);

if (documentSnapshot.exists()) {
  const data = documentSnapshot.data();
  res.json({success:true, comment:data});
} else {
  console.log('Document does not exist.');
  res.json({success:true, comment:'-1'});
}
  }
  catch(e){
      res.json({
          success:false,
          message:'something went wrong when get data from comment'
      })
      console.log(e)
  }
}

const addNotification = async(req,res)=>{
  const myCollection = collection(firestore, 'Notification');
  try{
    const data = req.body;
    await addDoc(myCollection, data)
    .then((docRef) => {
      const d = doc(myCollection, docRef.id);
      updateDoc(d, {Id:docRef.id});
      sendNotification(docRef.id)
      
      res.send({ message: 'Data saved successfully' });
    })
    .catch((error) => {
      console.error('Error adding document: ', error);
    });
  }
  catch(error){
    console.error("Error addcomment: ", error);
  }
}
const deleteNotification = async (req, res) => {
  try {
    const documentRef = db.collection('Notification').doc(req.params.notiId);
    await documentRef.delete();
    console.log('Document deleted successfully.');
  } catch (error) {
    console.log('Error deleting document:', error);
  }
}
const updateNotification = async(req,res)=>{
  const myCollection = collection(firestore, 'Notification');
  const docRef = doc(myCollection, req.params.notiId);
  try {
      await updateDoc(docRef, req.body);
      console.log('Document successfully updated!');
      res.send({ message: 'Document successfully updated!' });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
}
const getDataUser=async(id)=>{
  const Collection = collection(firestore, 'Users');
  const docRef = doc(Collection, id);
  const rep = await getDoc(docRef);
  return rep.data()
}
const sendNotification=async(id)=>{
  const myCollection = collection(firestore, 'Notification');
  const docRef = doc(myCollection, id);
  const documentSnapshot = await getDoc(docRef);
  const noti = documentSnapshot.data()

  let Guestname= '';
  let token='';
  await getDataUser(noti.PostownerId).then(item => {token = item.token});
  await getDataUser(noti.guestId).then(item => {Guestname = item.name});
  const notificationPayload = {
    notification: {
      title: 'Coco',
      body: Guestname +" "+noti.text,
    },
  };
  // Send the notification to the specific user's token
  admin.messaging().sendToDevice(token, notificationPayload)
    .then((response) => {
      console.log('Notification sent successfully:', response.results);
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
    });
}
const filterOnlyhashtag = async(req,res)=>{
  try{
    const Collection = collection(firestore, 'Posts');
  const querySnapshot = await getDocs(Collection);
  const list = querySnapshot.docs.map((doc) => {
    const dateSeconds = moment.unix(doc.data().postTime.seconds);
    const data = doc.data();
    return { ...data, postTime:dateSeconds.format('DD-MM-YYYY HH:mm')};
  });
  const filteredPosts = list.filter(function(post) {
   return post.hashtag===req.params.hashtag
  })
  res.json({success:true, posts:filteredPosts});
  }
  catch(e){
    console.error('Error filterOnlyhastag:', e);
  }
  
}
const checkUserComment = async(id,userId)=>{
  const Collection = collection(firestore, 'Comments');
  const docRef = doc(Collection, id);
  const rep = await getDoc(docRef);
  if(rep.data().userId == userId) return true
  return false
}
const filterOnlyPost = async(req,res)=>{
  try{
  //   const Collection = collection(firestore, 'Posts');
  // const querySnapshot = await getDocs(Collection);

  db.collection('Posts')
  .orderBy('postTime.seconds', 'desc')
  .get()
  .then((querySnapshot)=>{
    const list = querySnapshot.docs.map((doc) => {
      const dateSeconds = moment.unix(doc.data().postTime.seconds);
      const data = doc.data();
      return { ...data,postTime:dateSeconds.format('DD-MM-YYYY HH:mm') };})
    let filteredPosts = list;
    if(req.params.type == 'Hottest')
    {
      const likesCountArray = list.map((post) => ({
        postId: post.postId,
        likesCount: post.likes.length,
      }));
      
      // Sắp xếp mảng tạm thời theo số lượng likes giảm dần
      likesCountArray.sort((a, b) => b.likesCount - a.likesCount);
      filteredPosts = likesCountArray.map((item) => list.find((post) => post.postId === item.postId));
    }
    else if(req.params.type == 'Liked')
    {
      filteredPosts = list.filter(post => post.likes.includes(req.params.userId));
    }
    else if(req.params.type == 'Newest')
    {
      filteredPosts = list;
    }
    else if(req.params.type == 'Commented')
    {
      filteredPosts = list.filter(post => {
        const comments = post.comments || [];
        for(let i = 0; i < comments;i++){
          if(checkUserComment(comments[i],req.params.userId)) return 
        }
        return comments.some(async comment => await checkUserComment(comment,req.params.userId) === true);
      });
    }
    res.json({success:true, posts:filteredPosts});
  });
  }
  catch(e){
    console.error('Error filterOnlyPost:', e);
  }
  
}
const filterBoth = async(req,res)=>{
  try{
    db.collection('Posts')
    .orderBy('postTime.seconds', 'desc')
    .get()
    .then((querySnapshot)=>{
      const list = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const dateSeconds = moment.unix(doc.data().postTime.seconds);
      return { ...data,postTime:dateSeconds.format('DD-MM-YYYY HH:mm') };})
      let filteredPosts = list;
      if(req.params.type == 'Hottest')
      {
        const filter1 = list.filter(function(post) {
          return post.hashtag===req.params.hashtag
         })
        const likesCountArray = filter1.map((post) => ({
          postId: post.postId,
          likesCount: post.likes.length,
        }));
        
        // Sắp xếp mảng tạm thời theo số lượng likes giảm dần
        likesCountArray.sort((a, b) => b.likesCount - a.likesCount);

        filteredPosts = likesCountArray.map((item) => list.find((post) => post.postId === item.postId));
        console.log(filteredPosts)
      }
      else if(req.params.type == 'Liked')
      {
        const filter1 = list.filter(post => post.likes.includes(req.params.userId));
        filteredPosts = filter1.filter(function(post) {
          return post.hashtag===req.params.hashtag
         })
      }
      else if(req.params.type == 'Newest')
      {
        filteredPosts  = list.filter(function(post) {
          return post.hashtag===req.params.hashtag
         })
      }
      else if(req.params.type == 'Commented')
      {
        const filter1 = list.filter(post => {
          const comments = post.comments || [];
          for(let i = 0; i < comments;i++){
            if(checkUserComment(comments[i],req.params.userId)) return 
          }
          return comments.some(async comment => await checkUserComment(comment,req.params.userId) === true);
        });
        filteredPosts = filter1.filter(function(post) {
          return post.hashtag===req.params.hashtag
         })
      }
      res.json({success:true, posts:filteredPosts});
    });
    }
  catch(e){
    console.error('Error filterOnlyPost:', e);
  }
  
}
const pushSavedPost = async (req, res) => {
  const myCollection = collection(firestore, "Users");
  const docRef = doc(myCollection, req.params.userId);
  try {
    const documentSnapshot = await getDoc(docRef);
    if (documentSnapshot.exists()) {
      const userData = documentSnapshot.data();
      const data = userData.SavedPost || [];
      data.unshift(req.params.postId);
      await updateDoc(docRef, {SavedPost: data });
      // res.send({ message: 'Document successfully updated!' });
    } 
    else {
      const data = {
        SavedPost: [req.params.postId],
      };
      await setDoc(docRef, data);
    }
  } catch (error) {
   console.error('Error pushHistoryUser1: ', error);
  }
};
const getSavedPost = async (req,res)=>{
  const myCollection = collection(firestore, 'Users');
  const docRef = doc(myCollection, req.params.userId);
  try{
  const documentSnapshot = await getDoc(docRef);

if (documentSnapshot.exists()) {
  const data = [];
  for(let i = 0; i < documentSnapshot.data().SavedPost.length;i++){
    const Collection = collection(firestore, 'Posts');
    const docRef1 = doc(Collection, documentSnapshot.data().SavedPost[i]);
    const documentSnapshot1 = await getDoc(docRef1);
    if(documentSnapshot1.exists){
      const data1 = documentSnapshot1.data();
      const dateSeconds = moment.unix(documentSnapshot1.data().postTime.seconds);
      data.push({ ...data1,postTime:dateSeconds.format('DD-MM-YYYY HH:mm') })
    }
  }
  res.json({success:true, SavedPost:data});
} else {
  console.log('Document does not exist.');
  res.json({success:true, SavedPost:[]});
}
  }
  catch(e){
      res.json({
          success:false,
          message:'something went wrong when get data from savepost'
      })
      console.log(e)
  }
}
// const updateSavedPost = async(req,res)=>{
//   const myCollection = collection(firestore, 'Users');
//   const docRef = doc(myCollection, req.params.userId);
//   try{
//     await updateDoc(docRef,req.body);
//     res.send({ message: 'Document successfully updated!' });
//   }
//   catch(e){
//     console.error('Error updating document: ', error);
// }
// }
const deletePost = async (req, res) => {
  try {
    const documentRef = db.collection('Posts').doc(req.params.postId);
    await documentRef.delete();
    console.log('Document deleted successfully.');
  } catch (error) {
    console.log('Error deleting document:', error);
  }
}
const getPosts = async (req,res)=>{
  const now = new Date();

const day = now.getDate()+'';
const month = (now.getMonth() + 1)+'';  // Tháng bắt đầu từ 0, nên cần +1
const year = now.getFullYear()+'';
    try {
      db.collection('Posts')
      .orderBy('postTime.seconds', 'desc')
      .get()
      .then((querySnapshot)=>{
           let list = []
           const list2 = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const dateSeconds = moment.unix(doc.data().postTime.seconds);
            const compare = dateSeconds.format('DD-MM-YYYY').split('-');
             if(compare[0]==day&&compare[1]==month&&compare[2]==year)
             {
              list.push({ ...data, postTime:dateSeconds.format('DD-MM-YYYY HH:mm')})
             }
            return { ...data, postTime:dateSeconds.format('DD-MM-YYYY HH:mm')};
          });
          // for(let i = 0; i < list2.length;i++){

          // }
          res.json({success:true, allP:list2, todayP:list});
        })
    } catch (e) {
      console.log(e);
      res.json({
        success: false,
        message: "something went wrong when get data from getVocabinLesson",
      });
      return [];
    }

 }
module.exports={addPost, uploadVideo, updatePost, addComment, getOneComment, addNotification,
   deleteNotification,updateNotification,filterBoth,filterOnlyPost,filterOnlyhashtag, pushSavedPost, getSavedPost,
 deletePost, getPosts}