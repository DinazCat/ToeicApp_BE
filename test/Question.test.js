const { collection, getDocs,getFirestore,doc,getDoc, setDoc, updateDoc,where, query,addDoc} = require('firebase/firestore');
const app = require('../index')
const request = require('supertest');
const {getOneQuestion,get1PHistory,getMaxquestion,getQuestion,pushPracticeHistory,pushHistoryUser1} = require('../controllers/Question')
// const admin = require('firebase-admin')

const {error}=console
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
  where:jest.fn(),
  query:jest.fn(),
  addDoc:jest.fn(),
}));
describe('pushHistoryUser1', () => {

  it('should update HistoryPractice and MaxQuestion when document exists', async () => {
    const mockUserId = 'mockUserId';
    const mockDocRef = { id: 'mockDocId' };


    const mockDocSnapshot = {
      exists: jest.fn(() => true),
      data: jest.fn(() => ({ HistoryPractice: ['id1','id2'],MaxQuestion:[]})),
    };
    const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
    collection.mockReturnValueOnce('mockCollection');
    doc.mockReturnValueOnce(mockDocRef1);
    getDoc.mockResolvedValueOnce(mockDocSnapshot);
    updateDoc.mockResolvedValueOnce(mockDocRef);

    // Gọi hàm pushHistoryUser1
    await pushHistoryUser1(mockUserId,'mockid','L1','3','Max');

    // Kiểm tra xem HistoryPractice và MaxQuestion đã được cập nhật đúng
    expect(collection).toHaveBeenCalledWith(getFirestore(), 'Users');
    expect(doc).toHaveBeenCalledWith(expect.anything(), mockUserId);
    expect(updateDoc).toHaveBeenCalledTimes(2)


  });

  it('should create new document when document does not exist', async () => {
    // Xóa document user test trước khi chạy test này để đảm bảo document không tồn tại
    const mockUserId = 'mockUserId';
    const mockDocRef = { id: 'mockDocId' };


    const mockDocSnapshot = {
      exists: jest.fn(() => false),
      data: jest.fn(() => ({ HistoryPractice: ['id1','id2'],MaxQuestion:[]})),
    };
    const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
    collection.mockReturnValueOnce('mockCollection');
    doc.mockReturnValueOnce(mockDocRef1);
    getDoc.mockResolvedValueOnce(mockDocSnapshot);
    setDoc.mockResolvedValueOnce(mockDocRef);
    await pushHistoryUser1(mockUserId,'mockid','L1','3','noMax');
    expect(setDoc).toHaveBeenCalledWith(mockDocRef1, {HistoryPractice: ['mockid']});
  });
  it('should return an error message on failure', async () => {
    const mockUserId = 'mockUserId';
    getDoc.mockRejectedValueOnce(new Error('Firestore error'));

    await pushHistoryUser1(mockUserId,'mockid','L1','3','noMax');
    expect(console.error).toHaveBeenCalledWith("Error pushHistoryUser1: ", expect.any(Error));
  });
  afterEach(() => {
    collection.mockClear();
    doc.mockClear();
    updateDoc.mockClear();
    getDoc.mockClear();
    setDoc.mockClear();
    console.error.mockClear();
    // getMaxquestion.mockClear();
  });
})
//
describe('pushPracticeHistory', () => {
  it('should save data successfully and call pushHistoryUser1', async () => {
    const mockUserId = 'mockUserId';
    const mockRequest = { params: { userId: mockUserId,sign:'noMax' }, body: { Part: 'L1',Quantity:'3' } };
    const mockResponse = { send: jest.fn() };
    const mockDocRef = { id: 'mockDocId' };


    collection.mockReturnValueOnce('mockCollection');
    addDoc.mockResolvedValueOnce(mockDocRef);

    // Act
    await pushPracticeHistory(mockRequest, mockResponse);

    expect(collection).toHaveBeenCalledWith(getFirestore(), 'PracticeHistory');
    expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Data saved successfully' });
  });

  it('should handle errors and console error response', async () => {
    const mockUserId = 'mockUserId';
    const mockRequest = { params: { userId: mockUserId,sign:'noMax' }, body: { Part: 'L1',Quantity:'3' } };
    const mockResponse = { send: jest.fn() };

    // Mock Firestore addDoc function
    collection.mockReturnValueOnce('mockCollection');
    addDoc.mockRejectedValue(new Error('Mock error'));

    // Make the API call
    await pushPracticeHistory(mockRequest, mockResponse);

    // Assert the response
    expect(console.error).toHaveBeenCalledWith("Error adding document pushHistory: ", expect.any(Error));

  });

  afterEach(() => {
    collection.mockClear();
    addDoc.mockClear()
    console.error.mockClear();

  });
});
//
describe('getQuestion', () => {


  it('should return success response with questions', async () => {

    const Question = require('../controllers/Question')
   Question.getMaxquestion =jest.fn().mockReturnValue(10)
    const mockMaxQuestion = 10; // Giả sử getMaxquestion trả về giá trị 10
    const mockUserId = 'mockUserId';
    const mockPart = 'mockPart';
    const mockNumber = 5;
    const mockResult = [{ Id: '1', question: 'Question 1',Order:11}, { Id: '2', question: 'Question 2',Order:12 }];
    const querySnapshot = {
      docs: [
        {
          id: '1',
          data: jest.fn().mockReturnValue({Id: '1', question: 'Question 1' ,Order:11}),
        },
        {
          id: '2',
          data: jest.fn().mockReturnValue({Id: '2', question: 'Question 2',Order:12 }),
        },
      ],
    };

    collection.mockReturnValueOnce('mockCollection');
    getDocs.mockResolvedValue(querySnapshot);

    const response = await request(app)
      .get(`/api/Question/${mockPart}/${mockUserId}/${mockNumber}`)
      .expect(200);

    // Kiểm tra kết quả trả về từ endpoint
    expect(response.body).toEqual({ success: true, Questions: mockResult });
    expect(response.status).toBe(200);

  });

  it('should return error response when something went wrong', async () => {

    collection.mockReturnValueOnce('mockCollection');
    getDocs.mockRejectedValueOnce(new Error('mockError'));
   
    const response = await request(app)
      .get('/api/Question/mockUserId/mockPart/5')
      .expect(200);

    // Kiểm tra kết quả trả về từ endpoint
    expect(response.body).toEqual({
      success: false,
      message: 'something went wrong when get data from getQuestion',
    });
    expect(response.status).toBe(200);

  });
  afterEach(() => {
    collection.mockClear();
    getDocs.mockClear();
    where.mockClear();
  });
});

describe('getMaxquestion', () => {
 
    getDoc.mockResolvedValue({
      exists: jest.fn(() => true),
      data: jest.fn(() => ({
        MaxQuestion: {
          L1: 10,
        },
      })),
    });
  

  it('returns the max question for Listen Part 1', async () => {
    const userId = 'mockUserId';
    const part = 'ListenPart1';

    const result = await getMaxquestion(userId, part);

    expect(result).toBe(10);
  });

  it('returns the max question for L1', async () => {
    const userId = 'mockUserId';
    const part = 'L1';

    const result = await getMaxquestion(userId, part);

    expect(result).toBe(10);
  });

  it('returns 0 if the document does not exist', async () => {
    const userId = 'mockUserId';
    const part = 'ListenPart1';

    getDoc.mockResolvedValue({
      exists: jest.fn(() => false),
    });

    const result = await getMaxquestion(userId, part);

    expect(result).toBe(0);
  });

  it('returns 0 if an error occurs', async () => {
    const userId = 'mockUserId';
    const part = 'ListenPart1';

    getDoc.mockRejectedValueOnce(new Error('Mock Error'));

    const result = await getMaxquestion(userId, part);

    expect(result).toBe(0);
  });
  afterEach(() => {
    getDoc.mockClear();
  });
});

//
describe('get1PHistory',()=>{
  test('should return an empty array if input list is empty', async () => {
    const result = await get1PHistory([]);
    expect(result).toEqual([]);
});
  test('should return a practice history data list',async ()=>{
    const list = [
      'id1','id2','id3'
    ]
      

    const mockDocSnapshot = {
      exists: jest.fn(() => true),
      data: jest.fn(() => {}),
      id:jest.fn(()=>('docId'))
    };
    const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
    collection.mockReturnValueOnce('mockCollection');
    doc.mockReturnValue(mockDocRef1);
    getDoc.mockResolvedValue(mockDocSnapshot);
    const result = await get1PHistory(list);

    expect(Array.isArray(result)).toBe(true);

    expect(result.length).toBe(list.length);

    result.forEach(data => {
      expect(data).toHaveProperty('Id');
    });
  });

  test('should handle error when getting document', async () => {
    const list = ['nonExistingDocumentId']; 
    getDoc.mockRejectedValueOnce(new Error('Firestore error'));
    const result = await get1PHistory(list);
    expect(console.error).toHaveBeenCalledWith("Error get document: ", expect.any(Error));
    expect(result).toEqual([]);
  });
  afterEach(() => {
    collection.mockClear();
    doc.mockClear(); // or mockFunction.mockRestore();
    getDoc.mockClear();
    console.error.mockClear();
  });
})
//
describe('getoneQuestion', () => {
    test('should return a questions if successful', async () => {
        const Qid= 'question1'; 
        const mockRequest = { params: { Part: 'ListenPart1', Qid:Qid } };
        const mockResponse = { json: jest.fn() };
        // Mock Firestore data
        const data = {
            order:'1',
            level:'1',
            image:'abc.jpg',
        };
        const mockDocSnapshot = {
          exists: jest.fn(() => true),
          data: jest.fn(() => ( data )),
        };
        const mockDocRef1 = { doc: jest.fn().mockReturnValue(mockDocSnapshot) };
        collection.mockReturnValueOnce('mockCollection');
        doc.mockReturnValueOnce(mockDocRef1);
        getDoc.mockResolvedValueOnce(mockDocSnapshot);
    
        await getOneQuestion(mockRequest,mockResponse)

        expect(mockResponse.json).toHaveBeenCalledWith({
            success:true, question:data
        });
    });
  
    test('should return {} when document does not exist', async () => {
        const Qid= 'question2'; 
        const mockRequest = { params: { Part: 'ListenPart1', Qid:Qid } };
        const mockResponse = { json: jest.fn() };
        // Mock Firestore data
        const mockDocSnapshot = { exists: jest.fn(() => false) };
        getDoc.mockResolvedValueOnce(mockDocSnapshot);
        await getOneQuestion(mockRequest,mockResponse)

        expect(mockResponse.json).toHaveBeenCalledWith({
            success:true, question:{}
        });
      });
      test('should return an error message on failure', async () => {
        const Qid= 'question3'; 
        const mockRequest = { params: { Part: 'ListenPart1', Qid:Qid } };
        const mockResponse = { json: jest.fn() };
        getDoc.mockRejectedValueOnce(new Error('Firestore error'));
        await getOneQuestion(mockRequest,mockResponse)
        expect(console.error).toHaveBeenCalledWith("Error get document: ", expect.any(Error));
      });
    afterEach(() => {
        collection.mockClear();
        doc.mockClear(); 
        getDoc.mockClear()
        console.error.mockClear();
      });
  });

