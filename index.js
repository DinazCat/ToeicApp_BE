const express = require('express');
const {firebase,db}= require('./config')
const cron = require('node-cron')
const PORT = 3000;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { getFirestore, collection, getDocs,addDoc, updateDoc, doc, setDoc,getDoc} = require('firebase/firestore');
const firestore = getFirestore(firebase);
const { sendNotification} = require('./controllers/User')
const {get1PHistory} = require('./controllers/Question')

const SendNoti= async()=>{
    const myCollection = collection(firestore, 'Users');
    const querySnapshot = await getDocs(myCollection);
    const list = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const docId = doc.id;
        return { ...data, Id: docId };
      });
    list.forEach((user) => {
        if(user.vocabAlarms){
        user.vocabAlarms.forEach((item)=>{
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
              let x = s + " " + m + " "+ h + " * * *"
            cron.schedule(x, () => {
                sendNotification(user.token,item.Id);
              });
        })
    }
      });
}
const cors = require('cors')
const app = express();
const router = require('./router/router1')

const http = require('http');
const server = http.createServer(app)
const {Server}= require("socket.io")
const io = new Server(server);
const moment = require('moment');
let userId = '6uz50o2mYWORgoBVzmYsHZYyq622';
io.on('connection', (socket) => {
//   console.log('New Client connected');
  socket.on('UserId',(data)=>{
    userId = data;
    console.log(data)
  })
  //realtime cho alarmVocab
  db.collection('Users').doc(userId)
  .onSnapshot((doc)=>{
    if (doc.exists) {
      const list = doc.data().vocabAlarms;
      const list1 = doc.data().SavedQuestion;
      // const name = userId+'Alarmchange'
      // io.emit(name, list)
      io.emit(userId+'savedQ', list1)
    } else {
      // const name = userId+'Alarmchange'
      // io.emit(name, [])
    }
  })
    //realtime cho history home
    db.collection('Users').doc(userId)
    .onSnapshot((doc)=>{
      if (doc.exists) {
        const list = doc.data().HistoryPractice;
        if(list){
            const name = userId+'PHistorychange'
            get1PHistory(list).then(item => {io.emit(name, item)});
        }
      } 
    })
    //realtime cho Practice Plan
    db.collection('PracticePlan').doc(userId)
    .onSnapshot((doc)=>{
      if (doc.exists) {
        const list = doc.data();
        if(list){
            const name = userId+'PracticePlanChange'
            
            io.emit(name, list);
        }
      } 
    })
    //realtime cho TestHistory
    db.collection('TestHistory')
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
        const name = userId + 'TestHistoryChange';
        io.emit(name, dataList);
      }
    });
     //realtime cho posts in forum
  db.collection('Posts')
  .orderBy('postTime.seconds', 'desc')
  .onSnapshot((querySnapshot)=>{
    const list = [];
    const list2 = [];
    querySnapshot.forEach(doc =>{
      const dateSeconds = moment.unix(doc.data().postTime.seconds);
      const data = {...doc.data(),postTime:dateSeconds.format('DD-MM-YYYY HH:mm')}
      if(data.Allow == true){
        list.push(data)
      }
      if(doc.data().userId == userId){
        list2.push(data)
      }
      //realtime cho list comment trong post
      io.emit(doc.data().postId,doc.data().comments)
      //realtime cho detailpost
      io.emit(doc.data().postId+'detailpost',data)
    })
    io.emit('mainPosts', list)
    //realtime cho posts in profile
    const name = userId+'userPosts'
    io.emit(name, list2)
  })
    //realtime cho 1 comments in posts
    db.collection('Comments')
    .onSnapshot((querySnapshot)=>{
      querySnapshot.forEach(doc =>{
        io.emit(doc.data().commentId, doc.data())
      })
    })
    //realtime cho notification
    db.collection('Notification')
    .orderBy('time', 'desc')
    .onSnapshot((querySnapshot)=>{
      querySnapshot.forEach(doc =>{
        if(doc.data().classify=='reply'){
          io.emit(doc.data().CommentownerId+'noti', doc.data())
          if(doc.data().Read=='no'){
            io.emit(doc.data().CommentownerId+'sign', '1')
          }
        }
        else{
          io.emit(doc.data().PostownerId+'noti', doc.data())
          if(doc.data().Read=='no'){
            io.emit(doc.data().PostownerId+'sign', '1')
          }
        }
      })
    })
  // Xử lý khi client gửi yêu cầu
  socket.on('connect', (data) => {
    console.log("socket connected")
  });
});

// app.use(express.json());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(cors())
app.use('/api',router)
app.post('/upload', upload.single('image'), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);
  
  res.json({ message: 'Image uploaded successfully',photo:file.path });
});
app.post('/uploadaudio', upload.single('audio'), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);
  
  res.json({ message: 'Audio uploaded successfully',audio:file.path });
});
app.post('/uploadvideo', upload.single('video'), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);   
  res.json({ message: 'Image uploaded successfully',video:file.path });
});
app.post('/uploadpdf', upload.single('pdf'), (req, res) => {
  // Do something with the uploaded image
  const file = req.file;
  console.log(file);   
  res.json({ message: 'Image uploaded successfully',filepdf:file.path });
});

// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// })
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
}

// app.on("close", () => {
//     clearInterval(interval);
//   });
module.exports = server;