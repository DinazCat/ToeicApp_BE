const {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  arrayUnion,
  query,
  where,
  arrayRemove,
} = require("firebase/firestore");
const { firebase, admin, db } = require("../config");
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

const getUser = async (userId) => {
  try {
    const myCollection = collection(firestore, "Users");
    const docRef1 = doc(myCollection, userId);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      return documentSnapshot.data();
    }
  } catch (error) {
    console.error("Error get user document: ", error);
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
          userName = await getUser(doc.data().userId)
            .then((res) => {
              return res.name;
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

const getClassesByUserTeacher = async (req, res) => {
  const myCollection = collection(firestore, "Class");
  try {
    const q = query(myCollection, where("userId", "==", req.params.userId));
    const querySnapshot = await getDocs(q);

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

const getClassById = async (classId) => {
  try {
    const myCollection = collection(firestore, "Class");
    const docRef1 = doc(myCollection, classId);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      return documentSnapshot.data();
    }
  } catch (error) {
    console.error("Error get user document: ", error);
  }
};

const getClassesByUser = async (req, res) => {
  const myCollection = collection(firestore, "Users");

  try {
    const docRef1 = doc(myCollection, req.params.userId);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      if (documentSnapshot.data().Classes) {
        const list = await Promise.all(
          documentSnapshot.data().Classes.map(async (id) => {
            const data = await getClassById(id)
              .then((res) => {
                return res;
              })
              .catch((error) => console.log("error:" + error));

            return { ...data, userName: documentSnapshot.data().name };
          })
        );
        res.json({ success: true, classes: list });
      } else {
        res.status(404).send({ success: false, message: "User not found" });
      }
    }
  } catch (error) {
    res.json({
      success: false,
      message: "something went wrong when get data from Class",
    });
    console.log(error);
    return [];
  }
};

const getTeachersOfClasses = async (req, res) => {
  const myCollection = collection(firestore, "Users");
  try {
    const docRef1 = doc(myCollection, req.params.userId);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      if (documentSnapshot.data().Classes) {
        let list = await Promise.all(
          documentSnapshot.data().Classes.map(async (id) => {
            const data = await getClassById(id)
              .then((res) => {
                return getUser(res.userId);
              })
              .catch((error) => console.log("error:" + error));

            return { ...data };
          })
        );

        //Xử lý mảng trùng và tính toán rating
        list = list.reduce((accumulator, item) => {
          if (!accumulator.some((e) => e.id === item.id)) {
            let rating = 0;

            for (let i = 0; i < item?.reviews?.length; i++)

              rating += item?.reviews[i]?.rating;

            if (rating > 0)
              rating = (rating / item?.reviews?.length).toFixed(1);

            const data = { ...item, rating: rating };
            accumulator.push(data);
          }
          return accumulator;
        }, []);
        res.json({ success: true, teachers: list });
      } else {
        res.status(404).send({ success: false, message: "User not found" });
      }
    }
  } catch (error) {
    res.json({
      success: false,
      message: "something went wrong when get data from Class",
    });
    console.log(error);
    return [];
  }
};

const registerCourse = async (req, res) => {
  const classCollection = collection(firestore, "Class");
  const userCollection = collection(firestore, "Users");

  try {
    const data = req.body;
    const docRef1 = doc(userCollection, data.user.id);
    await updateDoc(docRef1, { Classes: arrayUnion(data.classId) });
    const docRef2 = doc(classCollection, data.classId);
    await updateDoc(docRef2, { Members: arrayUnion(data.user) });
    console.log("Document successfully update!");
    res.send({ message: "Register class successfully!" });
  } catch (error) {
    console.error("Error registerCourse: ", error);
  }
};
const updateFile = async (req, res) => {
  const classCollection = collection(firestore, "Class");
  try {
    const data = req.body;
    const docRef2 = doc(classCollection, req.params.classId);
    await updateDoc(docRef2, { FileSource: arrayUnion(data) });
    console.log("Document successfully update!");
    res.send({ message: "update class successfully!" });
  } catch (error) {
    console.error("Error registerCourse: ", error);
  }
};
const deleteFile = async (req, res) => {
  const classCollection =  collection(firestore,'Class');

  try {
    const docRef = doc(classCollection,req.params.classId);
    await updateDoc(docRef,{FileSource: arrayRemove(req.body)})
    res.send({ message: "update class successfully!" });
  } catch (error) {
    console.error('Error removing item from array: ', error);
  }
}
const deleteFolder = async (req, res) => {
  try {
    const documentRef = db.collection('Folder').doc(req.params.Id);
    await documentRef.delete();
    res.send({ message: "delete successfully!" });
    console.log('Document deleted successfully.');
  } catch (error) {
    console.log('Error deleting document:', error);
  }
}
const addFolder = async(req,res)=>{
  const myCollection = collection(firestore, 'Folder');
  try{
    const data = req.body; 
    await addDoc(myCollection, data)
    .then((docRef) => {
      const d = doc(myCollection, docRef.id);
      updateDoc(d, {idFolder:docRef.id});
      res.json({ message: 'Data post successfully', Id:docRef.id});
    })
    .catch((error) => {
      console.error('Error adding document: ', error);
    });
  }
  catch(error){
      console.error("Error addpost: ", error);
  }
}
const updateFolder = async (req, res) => {
  const classCollection = collection(firestore, "Folder");
  try {
    const data = req.body;
    const docRef2 = doc(classCollection, req.params.folderId);
    await updateDoc(docRef2, { FileSource: arrayUnion(data) });
    console.log("Document successfully update!");
    res.send({ message: "update folder successfully!" });
  } catch (error) {
    console.error("Error registerCourse: ", error);
  }
};

const checkTransaction = async (req,res) => {
  const myCollection = collection(firestore, 'Transaction');
  try {
       const querySnapshot = await getDocs(myCollection);
       let pay = false;
        querySnapshot.docs.map((doc) => {
        if(doc.data().userId == req.params.userId && doc.data().classId == req.params.classId){
          pay = true;
        }
         });
        res.json({pay:pay});
  } catch (e) {
    console.log(e);
  }
}
const getClassData = async (req, res) => {
  try {
    const myCollection = collection(firestore, "Class");
    const docRef1 = doc(myCollection, req.params.classId);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      res.send({ success: true, classData: documentSnapshot.data() });
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
const getAllTransaction = async (req,res)=>{
  const myCollection = collection(firestore, 'Transaction');
  try{
  const querySnapshot = await getDocs(myCollection);
  const list = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return { ...data};
    });
  res.json({success:true, transactions:list});
  }
  catch(e){
      res.json({
          success:false,
          message:'something went wrong when get data from vocablesson'
      })
      console.log(e)
  }
}
const updateClass = async(req,res)=>{
  const myCollection = collection(firestore, 'Class');
  const docRef = doc(myCollection, req.params.classId);
  try {
      await updateDoc(docRef, req.body);
      console.log('Document successfully updated!');
      res.send({ message: 'Document successfully updated!' });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
}
module.exports = {
  addClass,
  getAllClasses,
  getClassesByUserTeacher,
  getClassesByUser,
  registerCourse,
  getTeachersOfClasses,
  updateFile,
  addFolder,
  updateFolder,
  checkTransaction,
  deleteFile,
  deleteFolder,
  getClassData,
  getAllTransaction,
  updateClass
};
