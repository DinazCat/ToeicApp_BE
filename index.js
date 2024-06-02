const express = require("express");
const { firebase, db, admin } = require("./config");
const cron = require("node-cron");
const PORT = 3000;
const multer = require("multer");
const fs = require('fs');
const mammoth = require('mammoth');
const path = require('path');
const upload = multer({ dest: "uploads/" });
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const crypto = require('crypto')


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
const firestore = getFirestore(firebase);
const { sendNotification } = require("./controllers/User");
const { get1PHistory } = require("./controllers/Question");

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
  db.collection("Class")
  .onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
        socket.emit("getMeetingId", {ClassId:data.classId,MeetingId:data.MeetingId});
        socket.emit("getFiles",{ClassId:data.classId,Files:data.FileSource})
    });

  })
    //realtime cho folder
    db.collection("Folder")
    .onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
          socket.emit("getFilesinFolder",{Id:data.idFolder,Files:data?.FileSource||[]})
      });
  
    })

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

  socket.on("chat message", ({ roomId, message }) => {
    db.collection("ChatRoom")
      .doc(roomId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const room = doc.data();
          room.users.forEach((user) => {
            io.to(user.userId).emit("chat message", { message });
          });
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
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
app.get('/getfilebase64/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  // console.log(filePath)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const base64Data = data.toString('base64');
      res.json({ base64: base64Data });
    }
  });
  // res.sendFile(filePath);
});
app.get('/getfilebinary/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  // console.log(filePath)

  res.sendFile(filePath);
});
app.get('/getfilehtml/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  mammoth.convertToHtml({ path: filePath })
  .then((result) => {
      const html = result.value; // Nội dung HTML được tạo từ tệp Word
      res.json({html:html})
  })
  .catch((err) => {
      console.error('Error converting to HTML: ', err);
  });
});
app.get('/getfileppthtml/:filename', (req, res) => {
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
app.post("/uploadvideotoFirestore", upload.single("video"), async (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  let r = ''
  await uploadVideo(file.path).then((x)=>r = x)
  res.json({ message: "Image uploaded successfully", video: r});
});
const uploadPPT=async(localFilePath)=>{
  const bucket = admin.storage().bucket();
  const destinationFileName = 'PPT/'+localFilePath+'.ppt';

  bucket.upload(localFilePath, {
    destination: destinationFileName,
    metadata: {
      contentType: 'application/vnd.ms-powerpoint', // Set the content type of the file
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
  console.log(url)
  return url;
}
app.post("/uploadpdf", upload.single("pdf"), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);
  res.json({ message: "Image uploaded successfully", filepdf: file.path });
});
app.post('/uploaddoc', upload.single('doc'), (req, res) => {
  res.json({ message: "Image uploaded successfully", filedoc: req.file.path});
});
app.post('/uploadppt', upload.single('ppt'), async (req, res) => {
  let r = ''
  await uploadPPT(req.file.path).then((x)=> r = x)
  res.json({ message: "Image uploaded successfully", fileppt: r});
});

// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// })
async function getSubtitles(videoUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(videoUrl, { waitUntil: 'networkidle2' });

  // Lấy nội dung trang
  const pageContent = await page.content();

  // Tìm URL phụ đề trong nội dung trang
  const subtitleUrl = extractSubtitleUrl(pageContent);
  console.log(subtitleUrl)
  if (!subtitleUrl) {
    await browser.close();
    throw new Error('No subtitles found for this video.');
  }

  // Tải phụ đề từ URL phụ đề
  const subtitlesResponse = await page.goto(subtitleUrl);
  let subtitlesText = await subtitlesResponse.text();
  subtitlesText = subtitlesText.replace(/&amp;#39;/g, "'")

  await browser.close();
  return subtitlesText;
}

function extractSubtitleUrl(pageContent) {
  const regex = /\"(https:\/\/www\.youtube\.com\/api\/timedtext\?[^"]+)\"/;
  const match = pageContent.match(regex);
  if (match) {
    let m = match[1].replace(/\\u0026/g, '&'); // Thay thế tất cả các lần xuất hiện của '\u0026' bằng '&'
    m = m.replace(/lang=ar/g, 'lang=en'); // Thay thế tất cả các lần xuất hiện của 'lang=ar' bằng 'lang=en'
    return decodeURI(m);
  } else {
    return null;
  }
}

app.get('/getSubtitle', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send('URL is required');
  }

  try {
    const subtitles = await getSubtitles(videoUrl);
    res.setHeader('Content-Type', 'text/plain');
    res.send(subtitles);
  } catch (error) {
    console.error('Error downloading subtitle:', error);
    res.status(500).send('Error downloading subtitle');
  }
});
app.use(bodyParser.json());
app.post('/momo_ipn', async (req, res) => {
  const ipnData = req.body;
  console.log('Received IPN from MoMo:', ipnData);

  const { partnerCode, orderId, requestId, amount, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData, signature } = ipnData;


  if (resultCode === 0) {
            console.log(`Transaction successful for Order ID: ${orderId}, Request ID: ${requestId}, Amount: ${amount}`);
            // Xử lý logic khi giao dịch thành công
              const myCollection = collection(firestore, 'Transaction');
              let extra = extraData.split(',')
              try{
                const data = {
                  userId:extra[0],
                  orderId:orderId,
                  orderInfo:orderInfo,
                  orderType:orderType,
                  amount:amount,
                  responseTime:responseTime,
                  classId:extra[1]
                }; 
                await addDoc(myCollection, data)
                .then((docRef) => {
                  const d = doc(myCollection, docRef.id);
                  updateDoc(d, {Id:docRef.id});
                })
                .catch((error) => {
                  console.error('Error adding document: ', error);
                });
              }
              catch(error){
                  console.error("Error addpost: ", error);
              }
              res.sendStatus(204);
              io.emit('transactionresult', {message:'success',userId:extraData});
        } else {
            console.log(`Transaction failed for Order ID: ${orderId}, Request ID: ${requestId}. Reason: ${message}`);
            // Xử lý logic khi giao dịch thất bại
            io.emit('transactionresult', {message:'fail',userId:extraData});
        }
  
});
 
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

// app.on("close", () => {
//     clearInterval(interval);
//   });
module.exports = server;
