const {uploadAudio, uploadPracticeHistory,} = require ('../controllers/SWskills')
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, setDoc, getDoc} = require('firebase/firestore');
const { getStorage, ref, uploadString, getDownloadURL } = require('firebase/storage');

const app = require('../index')
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
  addDoc:jest.fn(),
}));

describe('uploadPracticeHistory', () => {
    test('should save data successfully and return response', async () => {
        // Mocking console.error
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
        // Mocking req and res objects
        const mockReq = { body: { test: 'data' } };
        const mockRes = {
          send: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
    
        // Testing the function
        await uploadPracticeHistory(mockReq, mockRes);
    
        // Expectations

        expect(collection).toHaveBeenCalledWith(getFirestore(), 'PracticeHistory');
        expect(console.error).not.toHaveBeenCalled(); 
        expect(mockRes.send).toHaveBeenCalledWith({ message: 'Practice History post successfully' });
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled(); 
    
        // Clean up mock functions
        mockConsoleError.mockRestore();
      });
    
    it('should handle error when adding document', async () => {
      // Arrange
      const mockRequest = { body: { test: 'data' } };
      const mockResponse = { 
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
     };
      const mockDocRef1 = { doc: jest.fn() };
  
      collection.mockReturnValueOnce('mockCollection');
      doc.mockReturnValueOnce(mockDocRef1);
      addDoc.mockRejectedValueOnce(new Error('Test error'));
  
      // Act
      await uploadPracticeHistory(mockRequest, mockResponse);
      expect(console.error).toHaveBeenCalledWith("Error post history document: ", expect.any(Error));
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'something went wrong when upload practice history'});
    });
    afterEach(() => {
      collection.mockClear();
      doc.mockClear(); // or mockFunction.mockRestore();
      addDoc.mockClear()
      console.error.mockClear();
    });
  });

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadString: jest.fn(),
  getDownloadURL: jest.fn()
}));

describe('uploadAudio', () => {
  test('should upload audio successfully and return download URL', async () => {
    // Mock req and res objects
    const mockReq = {
      body: {
        userId: 'mockUserId',
        audioData: 'mockAudioData'
      }
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    // Mock Firebase storage references
    const mockAudioRef = {};
    const mockDownloadURL = 'mockDownloadURL';

    ref.mockReturnValueOnce(mockAudioRef);
    uploadString.mockResolvedValueOnce();
    getDownloadURL.mockResolvedValueOnce(mockDownloadURL);

    // Call the function
    await uploadAudio(mockReq, mockRes);

    // Assertions
    expect(ref).toHaveBeenCalledWith(getStorage(), expect.any(String));
    expect(uploadString).toHaveBeenCalledWith(mockAudioRef, mockReq.body.audioData, 'base64', { contentType: 'audio/mpeg' });
    expect(getDownloadURL).toHaveBeenCalledWith(mockAudioRef);

    expect(mockRes.json).toHaveBeenCalledWith({ success: true, downloadUrl: mockDownloadURL });
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
  });

  test('should handle error when uploading audio', async () => {
    // Mock req and res objects
    const mockReq = {
      body: {
        userId: 'mockUserId',
        audioData: 'mockAudioData'
      }
    };
    const mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    // Mock Firebase storage references
    const mockAudioRef = {};

    ref.mockReturnValueOnce(mockAudioRef);
    uploadString.mockRejectedValueOnce(new Error('Test error'));

    // Call the function
    await uploadAudio(mockReq, mockRes);

    // Assertions
    expect(ref).toHaveBeenCalledWith(getStorage(), expect.any(String));
    expect(uploadString).toHaveBeenCalledWith(mockAudioRef, mockReq.body.audioData, 'base64', { contentType: 'audio/mpeg' });

    expect(mockRes.json).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({ success: false, message: 'Upload audio failed' });
  });
});