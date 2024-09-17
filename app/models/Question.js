const mongoose = require('mongoose');
const { patch } = require('../routes/questions');

const questionSchema = new mongoose.Schema({
  code: {
    type: Number,
  },
  question: {
    type: String,
    required: true,
  },
  answers: {
    A: {
      type: String,
      required: true,
    },
    B: {
      type: String,
      required: true,
    },
    C: {
      type: String,
    },
    D: {
      type: String,
    }
  },
  level : {
    type : Number,
    require: true
  },
  result : {
    type: String,
    require: true,
    enum: ['A', 'B', 'C', 'D'],
  },
  path : {
    type: String,
    default: ""
  }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
