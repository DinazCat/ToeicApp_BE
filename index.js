const express = require("express");
const { firebase, db, admin } = require("./config");
const cron = require("node-cron");
const PORT = 3000;
const multer = require("multer");
const fs = require("fs");
const mammoth = require("mammoth");
const path = require("path");
const upload = multer({ dest: "uploads/" });

const {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  arrayUnion,
} = require("firebase/firestore");
const firestore = getFirestore(firebase);
const { sendNotification } = require("./controllers/User");
const { get1PHistory } = require("./controllers/Question");
const { uploadImage } = require("./controllers/User");

const SendNoti = async () => {
  const myCollection = collection(firestore, "Users");
  const querySnapshot = await getDocs(myCollection);
  const list = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const docId = doc.id;
    return { ...data, Id: docId };
  });
  list.forEach((user) => {
    if (user.vocabAlarms) {
      user.vocabAlarms.forEach((item) => {
        let timeParts = item.Time.split(/:| /);
        if (timeParts.length === 4) {
          if (timeParts[3] === "PM") {
            timeParts[0] = String(parseInt(timeParts[0]) + 12);
          }
        } else {
          timeParts[0] = String(parseInt(timeParts[0]));
        }

        let h = parseInt(timeParts[0]);
        let m = parseInt(timeParts[1]);
        let s = parseInt(timeParts[2]);
        let x = s + " " + m + " " + h + " * * *";
        cron.schedule(x, () => {
          sendNotification(user.token, item.Id);
        });
      });
    }
  });
};
const cors = require("cors");
const app = express();
const router = require("./router/router1");

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const moment = require("moment");
let userId = "6uz50o2mYWORgoBVzmYsHZYyq622";
const chatRooms = new Map();

io.use((socket, next) => {
  if (socket.handshake.query) {
    let callerId = socket.handshake.query.callerId;
    socket.user = callerId;
    next();
  }
});

io.on("connection", (socket) => {
  socket.on("UserId", (data) => {
    userId = data;
    console.log(data);
  });
  //receive and send meetingId
  // socket.on("MeetingId", (data) => {
  //   console.log(data)
  //   socket.emit("getMeetingId", data);
  // });
  db.collection("Class").onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      socket.emit("getMeetingId", {
        ClassId: data.classId,
        MeetingId: data.MeetingId,
      });
      socket.emit("getFiles", {
        ClassId: data.classId,
        Files: data.FileSource,
      });
    });
  });
  //realtime cho folder
  db.collection("Folder").onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      socket.emit("getFilesinFolder", {
        Id: data.idFolder,
        Files: data?.FileSource || [],
      });
    });
  });

  //realtime cho alarmVocab
  db.collection("Users")
    .doc(userId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const list = doc.data().vocabAlarms;
        const list1 = doc.data().SavedQuestion;
        // const name = userId+'Alarmchange'
        // io.emit(name, list)
        io.emit(userId + "savedQ", list1);
      } else {
        // const name = userId+'Alarmchange'
        // io.emit(name, [])
      }
    });
  //realtime cho history home
  db.collection("Users")
    .doc(userId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const list = doc.data().HistoryPractice;
        if (list) {
          const name = userId + "PHistorychange";
          get1PHistory(list).then((item) => {
            io.emit(name, item);
          });
        }
      }
    });
  //realtime cho Practice Plan
  db.collection("PracticePlan")
    .doc(userId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const list = doc.data();
        if (list) {
          const name = userId + "PracticePlanChange";

          io.emit(name, list);
        }
      }
    });
  //realtime cho TestHistory
  db.collection("TestHistory")
    //.where('UserId', '==', userId)
    .onSnapshot((querySnapshot) => {
      const dataList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          data.Id = doc.id;
          dataList.push(data);
        }
      });

      if (dataList.length > 0) {
        const name = userId + "TestHistoryChange";
        io.emit(name, dataList);
      }
    });
  //realtime cho posts in forum
  db.collection("Posts")
    .orderBy("postTime.seconds", "desc")
    .onSnapshot((querySnapshot) => {
      const list = [];
      const list2 = [];
      querySnapshot.forEach((doc) => {
        const dateSeconds = moment.unix(doc.data().postTime.seconds);
        const data = {
          ...doc.data(),
          postTime: dateSeconds.format("DD-MM-YYYY HH:mm"),
        };
        if (data.Allow == true) {
          list.push(data);
        }
        if (doc.data().userId == userId) {
          list2.push(data);
        }
        //realtime cho list comment trong post
        io.emit(doc.data().postId, doc.data().comments);
        //realtime cho detailpost
        io.emit(doc.data().postId + "detailpost", data);
      });
      io.emit("mainPosts", list);
      //realtime cho posts in profile
      const name = userId + "userPosts";
      io.emit(name, list2);
    });
  //realtime cho 1 comments in posts
  db.collection("Comments").onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      io.emit(doc.data().commentId, doc.data());
    });
  });
  //realtime cho notification
  db.collection("Notification")
    .orderBy("time", "desc")
    .onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().classify == "reply") {
          io.emit(doc.data().CommentownerId + "noti", doc.data());
          if (doc.data().Read == "no") {
            io.emit(doc.data().CommentownerId + "sign", "1");
          }
        } else {
          io.emit(doc.data().PostownerId + "noti", doc.data());
          if (doc.data().Read == "no") {
            io.emit(doc.data().PostownerId + "sign", "1");
          }
        }
      });
    });
  //realtime for assignment
  db.collection("Asignment").onSnapshot((querySnapshot) => {
    socket.emit("assignment change", {});
    // querySnapshot.forEach((doc) => {
    //   const data = doc.data();
    // });
  });

  socket.on("join room", ({ roomId, userId }) => {
    socket.join(roomId);
    // Kiểm tra xem roomId đã tồn tại trong chatRooms chưa
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, new Set());
    }
    // Thêm kết nối socket vào danh sách người dùng trong phòng
    chatRooms.get(roomId).add(socket);
  });

  socket.on("chat message", ({ roomId, message }) => {
    io.emit("new message", { message, roomId });

    const chatRoomDoc = doc(firestore, "ChatRoom", roomId);
    updateDoc(chatRoomDoc, {
      messages: arrayUnion(message),
    })
      .then(() => {
        console.log("Updated new message!");
      })
      .catch((error) => {
        console.error("Error updating new message:", error);
      });
  });

  socket.on("leave room", () => {
    // TODO: Xử lý khi một người dùng rời phòng chat
  });

  socket.on("chats update", ({ roomId }) => {
    db.collection("ChatRoom")
      .doc(roomId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const users = doc.data().users;
          // users.forEach((user) => {
          //   io.to(user.userId).emit("new chat", roomId);
          // });
          io.emit("new chat", users);
        }
      });
  });

  // Xử lý khi client gửi yêu cầu
  socket.on("connect", (data) => {
    console.log("socket connected");
  });
});

// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.use(cors());
app.use("/api", router);
app.post("/upload", upload.single("image"), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);

  res.json({ message: "Image uploaded successfully", photo: file.path });
});
// Route để truy cập file
app.get("/getfilebase64/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  // console.log(filePath)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const base64Data = data.toString("base64");
      res.json({ base64: base64Data });
    }
  });
  // res.sendFile(filePath);
});
app.get("/getfilebinary/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  // console.log(filePath)

  res.sendFile(filePath);
});
app.get("/getfilehtml/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  mammoth
    .convertToHtml({ path: filePath })
    .then((result) => {
      const html = result.value; // Nội dung HTML được tạo từ tệp Word
      res.json({ html: html });
    })
    .catch((err) => {
      console.error("Error converting to HTML: ", err);
    });
});
app.get("/getfileppthtml/:filename", (req, res) => {
  // const filePath = path.join(__dirname, 'uploads', req.params.filename);
  // const outputDir = path.join(__dirname, 'output');
  // if (!fs.existsSync(outputDir)){
  //     fs.mkdirSync(outputDir);
  // }
  // pptx2html(filePath, outputDir)
  //     .then(() => {
  //         console.log('Conversion successful!');
  //         // Đọc và xử lý tệp HTML kết quả
  //         const htmlFilePath = path.join(outputDir, 'index.html');
  //         fs.readFile(htmlFilePath, 'utf8', (err, html) => {
  //             if (err) {
  //                 console.error('Error reading HTML file:', err);
  //                 return;
  //             }
  //             res.json({html:html})
  //         });
  //     })
  //     .catch(err => {
  //         console.error('Error converting PPTX to HTML:', err);
  //     });
});
app.post("/uploadaudio", upload.single("audio"), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);

  res.json({ message: "Audio uploaded successfully", audio: file.path });
});
app.post("/uploadvideo", upload.single("video"), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);
  res.json({ message: "Image uploaded successfully", video: file.path });
});
const uploadVideo = async (video) => {
  const bucket = admin.storage().bucket();
  return new Promise((resolve, reject) => {
    const timestamp = new Date().getTime().toString();

    const destination = `Videos/video${timestamp}.mp4`;

    const options = {
      contentType: "video/mp4",
    };

    // Upload file lên Firebase Storage
    bucket.upload(
      video,
      {
        destination: destination,
        ...options,
      },
      function (err, file) {
        if (err) {
          reject(err);
          return;
        }

        // Lấy URL của file vừa upload
        file.getSignedUrl(
          {
            action: "read",
            expires: "03-09-2491", // Thay thế bằng thời gian hết hạn theo mong muốn
          },
          function (err, url) {
            if (err) {
              reject(err);
              return;
            }

            resolve(url);
          }
        );
      }
    );
  });
};
app.post(
  "/uploadvideotoFirestore",
  upload.single("video"),
  async (req, res) => {
    // Do something with the uploaded image
    const file = req.file;
    let r = "";
    await uploadVideo(file.path).then((x) => (r = x));
    res.json({ message: "Image uploaded successfully", video: r });
  }
);
const uploadPPT = async (localFilePath) => {
  const bucket = admin.storage().bucket();
  const destinationFileName = "PPT/" + localFilePath + ".ppt";

  bucket
    .upload(localFilePath, {
      destination: destinationFileName,
      metadata: {
        contentType: "application/vnd.ms-powerpoint", // Set the content type of the file
      },
    })
    .then((file) => {
      console.log("File uploaded successfully.");
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
      return null;
    });
  const [url] = await bucket.file(destinationFileName).getSignedUrl({
    action: "read",
    expires: "03-01-3000", // Set an expiration date for the URL if required
  });
  console.log(url);
  return url;
};
app.post("/uploadpdf", upload.single("pdf"), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);
  res.json({ message: "Image uploaded successfully", filepdf: file.path });
});
app.post("/uploaddoc", upload.single("doc"), (req, res) => {
  res.json({ message: "Image uploaded successfully", filedoc: req.file.path });
});
app.post("/uploadppt", upload.single("ppt"), async (req, res) => {
  let r = "";
  await uploadPPT(req.file.path).then((x) => (r = x));
  res.json({ message: "Image uploaded successfully", fileppt: r });
});

app.post("/uploadImgToStorage", upload.single("image"), async (req, res) => {
  const file = req.file;
  console.log(file);

  const imgUrl = await uploadImage(file.path);
  res.json({
    message: "Image uploaded to storage successfully",
    imgUrl: imgUrl,
  });
});

app.post("/uploadFile", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    console.log(file);

    const bucket = admin.storage().bucket();
    const timestamp = new Date().getTime().toString();
    const destinationFileName = `Files/${timestamp}-${file.originalname}`;

    // Tải lên Firebase Storage
    await bucket.upload(file.path, {
      destination: destinationFileName,
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Lấy URL của file đã upload
    const fileUpload = bucket.file(destinationFileName);
    const [url] = await fileUpload.getSignedUrl({
      action: "read",
      expires: "03-01-2030",
    });

    const fileData = {
      name: file.originalname,
      size: file.size,
      url: url,
    };

    res.send({
      message: "File uploaded to storage successfully",
      file: fileData,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// })
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

// app.on("close", () => {
//     clearInterval(interval);
//   });
module.exports = server;
