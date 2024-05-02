const fetch = require('node-fetch');
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc,getDoc} = require('firebase/firestore');
const {storage} = require('firebase/storage')
const {firebase,admin,db}= require('../config');
const { duration } = require('moment');
const firestore = getFirestore(firebase)
const checkToAdd = (date_Start,date_Finish)=>{
    const currentDate = new Date();
const currentDay = currentDate.getDate();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

const [day, month, year] = date_Start.split('/').map(Number);
const [day1, month1, year1] = date_Finish.split('/').map(Number);
console.log(day+","+day1)
if(currentYear > year && currentYear < year1){
    return true
}
else if (currentYear == year && currentMonth > month){
    return true
}
else if (currentYear == year && currentMonth == month && currentDay >= day){
    return true
}
else if (currentYear == year && currentMonth == month && currentDay < day){
    return false
}
else if (currentYear == year1 && currentMonth < month1){
    return true
}
else if (currentYear == year1 && currentMonth == month1 && currentDay <= day1){
    return true
} else {
    return false
}
}
const compareTime = (time1, time2)=>{
    const t1 = time1.split('-')
    const t2 = time2.split('-')
    const [hh,mm] = t1[0].split(':').map(Number)
    const [hh1,mm1] = t2[0].split(':').map(Number)
    if(hh < hh1){
        return 1
    }
    else if(hh > hh1){
        return -1
    }
    else if(hh == hh1 && mm <= mm1){
        return 1
    }
    else return -1
}
const getAgendaOfUser = async(req,res)=>{
    let schedule_ = [[],[],[],[],[],[],[]]
    const myCollection = collection(firestore, 'Users');
    const docRef = doc(myCollection, req.params.userId);
    const documentSnapshot = await getDoc(docRef);
  
  if (documentSnapshot.exists()) {
    const data_Classes = documentSnapshot.data().Classes;
    for(let i = 0; i < data_Classes.length; i++){
        const Collection_Class = collection(firestore, 'Class');
    const docRef1 = doc(Collection_Class, data_Classes[i]);
    const documentSnapshot1 = await getDoc(docRef1);
    const data_Agenda = documentSnapshot1.data().Schedule
    console.log(data_Agenda)
    const data_ClassName = documentSnapshot1.data().ClassName
    const data_DateStart = documentSnapshot1.data().Start_Date
    const data_DateFinish = documentSnapshot1.data().Finish_Date
    if(checkToAdd(data_DateStart,data_DateFinish)){
    for(let j = 0; j < data_Agenda.length; j++){
        switch (data_Agenda[j].Date) {
            case 'Sunday':
              schedule_[6].push({
                Name: data_ClassName,
                Time: data_Agenda[j].Time_start + '-' + data_Agenda[j].Time_finish,
              });
              break;
            case 'Monday':
                schedule_[0].push({
                    Name: data_ClassName,
                    Time: data_Agenda[j].Time_start + '-' + data_Agenda[j].Time_finish,
                  });
              break;
            case 'Tuesday': // Thứ ba
            schedule_[1].push({
                Name: data_ClassName,
                Time: data_Agenda[j].Time_start + '-' + data_Agenda[j].Time_finish,
              });
              break;
            case 'Wednesday': // Thứ tư
            schedule_[2].push({
                Name: data_ClassName,
                Time: data_Agenda[j].Time_start + '-' + data_Agenda[j].Time_finish,
              });
              break;
            case 'Thursday': // Thứ năm
            schedule_[3].push({
                Name: data_ClassName,
                Time: data_Agenda[j].Time_start + '-' + data_Agenda[j].Time_finish,
              });
              break;
            case 'Friday': // Thứ sáu
            schedule_[4].push({
                Name: data_ClassName,
                Time: data_Agenda[j].Time_start + '-' + data_Agenda[j].Time_finish,
              });
              break;
            case 'Saturday': // Thứ bảy
            schedule_[5].push({
                Name: data_ClassName,
                Time: data_Agenda[j].Time_start + '-' + data_Agenda[j].Time_finish,
              });
              break;
            default:
              break;
          }
    }
}
   
    }
  }
  for(let i = 0; i < 7; i++){
    schedule_[i].sort((a, b) => compareTime(a.Time,b.Time));
  }
  res.json({success:true, list:schedule_});
}

module.exports={getAgendaOfUser}