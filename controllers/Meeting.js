const fetch = require('node-fetch');
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc,getDoc} = require('firebase/firestore');
const {storage} = require('firebase/storage')
const {firebase,admin,db}= require('../config');
const moment = require('moment');
const firestore = getFirestore(firebase)
const options = {
	method: "GET",
	headers: {
		"Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJhMzgxYWJlMS01ODc1LTQwNDEtOGY2ZC0wOTdkMzQ2NDNkM2EiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTcxMDU5MTkyNiwiZXhwIjoxODY4Mzc5OTI2fQ.O-nDX7-tEHkuYXIosxmmFqUcyfdM97VhJOgUrlMl5Zw",
		"Content-Type": "application/json",
	},
};

const getRecordings = async (req,res)=>{
    const myCollection = collection(firestore, 'Class');
    const docRef = doc(myCollection, req.params.classId);
    try{
    const documentSnapshot = await getDoc(docRef);
  
  if (documentSnapshot.exists()) {
    const data = documentSnapshot.data();
    let list = [];
    for(let i = data.Recordings.length-1; i >= 0; i--){
        const url= `https://api.videosdk.live/v2/recordings?roomId=${data.Recordings[i].id}&&composerId=${data.Recordings[i].composerId}`;
        const response = await fetch(url, options);
        const records = await response.json();
        list.push({File:records.data[data.Recordings[i].count-1].file.fileUrl,Name:data.Recordings[i].name, userName:data.Recordings[i].user, Duration:records.data[data.Recordings[i].count-1].file.meta.duration})
      
    }
    res.json({success:true, recordings:list});
    
  } else {
    console.log('Document does not exist.');
    
  }
    }
    catch(e){
        res.json({
            success:false,
            message:'something went wrong when get data from class Recordings'
        })
        console.log(e)
    }
  }
  const getRangeDate = async (req,res)=>{
    const myCollection = collection(firestore, 'Class');
    const docRef = doc(myCollection, req.params.classId);
    const documentSnapshot = await getDoc(docRef);
    const classInfo = documentSnapshot.data();
    const startDate = moment(classInfo.Start_Date,"DD/MM/YYYY");
    const endDate = moment(classInfo.Finish_Date,"DD/MM/YYYY");
  
    // Mảng để lưu trữ các ngày chủ nhật trong khoảng thời gian
    let list = [];
    let list2 = []
    for (let i = 0; i < classInfo.Schedule.length; i++){
      switch (classInfo.Schedule[i].Date) {
        case 'Sunday':
          list2.push(0)
          break;
        case 'Monday':
          list2.push(1)
          break;
        case 'Tuesday': // Thứ ba
        list2.push(2)
          break;
        case 'Wednesday': // Thứ tư
        list2.push(3)
          break;
        case 'Thursday': // Thứ năm
        list2.push(4)
          break;
        case 'Friday': // Thứ sáu
        list2.push(5)
          break;
        case 'Saturday': // Thứ bảy
        list2.push(6)
          break;
        default:
          break;
      }
    }
  
    // Lặp qua từng ngày trong khoảng thời gian
    while (startDate.isBefore(endDate) || startDate.isSame(endDate)) {
      // Nếu ngày hiện tại là chủ nhật (dựa vào ngày trong tuần là 0)
      for(let i = 0; i < list2.length; i++){
        if (startDate.day() === list2[i]) {
          let listContent = []
          for(let j = 0; j < classInfo.Recordings.length; j++){
            if(moment(classInfo.Recordings[j].Date,"DD/MM/YYYY").isSame(startDate)){
              const url= `https://api.videosdk.live/v2/recordings?roomId=${classInfo.Recordings[j].id}&&composerId=${classInfo.Recordings[j].composerId}`;
              const response = await fetch(url, options);
              const records = await response.json();
              listContent.push({File:records.data[classInfo.Recordings[j].count-1].file.fileUrl,Name:classInfo.Recordings[j].name, userName:classInfo.Recordings[j].user, Duration:records.data[classInfo.Recordings[j].count-1].file.meta.duration,type:'Record'})
            }
          }
          // for(let j = 0; j < classInfo.Posts.length; j++){
          //   if(moment(classInfo.Posts[j].Date,"DD/MM/YYYY").isSame(startDate)){
          //     const PostInteam = collection(firestore, "PostInTeam");
          //     const docRef = doc(PostInteam, classInfo.Posts[j].id);
          //     const document = await getDoc(docRef);
          //     const Info = document.data();
          //     listContent.push({...Info,type:'Post'})
          //   }
          // }
          list.push({Date:startDate.format('DD/MM/YYYY'), Content:listContent});
          break;
        }
      }
            // Tăng ngày lên một
            startDate.add(1, 'day');
      
    }
    res.json({success:true, RangeDate:list});
  }

module.exports={getRecordings, getRangeDate}