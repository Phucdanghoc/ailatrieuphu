const Question = require('../models/Question');
const readXlsxFile = require('read-excel-file/node');

class QuestionController {
    // Create a new question
    async createQuestion(req, res) {
        try {
            console.log(req.body)
            const { question, answers, result, level, path } = req.body;
            const newQuestion = new Question({
                question,
                answers,
                result,
                level,
                path
            });
            console.log(newQuestion);
            await newQuestion.save();
            res.status(200).json({ message: 'Question created successfully', data: newQuestion });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Error creating question', error });
        }
    }
    async getPlayQuestions(req, res) {
        try {
            const level = parseInt(req.query.level, 10) || 1;
            const number = parseInt(req.query.number, 10) || 10;
            console.log(level + number);
            const randomQuestions = await Question.aggregate([
                { $match: { level: level ,path: ''} },
                { $sample: { size: number } }
            ]);
            const imagePattern = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
            const videoPattern = /\.(mp4)$/i;

            const randomQuestionImage = await Question.aggregate([
                {
                    $match: {
                        level: level,
                        path: {$regex: imagePattern}
                    }
                },
                { $sample: { size: 1 } }
            ]);
            const randomQuestionVideo = await Question.aggregate([
                {
                    $match: {
                        level: level,
                        path: {  $regex: videoPattern }
                    }
                },
                { $sample: { size: 1 } }
            ]);
            console.log(randomQuestionVideo);
            if (randomQuestionImage.length > 0) {
                randomQuestions[4] = randomQuestionImage[0];
            }
            if (randomQuestionVideo.length > 0) {
                randomQuestions[9] = randomQuestionVideo[0];
            }
            res.status(200).json({ data: randomQuestions });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching questions', error });
        }
    }
    async getAllQuestions(req, res) {
        try {
            const pageSize = parseInt(req.query.pageSize, 10) || 10;
            const page = parseInt(req.query.page, 10) || 1;
            console.log(page)
            const skip = (page - 1) * pageSize;
            const questions = await Question.find()
                .skip(skip)
                .limit(pageSize)
                .exec();
            res.status(200).json({ data: questions });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching questions', error });
        }
    }


    async search(req, res) {
        try {
            const searchQuery = req.query.q || '';
            if (typeof searchQuery !== 'string') {
                return res.status(400).json({ message: 'Invalid search query' });
            }
            const questions = await Question.find({
                question: { $regex: new RegExp(searchQuery, 'i') }
            }).exec();
            res.status(200).json({ data: questions });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching questions', error });
        }
    }
    async getByLevel(req, res) {
        try {
            const level = parseInt(req.params.id, 10) || 1;
            const number = parseInt(req.query.number, 10) || 10;
            console.log(level + number);
            const questions = await Question.find(
                {
                    level: level
                }
            )
                .skip(skip)
                .limit(number)
                .exec();
            res.status(200).json({ data: questions });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching questions', error });
        }
    }

    // Get a single question by ID
    async getQuestionById(req, res) {
        try {
            const { id } = req.params;
            const question = await Question.findById(id);

            if (!question) {
                return res.status(404).json({ message: 'Question not found' });
            }

            res.status(200).json({ data: question });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching question', error });
        }
    }

    // Update a question by ID
    async updateQuestionById(req, res) {
        try {
            const { id } = req.params;

            const { question, answers, result, level, path } = req.body;
            const updatedQuestion = await Question.findByIdAndUpdate(
                id,
                { question, answers, result, level, path },
                { new: true }
            );

            if (!updatedQuestion) {
                return res.status(404).json({ message: 'Question not found' });
            }

            res.status(200).json({ message: 'Question updated successfully', data: updatedQuestion });
        } catch (error) {
            res.status(500).json({ message: 'Error updating question', error });
        }
    }

    // Delete a question by ID
    async deleteQuestionById(req, res) {
        try {
            const { id } = req.params;

            // Find the question by ID and remove it
            const deletedQuestion = await Question.findByIdAndDelete(id);

            if (!deletedQuestion) {
                return res.status(404).json({ message: 'Question not found' });
            }

            res.status(200).json({ message: 'Question deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting question', error });
        }
    }
    async Seeding(req, res) {
        try {
            const questions = this.generateQuestions();
            await Question.insertMany(questions);
            console.log('Questions inserted successfully!');
        } catch (err) {
            console.error('Error inserting questions:', err);
        }
    }
    async importByExcel(req, res) {
        try {
            const filePath = req.file.path;

            // Read the Excel file
            const rows = await readXlsxFile(filePath);

            // Remove header row
            const headers = rows.shift();

            // Map the data to fit the schema
            const questions = rows.map(row => ({
                code: row[0],
                question: row[1],
                answers: {
                    A: row[2],
                    B: row[3],
                    C: row[4],
                    D: row[5]
                },
                level: row[6],
                result: row[7],
                path: row[8] || ""
            }));

            // Insert into MongoDB
            const result = await Question.insertMany(questions);
            console.log('Questions inserted successfully:', result);

            // Send success response
            res.status(200).send('File uploaded and questions inserted!');
        } catch (error) {
            console.error('Error inserting questions:', error);
            res.status(500).send('An error occurred while processing the file.');
        }
    }
    generateQuestions() {
        const questions = [];
        const levels = [2, 3, 4, 5];
        const types = ['text', 'image', 'video'];

        levels.forEach(level => {
            for (let i = 1; i <= 15; i++) {
                const question = {
                    code: i + (level * 100), // Unique code based on level
                    question: `This is a sample question for level ${level} - Question ${i}`,
                    answers: {
                        A: 'Option A',
                        B: 'Option B',
                        C: 'Option C',
                        D: 'Option D',
                    },
                    level: level,
                    result: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)], // Randomly assign correct answer
                    path: `/images/question${i}.png`, // Example path (adjust as needed)
                    type: types[Math.floor(Math.random() * types.length)], // Randomly assign type
                };
                questions.push(question);
            }
        });

        return questions;
    };


}

module.exports = new QuestionController();
