const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc, getDoc} = require('firebase/firestore');
const {firebase,admin} = require('../config')
const firestore = getFirestore(firebase);
const { getStorage, ref, uploadString, getDownloadURL } = require('firebase/storage');


// const storage = admin.storage();
// const bucket = storage.bucket();
const storage = getStorage(firebase);

const uploadAudio = async (req, res) => {
    const { userId, audioData } = req.body;
    const fileName = `audios/audio_${userId}_${Date.now()}.mp3`; 
    // const file = bucket.file(fileName);
    // const audioBuffer = Buffer.from(audioData, 'base64');
    const audioRef = ref(storage, fileName);
    try {
        // await file.save(audioBuffer, {
        //     metadata: {
        //         contentType: 'audio/mpeg', 
        //     },
        // });

        // const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        // res.send({ success: true, downloadUrl: downloadUrl });

        await uploadString(audioRef, audioData, 'base64', { contentType: 'audio/mpeg' });

        const downloadURL = await getDownloadURL(audioRef);
        console.log(downloadURL);
        res.json({ success: true, downloadUrl: downloadURL })

    } catch (error) {
        console.error('Error uploading audio:', error);
        res.status(500).send({ success: false, message: 'Upload audio failed' });
    }
};
const uploadPracticeHistory = async (req, res) => {
    try {
        const myCollection = collection(firestore, 'PracticeHistory');
        await addDoc(myCollection, req.body);
        console.log("Document successfully post!");
        res.send({ message: 'Practice History post successfully' });
      } catch (error) {
        console.error("Error post history document: ", error);
        res.status(500).json({ success: false, message: 'something went wrong when upload practice history' });
      }
}

module.exports = { uploadAudio, uploadPracticeHistory };
