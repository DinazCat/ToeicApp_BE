const {uploadPracticePlan, updatePracticePlan} = require('../controllers/PracticePlan')
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc, getDoc} = require('firebase/firestore');
const {buildPracticePlan} = require('../controllers/PracticePlan');
const app = require('../index')
const request = require('supertest');
const {error} = console
console.error = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getFirestore:jest.fn(),
  doc: jest.fn(),
  getDoc:jest.fn(),
  setDoc:jest.fn(),
  updateDoc:jest.fn(),
}));

const targetPerPart1 = [5, 18, null, 22, 20, null, 16, 12, null, 28, null ]; //L(59), R(62)
const targetPerPart2 = [6, 22, null, 26, 28, null, 22, 14, null, 40, null]; //L(76), R(80)
const targetPerPart3 = [6, 24, null, 29, 33, null, 25, 15, null, 48, null]; //L(88), R(92)
const phasesTime1 = ['1', '2 - 4', '5' ,'6 - 8', '9 - 13', '14', '15 - 18', '19 - 21', '22', '23 - 29', '30'];
const phasesTime2 = ['1 - 2', '3 - 7', '8', '9 - 14', '15 - 23', '24', '25 - 32', '33 - 40', '41', '42 - 59', '60'];
const phasesTime3 = ['1 - 3', '4 - 14', '15', '16 - 26', '27 - 43', '44', '45 - 57', '58 - 65', '66', '67 - 89', '90'];
const phasesTime4 = ['1 - 4', '5 - 19', '20', '21 - 34', '35 - 55', '56', '57 - 73', '74 - 87', '88', '89 - 119', '120'];
const practiceContent = ['Photograph Describes', 'Question & Response', 'Test 1', 'Incomplete Sentences', 'Short Conversations', 'Test 2', 'Short Talks', 'Text Completion', 'Test 3','Reading Comprehension', 'Test 4']

describe('uploadPracticePlan', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
      });
    test('should upload practice plan successfully', async () => {

      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
  
      const mockReq = {
        body: {
          currentLevel: 'mockCurrentLevel',
          targetLevel: 'mockTargetLevel',
          practiceDays: 'mockPracticeDays'
        },
        params: {
          userId: 'mockUserId'
        }
      };
      const mockRes = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      //buildPracticePlan.mockReturnValueOnce('mockPracticePlan');
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce('mockSpecificDocRef');
      setDoc.mockResolvedValueOnce('mockPracticePlan');
      // Testing the function
      await uploadPracticePlan(mockReq, mockRes);
  
      // Expectations
    //   expect(mockBuildPracticePlan).toHaveBeenCalledWith(
    //     'mockCurrentLevel',
    //     'mockTargetLevel',
    //     'mockPracticeDays',
    //     'mockUserId'
    //   );

      expect(collection).toHaveBeenCalledWith(getFirestore(), 'PracticePlan');
      expect(doc).toHaveBeenCalledWith('mockCollection', 'mockUserId');
      //expect(setDoc).toHaveBeenCalledWith('mockSpecificDocRef', null);
      expect(mockConsoleLog).toHaveBeenCalledWith('Document successfully post!');
      expect(mockRes.send).toHaveBeenCalledWith({ success: true, message: 'Practice Plan post successfully' });
      expect(mockRes.status).not.toHaveBeenCalled(); // Ensure res.status is not called on success
      expect(mockRes.json).not.toHaveBeenCalled(); // Ensure res.json is not called on success
  
      // Clean up mock functions
      mockConsoleLog.mockRestore();
    });
  
    test('should handle error when uploading practice plan', async () => {    
  
      // Mocking console.error
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  
      // Mocking req and res objects
      const mockReq = {
        body: {
          currentLevel: 'mockCurrentLevel',
          targetLevel: 'mockTargetLevel',
          practiceDays: 'mockPracticeDays'
        },
        params: {
          userId: 'mockUserId'
        }
      };
      const mockRes = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      // // Mocking buildPracticePlan function
      // const mockBuildPracticePlan = jest.fn().mockReturnValue('mockPracticePlan');
      // jest.mock('../controllers/PracticePlan', () => ({
      //   buildPracticePlan: mockBuildPracticePlan
      // }));
  
      setDoc.mockRejectedValueOnce(new Error('Test error'));
      //buildPracticePlan.mockReturnValueOnce('mockPracticePlan');
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce('mockSpecificDocRef');

      // Testing the function
      await uploadPracticePlan(mockReq, mockRes);
  
      // Expectations
    //   expect(buildPracticePlan).toHaveBeenCalledWith(
    //     'mockCurrentLevel',
    //     'mockTargetLevel',
    //     'mockPracticeDays',
    //     'mockUserId'
    //   );

      expect(console.error).toHaveBeenCalledWith('Error post plan document: ', expect.any(Error));
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Test error' });
  
      // Clean up mock functions
      mockConsoleError.mockRestore();
    });
});

describe('buildPracticePlan', () => {

  it('should build practice plan for 30 days and target level 3', async() => {
    const currentLevel = 2;
    const targetLevel = 3;
    const practiceDays = 30;
    const phases = phasesTime1;
    const targetperpart = targetPerPart1;
    const userId = 'mockUserId';
  
    const result = await buildPracticePlan(currentLevel, targetLevel, practiceDays, userId);
  
    result.PracticePhases.forEach((phase, index) => {
      const [start, end] = phasesTime1[index].split('-').map(num => parseInt(num.trim()));
  
      if (end === undefined) {
        if (start === 1) {
          expect(phase.Days[0]).toEqual({
            Day: 1,
            NumberofQuestions: result.QuestionsPerDay,
            CompletedQuestion: 0,
          });
          expect(phase.Days[0].Day).toBe(1);
          expect(result.PracticePhases[index]).toEqual({
            Phases: phases[index],
            Target: targetperpart[index],
            Content: practiceContent[index],
            Days: phase.Days,                 
          });
        } else {
            expect(result.PracticePhases[index]).toEqual({
                Phases: phases[index],
                Target: targetperpart[index],
                Content: practiceContent[index],
                Test: 'testId'                  
              });
        }
      } else {
        expect(result.PracticePhases[index]).toEqual({
            Phases: phases[index],
            Target: targetperpart[index],
            Content: practiceContent[index],
            Days: phase.Days,                   
          });
      }
    });
    expect(result.userId).toBe(userId);
    expect(result.CurrentLevel).toBe(currentLevel);
    expect(result.TargetLevel).toBe(targetLevel);
    expect(result.PracticeDays).toBe(practiceDays);

    // Check PracticePhases
    expect(result.PracticePhases).toHaveLength(phasesTime2.length);
    expect(result.QuestionsPerDay).toBe(90);
    expect(result.CurrentPhase.PhaseIndex).toBe(0);
    expect(result.CurrentPhase.CurrentDay).toBe(1);
  });


  it('should build practice plan for 60 days and target level 4', async() => {
    const currentLevel = 2;
    const targetLevel = 4;
    const practiceDays = 60;
    const phases = phasesTime2;
    const targetperpart = targetPerPart2;
    const userId = 'mockUserId';
  
    const result = await buildPracticePlan(currentLevel, targetLevel, practiceDays, userId);
  
    result.PracticePhases.forEach((phase, index) => {
      const [start, end] = phasesTime1[index].split('-').map(num => parseInt(num.trim()));
  
      if (end === undefined) {
        if (start === 1) {
          expect(phase.Days[0]).toEqual({
            Day: 1,
            NumberofQuestions: result.QuestionsPerDay,
            CompletedQuestion: 0,
          });
          expect(result.PracticePhases[index]).toEqual({
            Phases: phases[index],
            Target: targetperpart[index],
            Content: practiceContent[index],
            Days: phase.Days,                 
          });
        } else {
            expect(result.PracticePhases[index]).toEqual({
                Phases: phases[index],
                Target: targetperpart[index],
                Content: practiceContent[index],
                Test: 'testId'                  
              });
        }
      } else {
        expect(result.PracticePhases[index]).toEqual({
            Phases: phases[index],
            Target: targetperpart[index],
            Content: practiceContent[index],
            Days: phase.Days,                   
          });
      }
    });
    expect(result.userId).toBe(userId);
    expect(result.CurrentLevel).toBe(currentLevel);
    expect(result.TargetLevel).toBe(targetLevel);
    expect(result.PracticeDays).toBe(practiceDays);

    // Check PracticePhases
    expect(result.PracticePhases).toHaveLength(phasesTime2.length);
    expect(result.QuestionsPerDay).toBe(60);
    expect(result.CurrentPhase.PhaseIndex).toBe(0);
    expect(result.CurrentPhase.CurrentDay).toBe(1);
  });

  it('should build practice plan for 90 days and target level 5', async() => {
    const currentLevel = 3;
    const targetLevel = 5;
    const practiceDays = 90;
    const phases = phasesTime3;
    const targetperpart = targetPerPart3;
    const userId = 'mockUserId';
  
    const result = await buildPracticePlan(currentLevel, targetLevel, practiceDays, userId);
  
    result.PracticePhases.forEach((phase, index) => {
      const [start, end] = phasesTime1[index].split('-').map(num => parseInt(num.trim()));
  
      if (end === undefined) {
        if (start === 1) {
          expect(phase.Days[0]).toEqual({
            Day: 1,
            NumberofQuestions: result.QuestionsPerDay,
            CompletedQuestion: 0,
          });
          expect(result.PracticePhases[index]).toEqual({
            Phases: phases[index],
            Target: targetperpart[index],
            Content: practiceContent[index],
            Days: phase.Days,                 
          });
        } else {
            expect(result.PracticePhases[index]).toEqual({
                Phases: phases[index],
                Target: targetperpart[index],
                Content: practiceContent[index],
                Test: 'testId'                  
              });
        }
      } else {
        expect(result.PracticePhases[index]).toEqual({
            Phases: phases[index],
            Target: targetperpart[index],
            Content: practiceContent[index],
            Days: phase.Days,                   
          });
      }
    });
    expect(result.userId).toBe(userId);
    expect(result.CurrentLevel).toBe(currentLevel);
    expect(result.TargetLevel).toBe(targetLevel);
    expect(result.PracticeDays).toBe(practiceDays);

    // Check PracticePhases
    expect(result.PracticePhases).toHaveLength(phasesTime2.length);
    expect(result.QuestionsPerDay).toBe(40);
    expect(result.CurrentPhase.PhaseIndex).toBe(0);
    expect(result.CurrentPhase.CurrentDay).toBe(1);
  });

  it('should build practice plan for 120 days and target level 5', async() => {
    const currentLevel = 2;
    const targetLevel = 5;
    const practiceDays = 120;
    const phases = phasesTime4;
    const targetperpart = targetPerPart3;
    const userId = 'mockUserId';
  
    const result = await buildPracticePlan(currentLevel, targetLevel, practiceDays, userId);
  
    result.PracticePhases.forEach((phase, index) => {
      const [start, end] = phasesTime1[index].split('-').map(num => parseInt(num.trim()));
  
      if (end === undefined) {
        if (start === 1) {
          expect(phase.Days[0]).toEqual({
            Day: 1,
            NumberofQuestions: result.QuestionsPerDay,
            CompletedQuestion: 0,
          });
          expect(result.PracticePhases[index]).toEqual({
            Phases: phases[index],
            Target: targetperpart[index],
            Content: practiceContent[index],
            Days: phase.Days,                 
          });
        } else {
            expect(result.PracticePhases[index]).toEqual({
                Phases: phases[index],
                Target: targetperpart[index],
                Content: practiceContent[index],
                Test: 'testId'                  
              });
        }
      } else {
        expect(result.PracticePhases[index]).toEqual({
            Phases: phases[index],
            Target: targetperpart[index],
            Content: practiceContent[index],
            Days: phase.Days,                   
          });
      }
    });
    expect(result.userId).toBe(userId);
    expect(result.CurrentLevel).toBe(currentLevel);
    expect(result.TargetLevel).toBe(targetLevel);
    expect(result.PracticeDays).toBe(practiceDays);

    // Check PracticePhases
    expect(result.PracticePhases).toHaveLength(phasesTime2.length);
    expect(result.QuestionsPerDay).toBe(39);
    expect(result.CurrentPhase.PhaseIndex).toBe(0);
    expect(result.CurrentPhase.CurrentDay).toBe(1);
  });

  it('should handle unknown practiceDays', async() => {
    // Arrange
    const currentLevel = 2;
    const targetLevel = 5; 
    const practiceDays = -1;
    const userId = 'mockUserId';
  
    // Act
    const result = await buildPracticePlan(currentLevel, targetLevel, practiceDays, userId);
  
    // Assert
    expect(result).toEqual(null);
  });

  it('should handle unknown targetLevel', async() => {
    // Arrange
    const currentLevel = 2;
    const targetLevel = 6; 
    const practiceDays = 90;
    const userId = 'mockUserId';
  
    // Act
    const result = await buildPracticePlan(currentLevel, targetLevel, practiceDays, userId);
  
    // Assert
    expect(result).toEqual(null);
  });

  afterEach(() => {
    collection.mockClear();
    doc.mockClear(); // or mockFunction.mockRestore();
    updateDoc.mockClear()
    console.error.mockClear();
  });
});


describe('getPracticePlan', () => {
    it('should return practice plan when document exists', async () => {
      const userId = 'user1'; // Set up a user ID for testing
      const plan = 'plan'

      // Mock Firestore data     
      const mockDocSnapshot = {
        exists: jest.fn(() => true),
        data: jest.fn(() => (plan)),
      };
      const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      getDoc.mockResolvedValueOnce(mockDocSnapshot);
  
      const response = await request(app).get('/api/PracticePlan/'+userId);
      expect(response.status).toEqual(200);
      expect(response.body.success).toEqual(true);
      expect(response.body.PracticePlan).toEqual(plan);
    });
  
    it('should return alert when document does not exist', async () => {
      const userId = 'user2'; // Set up a user ID for testing
  
      // Mock Firestore data
      const mockDocSnapshot = { exists: jest.fn(() => false) };
      getDoc.mockResolvedValueOnce(mockDocSnapshot);
  
      const response = await request(app).get('/api/PracticePlan/'+userId);
      expect(response.status).toEqual(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('Practice plan not found');
    });
  
    it('should return an error message on failure', async () => {
      const userId = 'user3'; // Set up a user ID for testing
  
      // Mock Firestore error
      getDoc.mockRejectedValueOnce(new Error('Firestore error'));
  
      const response = await request(app).get('/api/PracticePlan/'+userId);
      expect(response.status).toEqual(500);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('something went wrong when get data from practice plan');
    });
    afterEach(() => {
      collection.mockClear();
      doc.mockClear(); // or mockFunction.mockRestore();
      getDoc.mockClear()
    });
  });

describe('updatePracticePlan', () => {
    test('should update data successfully and return response', async () => {
      // Arrange
      const mockUserId = 'mockUserId';
      const mockRequest = { params: { userId: mockUserId }, body: { test: 'data' } };
      const mockResponse = { send: jest.fn() };
      const mockDocRef = { id: 'mockDocId' };
      const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocRef) };
  
  
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      updateDoc.mockResolvedValueOnce(mockDocRef);
  
      // Act
      await updatePracticePlan(mockRequest, mockResponse);
  
      expect(collection).toHaveBeenCalledWith(getFirestore(), 'PracticePlan');
      expect(doc).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef1, mockRequest.body);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Practice plan updated successfully' });
    });
  
    it('should handle error when adding document', async () => {
      // Arrange
      const mockUserId = 'mockUserId';
      const mockRequest = { params: { userId: mockUserId }, body: { test: 'data' } };
      const mockResponse = { 
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
     };
      const mockDocRef1 = { doc: jest.fn() };
  
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      updateDoc.mockRejectedValueOnce(new Error('Test error'));
  
      // Act
      await updatePracticePlan(mockRequest, mockResponse);
      expect(console.error).toHaveBeenCalledWith("Error updating PracticePlan document: ", expect.any(Error));
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'something went wrong when update practice plan'});
    });
    afterEach(() => {
      collection.mockClear();
      doc.mockClear(); // or mockFunction.mockRestore();
      updateDoc.mockClear()
      console.error.mockClear();
    });
});


