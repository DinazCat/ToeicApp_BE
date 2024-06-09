const express = require("express");
const router = express.Router();
const {
  getVocabLesson,
  getVocabinLesson,
  getVocabs,
  setAlarmVocab,
  getAlarmVocab,
  updateAlarmVocab,
  addVocab,
  addVocabLesson,
  updateTopic,
  deleteTopic,
  updateVocab,
  deleteVocab,
} = require("../controllers/Vocab");
const {
  setUserInfo,
  updateUser,
  getAllUsers,
  getUserData,
  updateUserPrivate,
  getAllTeachers,
  addReview,
  updateReview,
  setTeacherInfo,
} = require("../controllers/User");
const {
  uploadAudio,
  uploadPracticeHistory,
} = require("../controllers/SWskills");
const {
  getQuestion,
  pushPracticeHistory,
  getOneQuestion,
  addQuestion,
  countQuestion,
  getAllQuestion,
  updateQuestion,
  deleteQuestion,
  getReviewQuestion,
  getSavedQuestion,
  updateSavedQ,
} = require("../controllers/Question");
const {
  uploadPracticePlan,
  getPracticePlan,
  updatePracticePlan,
} = require("../controllers/PracticePlan");
const {
  addPost,
  updatePost,
  addComment,
  getOneComment,
  addNotification,
  deleteNotification,
  updateNotification,
  filterOnlyPost,
  filterOnlyhashtag,
  filterBoth,
  pushSavedPost,
  getSavedPost,
  deletePost,
  getPosts,
} = require("../controllers/Post");
const {
  addTest,
  getAllTest,
  updateTest,
  deleteTest,
  uploadTestHistory,
  getTestTeacher,
} = require("../controllers/Test");

const {
  initiateCall,
  updateCall,
  addChatRoom,
  getChatRoom,
  getUserChatRooms,
  updateChatRoom,
  deleteChatRoom,
} = require("../controllers/Chat");

const {
  addAsignment,
  getAsignment,
  getClassAsignments,
  updateAsignment,
  deleteAsignment,
} = require("../controllers/Asignment");

const {
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
} = require("../controllers/Class");
const { getRecordings, getRangeDate } = require("../controllers/Meeting");
const { getAgendaOfUser } = require("../controllers/Agenda");

//vocab
router.get("/VocabLessons", getVocabLesson);
router.get("/VocabinLesson/:TopicId", getVocabinLesson);
router.get("/Vocabs", getVocabs);
router.get("/getAlarmVocab/:userId", getAlarmVocab);
router.post("/alarmVocab/:userId", setAlarmVocab);
router.put("/updateAlarmVocab/:userId", updateAlarmVocab);
//user
router.put("/setUserInfo/:userId", setUserInfo);
router.put("/setTeacherInfo/:userId", setTeacherInfo);
router.put("/updateUser/:userId", updateUser);
router.put("/updateUserPrivate/:userId", updateUserPrivate);
router.get("/Users", getAllUsers);
router.get("/UserData/:userId", getUserData);
router.get("/Teachers", getAllTeachers);
router.put("/addReview/:userId", addReview);
router.put("/updateReview/:userId", updateReview);
//question
router.get("/Question/:Part/:userId/:number", getQuestion);
router.post("/PracticeHistory/:userId/:sign", pushPracticeHistory);
router.get("/oneQuestion/:Part/:Qid", getOneQuestion);
router.post("/Question/:Part/add", addQuestion);
router.get("/countQuestion/:Part", countQuestion);
router.get("/getAllQuestion/:Part", getAllQuestion);
router.put("/updateQuestion/:Part/:Qid", updateQuestion);
router.delete("/deleteQuestion/:Part/:Qid", deleteQuestion);
router.post("/ReviewQuestion", getReviewQuestion);
router.get("/getSavedQuestion/:userId", getSavedQuestion);
router.put("/updateSavedQuestion/:userId", updateSavedQ);
router.post("/uploadAudio", uploadAudio);
router.post("/uploadPracticeHistory", uploadPracticeHistory);
//PracticePlan
router.post("/PracticePlan/:userId/add", uploadPracticePlan);
router.get("/PracticePlan/:userId", getPracticePlan);
router.put("/PracticePlan/:userId/update", updatePracticePlan);
//post
router.post("/addPost", addPost);
router.put("/updatePost/:postId", updatePost);
router.post("/addComment/:sign/:momId", addComment);
router.post("/addNotification", addNotification);
router.get("/getoneComment/:commentId", getOneComment);
router.delete("/deleteNoti/:notiId", deleteNotification);
router.put("/updateNoti/:notiId", updateNotification);
router.get("/filterOnlyhashtag/:hashtag", filterOnlyhashtag);
router.get("/filterOnlyPost/:userId/:type", filterOnlyPost);
router.get("/filterBoth/:userId/:type/:hashtag", filterBoth);
router.put("/savePost/:userId/:postId", pushSavedPost);
router.get("/getsavePost/:userId", getSavedPost);
router.delete("/deletePost/:postId", deletePost);
router.get("/getPosts", getPosts);
//addvocab
router.post("/addVocabLesson", addVocabLesson);
router.post("/addVocab", addVocab);
router.delete("/deleteTopic/:topicId", deleteTopic);
router.delete("/deleteVocab/:vocabId", deleteVocab);
router.put("/updateVocab/:vocabId", updateVocab);
router.put("/updateTopic/:topicId", updateTopic);
//test
router.post("/Test/add", addTest);
router.get("/Tests", getAllTest);
router.put("/Test/update/:testId", updateTest);
router.delete("/Test/delete/:testId", deleteTest);
router.post("/Test/TestHistory/:userId/upload", uploadTestHistory);
router.get("/getTestTeacher", getTestTeacher);
//chat
router.post("/Chat/initiateCall", initiateCall);
router.post("/Chat/updateCall", updateCall);
router.post("/ChatRoom/add", addChatRoom);
router.get("/ChatRoom/:id", getChatRoom);
router.get("/ChatRoom/getUserChatRoom/:userId", getUserChatRooms);
router.put("/ChatRoom/update/:id", updateChatRoom);
router.delete("/ChatRoom/delete/:id", deleteChatRoom);
//class
router.post("/Class/add", addClass);
router.post("/CreateFolder/add", addFolder);
router.get("/Classes", getAllClasses);
router.get("/Transactions", getAllTransaction);
router.get("/Classes/:userId", getClassesByUser);
router.post("/Class/register", registerCourse);
router.get("/Teachers/:userId", getTeachersOfClasses);
router.put("/updateFile/:classId", updateFile);
router.put("/deleteFile/:classId", deleteFile);
router.put("/updateFolder/:folderId", updateFolder);
router.delete("/deleteFolder/:Id", deleteFolder);
router.get("/Transaction/:userId/:classId", checkTransaction);
router.get("/ClassData/:classId", getClassData);
router.put("/updateClass/classId", updateClass);
//Meeting
router.get("/Meeting/getRecordings/:classId", getRecordings);
router.get("/Meeting/getRangeDate/:classId", getRangeDate);
//Agenda
router.get("/Agenda/getAgendaOfUser/:userId", getAgendaOfUser);
//Assignment
router.post("/Asignment/add", addAsignment);
router.get("/Asignment/:id", getAsignment);
router.get("/getClassAsignment", getClassAsignments);
router.put("/Asignment/update/:id", updateAsignment);
router.delete("/Asignment/delete/:id", deleteAsignment);

module.exports = router;
