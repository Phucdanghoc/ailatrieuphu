const express = require('express');
const router = express.Router();
const questionController = require('../controllers/QuestionController'); // Import the class-based controller
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });




router.post('/questions', (req, res) => questionController.createQuestion(req, res));
router.get('/questions', (req, res) => questionController.getAllQuestions(req, res));
router.get('/questions/seeding', (req, res) => questionController.Seeding(req, res));
router.get('/questions/search',(req,res) => questionController.search(req,res));
router.get('/questions/level/:id',(req,res) => questionController.getByLevel(req,res));
router.get('/questions/play', (req, res) => questionController.getPlayQuestions(req, res));
router.get('/questions/:id', (req, res) => questionController.getQuestionById(req, res));
router.put('/questions/:id', (req, res) => questionController.updateQuestionById(req, res));
router.delete('/questions/:id', (req, res) => questionController.deleteQuestionById(req, res));
router.post('/question/excel',upload.single('file'),(req,res) => questionController.importByExcel(req,res));

module.exports = router;
