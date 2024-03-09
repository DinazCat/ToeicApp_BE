const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc, getDoc} = require('firebase/firestore');
const {firebase, admin} = require('../config')
const firestore = getFirestore(firebase);

// L1(6), L2(25), R1(30), L3(39), L4(30), R2(16), R3(54)
const targetPerPart1 = [5, 18, null, 22, 20, null, 16, 12, null, 28, null ]; //L(59), R(62)
const targetPerPart2 = [6, 22, null, 26, 28, null, 22, 14, null, 40, null]; //L(76), R(80)
const targetPerPart3 = [6, 24, null, 29, 33, null, 25, 15, null, 48, null]; //L(88), R(92)
const phasesTime1 = ['1', '2 - 4', '5' ,'6 - 8', '9 - 13', '14', '15 - 18', '19 - 21', '22', '23 - 29', '30'];
const phasesTime2 = ['1 - 2', '3 - 7', '8', '9 - 14', '15 - 23', '24', '25 - 32', '33 - 40', '41', '42 - 59', '60'];
const phasesTime3 = ['1 - 3', '4 - 14', '15', '16 - 26', '27 - 43', '44', '45 - 57', '58 - 65', '66', '67 - 89', '90'];
const phasesTime4 = ['1 - 4', '5 - 19', '20', '21 - 34', '35 - 55', '56', '57 - 73', '74 - 87', '88', '89 - 119', '120'];
const practiceContent = ['Photographs', 'Question & Response', 'Test 1', 'Incomplete Sentences', 'Short Conversations', 'Test 2', 'Short Talks', 'Text Completion', 'Test 3','Reading Comprehension', 'Test 4']

const buildPracticePlan = async (currentLevel, targetLevel, practiceDays, userId) =>{ 
    const PracticePhases = [];
    let Phases = [];
    let TargetPerPart = [];
    let QuestionsPerDay = 0;
    switch (practiceDays) {
        case 30:
            Phases = phasesTime1;
            QuestionsPerDay = 90 + (targetLevel - currentLevel - 1) * 30;
            break;        
        case 60:
            Phases = phasesTime2;
            QuestionsPerDay = 45 + (targetLevel - currentLevel - 1) * 15;
            break;
        case 90:
            Phases = phasesTime3;
            QuestionsPerDay = 30 + (targetLevel - currentLevel - 1) * 10;
            break; 
        case 120:
            Phases = phasesTime4;
            QuestionsPerDay = 25 + (targetLevel - currentLevel - 1) * 7;
            break;         
        default: 
            return null;           
    }
    switch(targetLevel){
        case 3:
            TargetPerPart = targetPerPart1;
            break;        
        case 4:
            TargetPerPart = targetPerPart2;
            break;
        case 5:
            TargetPerPart = targetPerPart3;
            break;         
        default:            
            return null;
    }
    for(let i = 0; i < Phases.length; i++){
        const [start, end] = Phases[i].split('-').map(num => parseInt(num.trim()));
        const Days = [];
        // If test day
        if (end === undefined){  
            if(start === 1){
                Days.push({ 
                    Day: 1, 
                    NumberofQuestions: QuestionsPerDay,
                    CompletedQuestion: 0,
                });
                PracticePhases[0] = {
                    Phases: Phases[0],
                    Target: TargetPerPart[0],
                    Content: practiceContent[0],
                    Days: Days,
                    // Assessment: 'numberofquestioninrealtest',
                }
            }
            else{
                PracticePhases[i] = {
                    Phases: Phases[i],
                    Target: TargetPerPart[i],
                    Content: practiceContent[i],
                    Test: 'testId'
                } 
            }
        } 
        // If practice day                    
        else{
            for(let i = start; i <= end; i++) {                  
                Days.push({ 
                    Day: i, 
                    NumberofQuestions: QuestionsPerDay,
                    CompletedQuestion: 0,
                });
                //console.log(Days);
            } 
            PracticePhases[i] = {
                Phases: Phases[i],
                Target: TargetPerPart[i],
                Content: practiceContent[i],
                Days: Days,
            }
        }                   
    }
    return {
        userId: userId,
        CurrentLevel: currentLevel,
        TargetLevel: targetLevel,
        PracticeDays: practiceDays,
        PracticePhases: PracticePhases,          
        QuestionsPerDay: QuestionsPerDay,
        CurrentPhase: {
            PhaseIndex: 0,
            CurrentDay: 1
        }
    } 
};

const uploadPracticePlan = async (req, res) => {
    try {
        const myCollection = collection(firestore, 'PracticePlan');
        const PracticePlan = await buildPracticePlan(req.body.currentLevel, req.body.targetLevel, req.body.practiceDays, req.params.userId);
        //console.log(PracticePlan);
        const specificDocRef = doc(myCollection, req.params.userId);
        await setDoc(specificDocRef, PracticePlan);
        console.log("Document successfully post!");
        res.send({ success: true, message: 'Practice Plan post successfully' });
    } catch (error) {
        console.error("Error post plan document: ", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const getPracticePlan= async (req, res) => {
    try {
        const myCollection = collection(firestore, 'PracticePlan');
        const docRef1 = doc(myCollection, req.params.userId);
        const documentSnapshot = await getDoc(docRef1);
  
        if (documentSnapshot.exists()) {
          res.send({ success: true, PracticePlan: documentSnapshot.data() });
        } else {
          res.status(404).send({ success: false, message: 'Practice plan not found' });
        }
      } catch (error) {
        console.error("Error get plan document: ", error);
        res.status(500).json({ success: false, message: 'something went wrong when get data from practice plan' });
      }
}

const updatePracticePlan = async (req, res) => {
    try {
        const myCollection = collection(firestore, 'PracticePlan');
        const docRef1 = doc(myCollection, req.params.userId);
  
        await updateDoc(docRef1, req.body);
        console.log("Document successfully updated!");
        res.send({ message: 'Practice plan updated successfully' });
    } catch (error) {
        console.error("Error updating PracticePlan document: ", error);
        res.status(500).json({ success: false, message: 'something went wrong when update practice plan' });
    }
}

module.exports = { buildPracticePlan, uploadPracticePlan, getPracticePlan, updatePracticePlan,};