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
} = require("firebase/firestore");
const { firebase, db, admin } = require("../config");
const firestore = getFirestore(firebase);
const { uploadImage } = require("./User");
const getAnalysis = async (userId, Part) => {
  const myCollection = collection(firestore, "Users");
  const docRef = doc(myCollection, userId);
  try {
    const documentSnapshot = await getDoc(docRef);

    if (documentSnapshot.exists()) {
      if (Part == "ListenPart1" || Part == "L1") {
        const data = documentSnapshot.data().AnalysisPractice?.L1 || {
          Score: 0,
          Qty: 0,
        };
        return data;
      }
      if (Part == "ListenPart2" || Part == "L2") {
        const data = documentSnapshot.data().AnalysisPractice?.L2 || {
          Score: 0,
          Qty: 0,
        };
        return data;
      } else if (Part == "ListenPart3" || Part == "L3") {
        const data = documentSnapshot.data().AnalysisPractice?.L3 || {
          Score: 0,
          Qty: 0,
        };
        return data;
      } else if (Part == "ListenPart4" || Part == "L4") {
        const data = documentSnapshot.data().AnalysisPractice?.L4 || {
          Score: 0,
          Qty: 0,
        };
        return data;
      } else if (Part == "ReadPart1" || Part == "R1") {
        const data = documentSnapshot.data().AnalysisPractice?.R1 || {
          Score: 0,
          Qty: 0,
        };
        return data;
      } else if (Part == "ReadPart2" || Part == "R2") {
        const data = documentSnapshot.data().AnalysisPractice?.R2 || {
          Score: 0,
          Qty: 0,
        };
        return data;
      } else if (Part == "ReadPart3" || Part == "R3") {
        const data = documentSnapshot.data().AnalysisPractice?.R3 || {
          Score: 0,
          Qty: 0,
        };
        return data;
      }
    } else return { Score: 0, Qty: 0 };
  } catch (e) {
    console.error("Error get document: ", e);
    return { Score: 0, Qty: 0 };
  }
};

const getMaxquestion = async (userId, Part) => {
  const myCollection = collection(firestore, "Users");
  const docRef = doc(myCollection, userId);
  try {
    const documentSnapshot = await getDoc(docRef);

    if (documentSnapshot.exists()) {
      if (Part == "ListenPart1" || Part == "L1") {
        const data = documentSnapshot.data().MaxQuestion?.L1 || 0;
        return data;
      }
      if (Part == "ListenPart2" || Part == "L2") {
        const data = documentSnapshot.data().MaxQuestion?.L2 || 0;
        return data;
      } else if (Part == "ListenPart3" || Part == "L3") {
        const data = documentSnapshot.data().MaxQuestion?.L3 || 0;
        return data;
      } else if (Part == "ListenPart4" || Part == "L4") {
        const data = documentSnapshot.data().MaxQuestion?.L4 || 0;
        return data;
      } else if (Part == "ReadPart1" || Part == "R1") {
        const data = documentSnapshot.data().MaxQuestion?.R1 || 0;
        return data;
      } else if (Part == "ReadPart2" || Part == "R2") {
        const data = documentSnapshot.data().MaxQuestion?.R2 || 0;
        return data;
      } else if (Part == "ReadPart3" || Part == "R3") {
        const data = documentSnapshot.data().MaxQuestion?.R3 || 0;
        return data;
      } else if (Part == "WritePart1" || Part == "W1") {
        const data = documentSnapshot.data().MaxQuestion?.W1 || 0;
        return data;
      } else if (Part == "WritePart2" || Part == "W2") {
        const data = documentSnapshot.data().MaxQuestion?.W2 || 0;
        return data;
      } else if (Part == "WritePart3" || Part == "W3") {
        const data = documentSnapshot.data().MaxQuestion?.W3 || 0;
        return data;
      } else if (Part == "SpeakPart1" || Part == "S1") {
        const data = documentSnapshot.data().MaxQuestion?.S1 || 0;
        return data;
      } else if (Part == "SpeakPart2" || Part == "S2") {
        const data = documentSnapshot.data().MaxQuestion?.S2 || 0;
        return data;
      } else if (Part == "SpeakPart3" || Part == "S3") {
        const data = documentSnapshot.data().MaxQuestion?.S3 || 0;
        return data;
      } else if (Part == "SpeakPart4" || Part == "S4") {
        const data = documentSnapshot.data().MaxQuestion?.S4 || 0;
        return data;
      } else if (Part == "SpeakPart5" || Part == "S5") {
        const data = documentSnapshot.data().MaxQuestion?.S5 || 0;
        return data;
      }
    } else {
      return 0;
    }
  } catch (e) {
    console.error("Error get document: ", e);
    return 0;
  }
};
const getQuestion = async (req, res) => {
  const myCollection = collection(firestore, req.params.Part);
  try {
    let max = 0;
    await getMaxquestion(req.params.userId, req.params.Part).then((item) => {
      max = item;
    });
    const num = parseInt(req.params.number) + parseInt(max);
    const queryConstraints = [
      where("Order", ">", max),
      where("Order", "<=", num),
    ];
    const q = query(myCollection, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const docId = doc.id;
      return { ...data, Id: docId };
    });
    res.json({ success: true, Questions: list });
  } catch (e) {
    res.json({
      success: false,
      message: "something went wrong when get data from getQuestion",
    });
  }
};
const pushHistoryUser1 = async (
  userId,
  id,
  part,
  quantity,
  sign,
  DetailQty,
  Score
) => {
  const myCollection = collection(firestore, "Users");
  const docRef = doc(myCollection, userId);
  try {
    const documentSnapshot = await getDoc(docRef);
    if (documentSnapshot.exists()) {
      const userData = documentSnapshot.data();
      const data = userData.HistoryPractice || [];
      data.unshift(id);
      await updateDoc(docRef, { HistoryPractice: data });
      if (sign != "noMax") {
        let max = 0;
        await getMaxquestion(userId, part).then((item) => {
          max = item;
        });
        const num = parseInt(quantity) + parseInt(max);
        //
        let analysisPr = {};
        await getAnalysis(userId, part).then((item) => {
          analysisPr = item;
        });
        const SumQuantity = DetailQty + analysisPr.Qty;
        const SumScore = Score + analysisPr.Score;

        if (part == "L1") {
          const data2 = documentSnapshot.data().MaxQuestion || { L1: num };
          data2.L1 = num;
          const data3 = documentSnapshot.data().AnalysisPractice || {
            L1: { Score: SumScore, Qty: SumQuantity },
          };
          data3.L1 = { Score: SumScore, Qty: SumQuantity };
          await updateDoc(docRef, {
            MaxQuestion: data2,
            AnalysisPractice: data3,
          });
        } else if (part == "L2") {
          const data2 = documentSnapshot.data().MaxQuestion || { L2: num };
          data2.L2 = num;
          const data3 = documentSnapshot.data().AnalysisPractice || {
            L2: { Score: SumScore, Qty: SumQuantity },
          };
          data3.L2 = { Score: SumScore, Qty: SumQuantity };
          await updateDoc(docRef, {
            MaxQuestion: data2,
            AnalysisPractice: data3,
          });
        } else if (part == "L3") {
          const data2 = documentSnapshot.data().MaxQuestion || { L3: num };
          data2.L3 = num;
          const data3 = documentSnapshot.data().AnalysisPractice || {
            L3: { Score: SumScore, Qty: SumQuantity },
          };
          data3.L3 = { Score: SumScore, Qty: SumQuantity };
          await updateDoc(docRef, {
            MaxQuestion: data2,
            AnalysisPractice: data3,
          });
        } else if (part == "L4") {
          const data2 = documentSnapshot.data().MaxQuestion || { L4: num };
          data2.L4 = num;
          const data3 = documentSnapshot.data().AnalysisPractice || {
            L4: { Score: SumScore, Qty: SumQuantity },
          };
          data3.L4 = { Score: SumScore, Qty: SumQuantity };
          await updateDoc(docRef, {
            MaxQuestion: data2,
            AnalysisPractice: data3,
          });
        } else if (part == "R1") {
          const data2 = documentSnapshot.data().MaxQuestion || { R1: num };
          data2.R1 = num;
          const data3 = documentSnapshot.data().AnalysisPractice || {
            R1: { Score: SumScore, Qty: SumQuantity },
          };
          data3.R1 = { Score: SumScore, Qty: SumQuantity };
          await updateDoc(docRef, {
            MaxQuestion: data2,
            AnalysisPractice: data3,
          });
        } else if (part == "R2") {
          const data2 = documentSnapshot.data().MaxQuestion || { R2: num };
          data2.R2 = num;
          const data3 = documentSnapshot.data().AnalysisPractice || {
            R2: { Score: SumScore, Qty: SumQuantity },
          };
          data3.R2 = { Score: SumScore, Qty: SumQuantity };
          await updateDoc(docRef, {
            MaxQuestion: data2,
            AnalysisPractice: data3,
          });
        } else if (part == "R3") {
          const data2 = documentSnapshot.data().MaxQuestion || { R3: num };
          data2.R3 = num;
          const data3 = documentSnapshot.data().AnalysisPractice || {
            R3: { Score: SumScore, Qty: SumQuantity },
          };
          data3.R3 = { Score: SumScore, Qty: SumQuantity };
          await updateDoc(docRef, {
            MaxQuestion: data2,
            AnalysisPractice: data3,
          });
        } else if (part == "W1") {
          const data2 = documentSnapshot.data().MaxQuestion || { W1: num };
          data2.W1 = num;
          await updateDoc(docRef, { MaxQuestion: data2 });
        } else if (part == "W2") {
          const data2 = documentSnapshot.data().MaxQuestion || { W2: num };
          data2.W2 = num;
          await updateDoc(docRef, { MaxQuestion: data2 });
        } else if (part == "W3") {
          const data2 = documentSnapshot.data().MaxQuestion || { W3: num };
          data2.W3 = num;
          await updateDoc(docRef, { MaxQuestion: data2 });
        } else if (part == "S1") {
          const data2 = documentSnapshot.data().MaxQuestion || { S1: num };
          data2.S1 = num;
          await updateDoc(docRef, { MaxQuestion: data2 });
        } else if (part == "S2") {
          const data2 = documentSnapshot.data().MaxQuestion || { S2: num };
          data2.S2 = num;
          await updateDoc(docRef, { MaxQuestion: data2 });
        } else if (part == "S3") {
          const data2 = documentSnapshot.data().MaxQuestion || { S3: num };
          data2.S3 = num;
          await updateDoc(docRef, { MaxQuestion: data2 });
        } else if (part == "S4") {
          const data2 = documentSnapshot.data().MaxQuestion || { S4: num };
          data2.S4 = num;
          await updateDoc(docRef, { MaxQuestion: data2 });
        } else if (part == "S5") {
          const data2 = documentSnapshot.data().MaxQuestion || { S5: num };
          data2.S5 = num;
          await updateDoc(docRef, { MaxQuestion: data2 });
        }
      }
    } else {
      const data = {
        HistoryPractice: [id],
      };
      await setDoc(docRef, data);
    }
  } catch (error) {
    console.error("Error pushHistoryUser1: ", error);
  }
};
const pushPracticeHistory = async (req, res) => {
  const myCollection = collection(firestore, "PracticeHistory");
  const data = req.body;
  await addDoc(myCollection, data)
    .then((docRef) => {
      res.send({ message: "Data saved successfully" });
      pushHistoryUser1(
        req.params.userId,
        docRef.id,
        req.body.Part,
        req.body.Quantity,
        req.params.sign,
        req.body.DetailQty,
        req.body.Score
      );
    })
    .catch((error) => {
      console.error("Error adding document pushHistory: ", error);
    });
};
const getOneQuestion = async (req, res) => {
  const myCollection = collection(firestore, req.params.Part);
  const docRef = doc(myCollection, req.params.Qid);
  try {
    const documentSnapshot = await getDoc(docRef);

    if (documentSnapshot.exists()) {
      const data = { ...documentSnapshot.data(), Id: documentSnapshot.id };
      res.json({ success: true, question: data });
    } else {
      res.json({ success: true, question: {} });
    }
  } catch (e) {
    console.error("Error get document: ", e);
  }
};
const getReviewQuestion = async (req, res) => {
  const list = [];
  const myCollection = collection(firestore, req.body.Part);
  const dataL = req.body.listQ;
  for (let i = 0; i < dataL.length; i++) {
    const docRef = doc(myCollection, dataL[i]);
    try {
      const documentSnapshot = await getDoc(docRef);

      if (documentSnapshot.exists()) {
        const data = { ...documentSnapshot.data(), Id: documentSnapshot.id };
        list.push(data);
      }
    } catch (e) {
      console.error("Error get document: ", e);
    }
  }
  res.json({ success: true, questionL: list });
};
const get1PHistory = async (list) => {
  const myCollection = collection(firestore, "PracticeHistory");
  const dataList = [];
  for (let i = 0; i < list.length; i++) {
    const docRef = doc(myCollection, list[i]);
    try {
      const documentSnapshot = await getDoc(docRef);

      if (documentSnapshot.exists()) {
        const data = { ...documentSnapshot.data(), Id: documentSnapshot.id };
        dataList.push(data);
      }
    } catch (e) {
      console.error("Error get document: ", e);
    }
  }
  return dataList;
};
const uploadAudio = async (audio) => {
  try {
    // Lưu file âm thanh MP3 vào Firebase Storage
    const bucket = admin.storage().bucket();
    const destinationFileName = "audios/" + audio + ".pdf";
    await bucket.upload(audio, {
      destination: destinationFileName,
      metadata: {
        contentType: "audio/mpeg", // Định dạng MIME của file MP3
      },
    });

    // Lấy URL của file sau khi upload thành công
    const file = bucket.file(destinationFileName);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491", // Thời gian URL hết hạn
    });

    return url;
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);
    throw error;
  }
};

const addQuestion = async (req, res) => {
  try {
    const data = req.body;
    if (data.Image && data.Image.startsWith("uploads")) {
      await uploadImage(data.Image).then((x) => {
        data.Image = x;
      });
    }
    if (data.Audio && data.Audio.startsWith("uploads")) {
      await uploadAudio(data.Audio).then((x) => {
        data.Audio = x;
      });
    }
    if (data.Picture && data.Picture.startsWith("uploads")) {
      await uploadImage(data.Picture).then((x) => {
        data.Image = x;
      });
    }
    const myCollection = collection(firestore, req.params.Part);
    await addDoc(myCollection, data);
    console.log("Document successfully add!");
    res.send({ message: "Question added successfully" });
  } catch (error) {
    console.error("Error adding document: ", error);
    res
      .status(500)
      .json({
        success: false,
        message: "something went wrong when adding question",
      });
  }
};
const countQuestion = async (req, res) => {
  db.collection(req.params.Part)
    .get()
    .then((snapshot) => {
      const count = snapshot.size + 1;
      res.json({ success: true, Order: count });
      console.log(`Số lượng document id trong collection: ${count}`);
    })
    .catch((error) => {
      console.log("Lỗi khi đếm số lượng document id:", error);
    });
};
const getAllQuestion = async (req, res) => {
  try {
    db.collection(req.params.Part)
      .orderBy("Order", "asc")
      .get()
      .then((querySnapshot) => {
        const list = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const docId = doc.id;
          return { ...data, Id: docId };
        });
        // console.log(list.length+req.params.Part )
        res.json({ success: true, Questions: list });
      });
  } catch (e) {
    res.json({
      success: false,
      message: "something went wrong when get data from getQuestion",
    });
  }
};
const updateQuestion = async (req, res) => {
  const myCollection = collection(firestore, req.params.Part);
  const docRef = doc(myCollection, req.params.Qid);
  try {
    const data = req.body;
    if (data.Image && data.Image.startsWith("uploads")) {
      await uploadImage(data.Image).then((x) => {
        data.Image = x;
      });
    }
    if (data.Audio && data.Audio.startsWith("uploads")) {
      await uploadAudio(data.Audio).then((x) => {
        data.Audio = x;
      });
    }
    if (data.Picture && data.Picture.startsWith("uploads")) {
      await uploadImage(data.Picture).then((x) => {
        data.Image = x;
      });
    }
    await updateDoc(docRef, data);
    console.log("Document successfully updated!");
    res.send({ message: "Document successfully updated!" });
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};
const deleteQuestion = async (req, res) => {
  try {
    const documentRef = db.collection(req.params.Part).doc(req.params.Qid);
    await documentRef.delete();
    console.log("Document deleted successfully.");
  } catch (error) {
    console.log("Error deleting document:", error);
  }
};
const getSavedQuestion = async (req, res) => {
  const myCollection = collection(firestore, "Users");
  const docRef = doc(myCollection, req.params.userId);
  try {
    const documentSnapshot = await getDoc(docRef);

    if (documentSnapshot.exists()) {
      const data = documentSnapshot.data().SavedQuestion || [];
      res.json({ success: true, savedQuestion: data });
    } else {
      console.log("Document does not exist.");
      res.json({ success: true, savedQuestion: "-1" });
    }
  } catch (e) {
    res.json({
      success: false,
      message: "something went wrong when get data from save question",
    });
    console.log(e);
  }
};
const updateSavedQ = async (req, res) => {
  const myCollection = collection(firestore, "Users");
  const docRef = doc(myCollection, req.params.userId);
  try {
    await updateDoc(docRef, req.body);
    console.log("Document successfully updated!");
    res.send({ message: "Document successfully updated!" });
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};
module.exports = {
  getQuestion,
  pushPracticeHistory,
  getOneQuestion,
  get1PHistory,
  getMaxquestion,
  pushHistoryUser1,
  addQuestion,
  countQuestion,
  getAllQuestion,
  updateQuestion,
  deleteQuestion,
  getReviewQuestion,
  getSavedQuestion,
  updateSavedQ,
};
