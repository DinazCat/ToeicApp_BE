const {updatePost, addComment, getOneComment} = require('../controllers/Post');
const { collection, getDocs,getFirestore,doc,getDoc, setDoc, updateDoc, addDoc} = require('firebase/firestore');
const app = require('../index')
const request = require('supertest');
const {admin}=require('../config');
const { firestore, } = require('firebase-admin');
// const { FieldValue } = require("@google-cloud/firestore");
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
  addDoc:jest.fn(),
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
        }),
      firestore:jest.fn().mockReturnValue({
        collection:jest.fn().mockReturnValue({
            doc:jest.fn().mockReturnValue({
                update:jest.fn()
            })
        })
      }),

    }
    
  }));
  jest.mock('firebase-admin/firestore',()=>({
    getFirestore:jest.fn(),
  }))
  jest.mock('firebase/storage',()=>({
    getStorage:jest.fn(),
  }))
  
//
describe('updatePost', () => {
    test('should update data successfully and return response', async () => {
      // Arrange
      const mockPostId = 'mockPostId';
      const mockRequest = { params: { postId: mockPostId }, body: { test: 'data' } };
      const mockResponse = { send: jest.fn() };
      const mockDocRef = { id: 'mockDocId' };
      const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocRef) };
  
  
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      updateDoc.mockResolvedValueOnce(mockDocRef);
  
      // Act
      await updatePost(mockRequest, mockResponse);
  
      expect(collection).toHaveBeenCalledWith(getFirestore(), 'Posts');
      expect(doc).toHaveBeenCalledWith(expect.anything(), mockPostId);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef1, mockRequest.body);
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Document successfully updated!' });
    });
  
    it('should handle error when update document', async () => {
      // Arrange
      const mockPostId = 'mockPostId';
      const mockRequest = { params: { postId: mockPostId }, body: { test: 'data' } };
      const mockResponse = { send: jest.fn() };
      const mockDocRef1 = { doc: jest.fn() };
  
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      updateDoc.mockRejectedValueOnce(new Error('Test error'));
  
      // Act
      await updatePost(mockRequest, mockResponse);
      expect(console.error).toHaveBeenCalledWith("Error updating document: ", expect.any(Error));
  
    });
    afterEach(() => {
      collection.mockClear();
      doc.mockClear(); // or mockFunction.mockRestore();
      updateDoc.mockClear()
      console.error.mockClear();
    });
  });

  describe('getOneComment', () => {
    it('should return comment data when document exists', async () => {
      const commentId = 'id1'; // Set up a user ID for testing
  
      // Mock Firestore data
      const comments = {
        time:'12 AM',
        text:'Haha',
      };
      const mockDocSnapshot = {
        exists: jest.fn(() => true),
        data: jest.fn(() => (comments)),
      };
      const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      getDoc.mockResolvedValueOnce(mockDocSnapshot);
  
      const response = await request(app).get('/api/getoneComment/'+commentId);
      expect(response.status).toEqual(200);
      expect(response.body.success).toEqual(true);
      expect(response.body.comment).toEqual(comments);
    });
  
    it('should return -1 when document does not exist', async () => {
      const commentId = 'id2'; // Set up a user ID for testing
  
      // Mock Firestore data
      const mockDocSnapshot = { exists: jest.fn(() => false) };
      getDoc.mockResolvedValueOnce(mockDocSnapshot);
  
      const response = await request(app).get('/api/getoneComment/'+commentId);
      expect(response.status).toEqual(200);
      expect(response.body.success).toEqual(true);
      expect(response.body.comment).toEqual('-1');
    });
  
    it('should return an error message on failure', async () => {
        const commentId = 'id3'; // Set up a user ID for testing
  
      // Mock Firestore error
      getDoc.mockRejectedValueOnce(new Error('Firestore error'));
  
      const response = await request(app).get('/api/getoneComment/'+commentId);
      expect(response.status).toEqual(200);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('something went wrong when get data from comment');
    });
    afterEach(() => {
      collection.mockClear();
      doc.mockClear(); // or mockFunction.mockRestore();
      getDoc.mockClear()
    });
  });
  //
  describe('addComment', () => {
    it('should save data successfully', async () => {
      const mockcommentId = 'mockId';
      const mockRequest = { params: { userId: mockcommentId }, body: {time:'12 AM', text:'Haha',} };
      const mockResponse = { send: jest.fn() };
      const mockDocRef = { id: 'mockDocId' };
      const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocRef) };
  
  
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      updateDoc.mockResolvedValueOnce(mockDocRef);
      addDoc.mockResolvedValueOnce(mockDocRef);
  
      // Act
      await addComment(mockRequest, mockResponse);
  
      expect(collection).toHaveBeenCalledWith(getFirestore(), 'Comments');
      expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Data saved successfully' });
    });
  
    it('should handle errors and console error response', async () => {
        const mockcommentId = 'mockId';
        const mockRequest = { params: { userId: mockcommentId }, body: {time:'12 AM', text:'Haha',} };
        const mockResponse = { send: jest.fn() };
  
      // Mock Firestore addDoc function
      collection.mockReturnValueOnce('mockCollection');
      addDoc.mockRejectedValue(new Error('Mock error'));
  
      // Make the API call
      await addComment(mockRequest, mockResponse);
  
      // Assert the response
      expect(console.error).toHaveBeenCalledWith("Error adding document: ", expect.any(Error));
  
    });
  
    afterEach(() => {
      collection.mockClear();
      addDoc.mockClear()
      console.error.mockClear();
  
    });
  });