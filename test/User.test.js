const {setUserInfo, updateUser,createNotiBody,sendNotification} = require ('../controllers/User')
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc,getDoc} = require('firebase/firestore');

const app = require('../index')
const request = require('supertest');
const {admin}=require('../config')
const {error} = console
console.error = jest.fn();
console.log = jest.fn();
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getFirestore:jest.fn(),
  doc: jest.fn(),
  getDoc:jest.fn(),
  setDoc:jest.fn(),
  updateDoc:jest.fn(),
}));
jest.mock('../config.js', () => ({
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
  admin:{
    storage:jest.fn(),
    messaging:jest.fn().mockReturnValue({
        sendToDevice: jest.fn(),
      })
  }
  
}));
jest.mock('firebase-admin/firestore',()=>({
  getFirestore:jest.fn(),
}))
jest.mock('firebase/storage',()=>({
  getStorage:jest.fn(),
}))
describe('getAllUsers', () => {
    test('should return the list of users if Firestore query is successful', async () => {
      const mockQuerySnapshot = {
        docs: [
          { data: jest.fn(() => ({ user: 'user1' })) },
          { data: jest.fn(() => ({ user: 'user2' })) },
        ],
      };
  
      collection.mockReturnValueOnce('mockCollection');
      getDocs.mockResolvedValueOnce(mockQuerySnapshot);
  
      const response = await request(app).get('/api/Users');
  
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.users).toEqual([
        { user: 'user1'},
        { user: 'user2'},
      ]);
    });
  
    test('should return an alert error if an error occurs', async () => {
      collection.mockReturnValueOnce('mockCollection');
      getDocs.mockRejectedValueOnce(new Error('mockError'));
  
      const response = await request(app).get('/api/Users');
  
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('something went wrong when get data from Users');
    });
    afterEach(() => {
      collection.mockClear();
      getDocs.mockClear(); // or mockFunction.mockRestore();
    });
});

describe('getUserData', () => {
    it('should return user data when document exists', async () => {
      const userId = 'user1'; // Set up a user ID for testing
      const userData = {
        name: 'abc',
        email: 'abc@gmail.com',
        practicehistory: ['1', '2']
      }
      // Mock Firestore data
      const mockDocSnapshot = {
        exists: jest.fn(() => true),
        data: jest.fn(() => (userData)),
      };
      const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      getDoc.mockResolvedValueOnce(mockDocSnapshot);
  
      const response = await request(app).get('/api/UserData/'+userId);
      expect(response.status).toEqual(200);
      expect(response.body.success).toEqual(true);
      expect(response.body.userData).toEqual(userData);
    });
  
    it('should return alert when document does not exist', async () => {
      const userId = 'user2'; // Set up a user ID for testing
  
      // Mock Firestore data
      const mockDocSnapshot = { exists: jest.fn(() => false) };
      getDoc.mockResolvedValueOnce(mockDocSnapshot);
  
      const response = await request(app).get('/api/UserData/'+userId);
      expect(response.status).toEqual(404);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('User not found');
    });
  
    it('should return an error message on failure', async () => {
      const userId = 'user3'; // Set up a user ID for testing
  
      // Mock Firestore error
      getDoc.mockRejectedValueOnce(new Error('Firestore error'));
  
      const response = await request(app).get('/api/UserData/'+userId);
      expect(response.status).toEqual(500);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('something went wrong when get data from users');
    });
    afterEach(() => {
      collection.mockClear();
      doc.mockClear(); // or mockFunction.mockRestore();
      getDoc.mockClear()
    });
  });

describe('setUserInfo', () => {
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
      await setUserInfo(mockRequest, mockResponse);
  
      expect(collection).toHaveBeenCalledWith(getFirestore(), 'Users');
      expect(doc).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(setDoc).toHaveBeenCalledWith(mockDocRef1, mockRequest.body);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'User data set successfully' });
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
      setDoc.mockRejectedValueOnce(new Error('Test error'));
  
      // Act
      await setUserInfo(mockRequest, mockResponse);
      expect(console.error).toHaveBeenCalledWith("Error setting user document: ", expect.any(Error));
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'something went wrong when set user data'});
    });
    afterEach(() => {
      collection.mockClear();
      doc.mockClear(); // or mockFunction.mockRestore();
      setDoc.mockClear()
      console.error.mockClear();
    });
  });

describe('updateUser', () => {
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
      await updateUser(mockRequest, mockResponse);
  
      expect(collection).toHaveBeenCalledWith(getFirestore(), 'Users');
      expect(doc).toHaveBeenCalledWith(expect.anything(), mockUserId);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef1, mockRequest.body);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Document successfully updated!' });
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
      await updateUser(mockRequest, mockResponse);
      expect(console.error).toHaveBeenCalledWith("Error updating user document: ", expect.any(Error));
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'something went wrong when update user data'});
    });
    afterEach(() => {
      collection.mockClear();
      doc.mockClear(); // or mockFunction.mockRestore();
      updateDoc.mockClear()
      console.error.mockClear();
    });
  });

  describe('createNotiBody', () => {
    it('should return the notification body when the document exists', async () => {
      const mockDocSnapshot = {
        exists: jest.fn(() => true),
        data: jest.fn(() => ({
          Vocab: 'test-vocab',
          Spelling: 'test-spelling',
          Type: 'test-type',
          Translate: 'test-translate'
        })),
      };
      const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      getDoc.mockResolvedValueOnce(mockDocSnapshot);

      const result = await createNotiBody('mockid');
      expect(result).toBe('test-vocab test-spelling (test-type) test-translate');
    });
  
    it('should log an error message when the document does not exist', async () => {
      const mockDocSnapshot = {
        exists: jest.fn(() => false),
        data: jest.fn(() => ({
          Vocab: 'test-vocab',
          Spelling: 'test-spelling',
          Type: 'test-type',
          Translate: 'test-translate'
        })),
      };
      const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      getDoc.mockResolvedValueOnce(mockDocSnapshot);
      const result =await createNotiBody('non-existent-doc-id');

      expect(console.log).toHaveBeenCalledWith('Document does not exist.');
      expect(result).toBe('');
    });
    afterEach(() => {
      collection.mockRestore();
      doc.mockRestore(); 
      getDoc.mockRestore();
      console.log.mockRestore();
    });
  });
  describe('sendNotification function', () => {

    test('should send notification successfully', async () => {
        const mockDocSnapshot = {
            exists: jest.fn(() => true),
            data: jest.fn(() => ({
              Vocab: 'test-vocab',
              Spelling: 'test-spelling',
              Type: 'test-type',
              Translate: 'test-translate'
            })),
          };
          const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
          collection.mockReturnValueOnce('mockCollection');
          doc.mockReturnValueOnce(mockDocRef1);
          getDoc.mockResolvedValueOnce(mockDocSnapshot);
     admin.messaging().sendToDevice.mockResolvedValue({ results: [] });
      const token = 'test-token';
      const message = '6CHD8VJEoz';
      await sendNotification(token, message);
      expect(admin.messaging().sendToDevice).toHaveBeenCalledWith(token, {
        notification: {
          title: 'Alarm Vocab',
          body: 'test-vocab test-spelling (test-type) test-translate',
        },
      });
      expect(console.log).toHaveBeenCalledWith('Notification sent successfully:', []);
    });
    afterEach(() => {
      console.error.mockClear();
      console.log.mockClear();
      admin.messaging().sendToDevice.mockClear()
    });
  });