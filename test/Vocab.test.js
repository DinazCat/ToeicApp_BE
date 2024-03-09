const {setAlarmVocab,getAlarmVocab,updateAlarmVocab} = require('../controllers/Vocab');
const { collection, getDocs,getFirestore,doc,getDoc, setDoc, updateDoc} = require('firebase/firestore');
const app = require('../index')
const request = require('supertest');
const {error}=console
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
//
describe('getVocabs', () => {
  test('should return a list of vocabs if successful', async () => {
    const mockQuerySnapshot = {
      docs: [
        { id: '1', data: jest.fn(() => ({ vocab: 'word1' })) },
        { id: '2', data: jest.fn(() => ({ vocab: 'word2' })) },
      ],
    };

    collection.mockReturnValueOnce('mockCollection');
    getDocs.mockResolvedValueOnce(mockQuerySnapshot);

    const response = await request(app).get('/api/Vocabs');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.vocabs).toEqual([
      { vocab: 'word1', Id: '1' },
      { vocab: 'word2', Id: '2' },
    ]);
  });

  test('should return an alert error if an error occurs', async () => {
    collection.mockReturnValueOnce('mockCollection');
    getDocs.mockRejectedValueOnce(new Error('mockError'));

    const response = await request(app).get('/api/Vocabs');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('something went wrong when get data from getVocabs');
  });
  // Clean up the mock after the test using mockClear() or mockRestore()
afterEach(() => {
  collection.mockClear();
  getDocs.mockClear(); // or mockFunction.mockRestore();
});
});

//
describe('getVocabLesson', () => {
  test('should return the list of vocab lessons if Firestore query is successful', async () => {
    const mockQuerySnapshot = {
      docs: [
        { id: '1', data: jest.fn(() => ({ vocablession: 'lesson1' })) },
        { id: '2', data: jest.fn(() => ({ vocablession: 'lesson2' })) },
      ],
    };

    collection.mockReturnValueOnce('mockCollection');
    getDocs.mockResolvedValueOnce(mockQuerySnapshot);

    const response = await request(app).get('/api/VocabLessons');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.vocablesson).toEqual([
      { vocablession: 'lesson1', Id: '1' },
      { vocablession: 'lesson2', Id: '2' },
    ]);
  });

  test('should return an alert error if an error occurs', async () => {
    collection.mockReturnValueOnce('mockCollection');
    getDocs.mockRejectedValueOnce(new Error('mockError'));

    const response = await request(app).get('/api/VocabLessons');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('something went wrong when get data from vocablesson');
  });
  afterEach(() => {
    collection.mockClear();
    getDocs.mockClear(); // or mockFunction.mockRestore();
  });
});
//
describe('getVocabinLesson', () => {
  test('should return the list of vocabs in a Lesson if Firestore query is successful', async () => {
    const mockQuerySnapshot = {
      docs: [
        { id: '1', data: jest.fn(() => ({ vocab: 'word1', TopicId:'aaa' })) },
        { id: '2', data: jest.fn(() => ({ vocab: 'word2', TopicId:'aaa' })) },
      ],
    };

    collection.mockReturnValueOnce('mockCollection');
    getDocs.mockResolvedValueOnce(mockQuerySnapshot);

    const response = await request(app).get('/api/VocabinLesson/aaa');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.vocabs).toEqual([
      { vocab: 'word1', TopicId:'aaa', Id: '1' },
      { vocab: 'word2', TopicId:'aaa', Id: '2' },
    ]);
  });

  test('should return an alert error if an error occurs', async () => {
    collection.mockReturnValueOnce('mockCollection');
    getDocs.mockRejectedValueOnce(new Error('mockError'));

    const response = await request(app).get('/api/VocabinLesson/aaa');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('something went wrong when get data from getVocabinLesson');
  });
  afterEach(() => {
    collection.mockClear();
    getDocs.mockClear(); // or mockFunction.mockRestore();
  });
});
//

describe('setAlarmVocab', () => {
  test('should save data successfully and return response', async () => {
    // Arrange
    const mockUserId = 'mockUserId';
    const mockRequest = { params: { userId: mockUserId }, body: { test: 'data' } };
    const mockResponse = { send: jest.fn() };
    const mockDocRef = { id: 'mockDocId' };
    const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocRef) };


    collection.mockReturnValueOnce('mockCollection');
    doc.mockReturnValueOnce(mockDocRef1);
    setDoc.mockResolvedValueOnce(mockDocRef);

    // Act
    await setAlarmVocab(mockRequest, mockResponse);

    expect(collection).toHaveBeenCalledWith(getFirestore(), 'Users');
    expect(doc).toHaveBeenCalledWith(expect.anything(), mockUserId);
    expect(setDoc).toHaveBeenCalledWith(mockDocRef1, mockRequest.body);
    expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Data saved successfully' });
  });

  it('should handle error when adding document', async () => {
    // Arrange
    const mockUserId = 'mockUserId';
    const mockRequest = { params: { userId: mockUserId }, body: { test: 'data' } };
    const mockResponse = { send: jest.fn() };
    const mockDocRef1 = { doc: jest.fn() };

    collection.mockReturnValueOnce('mockCollection');
    doc.mockReturnValueOnce(mockDocRef1);
    setDoc.mockRejectedValueOnce(new Error('Test error'));

    // Act
    await setAlarmVocab(mockRequest, mockResponse);
    expect(console.error).toHaveBeenCalledWith("Error adding document: ", expect.any(Error));

  });
  afterEach(() => {
    collection.mockClear();
    doc.mockClear(); // or mockFunction.mockRestore();
    setDoc.mockClear()
    console.error.mockClear();
  });
});
//
describe('updateAlarmVocab', () => {
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
    await updateAlarmVocab(mockRequest, mockResponse);

    expect(collection).toHaveBeenCalledWith(getFirestore(), 'Users');
    expect(doc).toHaveBeenCalledWith(expect.anything(), mockUserId);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef1, mockRequest.body);
    expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Document successfully updated!' });
  });

  it('should handle error when adding document', async () => {
    // Arrange
    const mockUserId = 'mockUserId';
    const mockRequest = { params: { userId: mockUserId }, body: { test: 'data' } };
    const mockResponse = { send: jest.fn() };
    const mockDocRef1 = { doc: jest.fn() };

    collection.mockReturnValueOnce('mockCollection');
    doc.mockReturnValueOnce(mockDocRef1);
    updateDoc.mockRejectedValueOnce(new Error('Test error'));

    // Act
    await updateAlarmVocab(mockRequest, mockResponse);
    expect(console.error).toHaveBeenCalledWith("Error updating document: ", expect.any(Error));

  });
  afterEach(() => {
    collection.mockClear();
    doc.mockClear(); // or mockFunction.mockRestore();
    updateDoc.mockClear()
    console.error.mockClear();
  });
});
//
describe('getAlarmVocab', () => {
  it('should return vocab alarms when document exists', async () => {
    const userId = 'user1'; // Set up a user ID for testing

    // Mock Firestore data
    const vocabAlarms = ['alarm1', 'alarm2'];
    const mockDocSnapshot = {
      exists: jest.fn(() => true),
      data: jest.fn(() => ({ vocabAlarms: vocabAlarms })),
    };
    const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
    collection.mockReturnValueOnce('mockCollection');
    doc.mockReturnValueOnce(mockDocRef1);
    getDoc.mockResolvedValueOnce(mockDocSnapshot);

    const response = await request(app).get('/api/getAlarmVocab/'+userId);
    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.vocabAlarm).toEqual(vocabAlarms);
  });

  it('should return -1 when document does not exist', async () => {
    const userId = 'user2'; // Set up a user ID for testing

    // Mock Firestore data
    const mockDocSnapshot = { exists: jest.fn(() => false) };
    getDoc.mockResolvedValueOnce(mockDocSnapshot);

    const response = await request(app).get('/api/getAlarmVocab/'+userId);
    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(true);
    expect(response.body.vocabAlarm).toEqual('-1');
  });

  it('should return an error message on failure', async () => {
    const userId = 'user3'; // Set up a user ID for testing

    // Mock Firestore error
    getDoc.mockRejectedValueOnce(new Error('Firestore error'));

    const response = await request(app).get('/api/getAlarmVocab/'+userId);
    expect(response.status).toEqual(200);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual('something went wrong when get data from vocabAlarm');
  });
  afterEach(() => {
    collection.mockClear();
    doc.mockClear(); // or mockFunction.mockRestore();
    getDoc.mockClear()
  });
});


  