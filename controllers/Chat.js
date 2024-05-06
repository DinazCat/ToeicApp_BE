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

const initiateCall = async (req, res) => {
  const { calleeInfo, callerInfo, videoSDKInfo } = req.body;
  var FCMtoken = calleeInfo.token;
  const info = JSON.stringify({
    callerInfo,
    videoSDKInfo,
    type: "CALL_INITIATED",
  });
  var message = {
    data: {
      info,
    },
    android: {
      priority: "high",
    },
    token: FCMtoken,
  };
  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Tin nhắn đã được gửi thành công:", response);
      res.status(200).send(response);
    })
    .catch((error) => {
      console.error("Lỗi khi gửi tin nhắn:", error);
      res.status(400).send(error);
    });
};

const updateCall = async (req, res) => {
  const { callerInfo, type } = req.body;
  const info = JSON.stringify({
    callerInfo,
    type,
  });

  var message = {
    data: {
      info,
    },
    apns: {
      headers: {
        "apns-priority": "10",
      },
      payload: {
        aps: {
          badge: 1,
        },
      },
    },
    token: callerInfo.token,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Tin nhắn đã được gửi thành công:", response);
      res.status(200).send(response);
    })
    .catch((error) => {
      console.error("Lỗi khi gửi tin nhắn:", error);
      res.status(400).send(error);
    });
};

const addChatRoom = async (req, res) => {
  try {
    const myCollection = collection(firestore, "ChatRoom");
    const docRef = await addDoc(myCollection, req.body);
    console.log("Document successfully added with ID: ", docRef.id);
    res.send({ message: "ChatRoom added successfully", id: docRef.id });
  } catch (error) {
    console.error("Error adding document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when adding ChatRoom",
    });
  }
};
const getUserChatRooms = async (req, res) => {
  const myCollection = collection(firestore, "ChatRoom");
  try {
    const querySnapshot = await getDocs(myCollection);
    const list = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.users) {
        const userExistsInRoom = roomUsers.some(
          (user) => user.userId === req.params.userId
        );
        if (userExistsInRoom) {
          const docId = doc.id;
          return { ...data, Id: docId };
        }
      }
    });
    res.json({ success: true, list: list });
  } catch (error) {
    res.json({
      success: false,
      message: "something went wrong when get data from ChatRoom",
    });
    console.log(error);
    return [];
  }
};

const getChatRoom = async (req, res) => {
  try {
    const myCollection = collection(firestore, "ChatRoom");
    const docRef1 = doc(myCollection, req.params.id);
    const documentSnapshot = await getDoc(docRef1);

    if (documentSnapshot.exists()) {
      res.send({ success: true, data: documentSnapshot.data() });
    } else {
      res.status(404).send({ success: false, message: "ChatRoom not found" });
    }
  } catch (error) {
    console.error("Error get ChatRoom document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when get data from ChatRoom",
    });
  }
};

const updateChatRoom = async (req, res) => {
  try {
    const myCollection = collection(firestore, "ChatRoom");
    const docRef1 = doc(myCollection, req.params.id);
    let data = req.body;
    await updateDoc(docRef1, data);
    console.log("Document successfully updated!");
    res.send({ message: "Document successfully updated!" });
  } catch (error) {
    console.error("Error updating ChatRoom document: ", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when update ChatRoom data",
    });
  }
};

const updateMessageInChat = async() =>{

}

const deleteChatRoom = async (req, res) => {
  try {
    const documentRef = db.collection("ChatRoom").doc(req.params.id);
    await documentRef.delete();
    console.log("Document deleted successfully.");
  } catch (error) {
    console.log("Error deleting document:", error);
    res.status(500).json({
      success: false,
      message: "something went wrong when delete ChatRoom",
    });
  }
};

module.exports = {
  initiateCall,
  updateCall,
  addChatRoom,
  updateChatRoom,
  getChatRoom,
  getUserChatRooms,
  deleteChatRoom,
};
