// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
console.log('ENV MONGODB_URI =', process.env.MONGODB_URI);
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// mongoose.connect( process.env.MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });



mongoose
  .connect(process.env.MONGODB_URI,)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });


// Sentence Schema
const sentenceSchema = new mongoose.Schema({
  german: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  arabic: {
    type: String,
    required: true,
    trim: true
  },
  reviewLevel: {
    type: String,
    enum: ['new', 'good', 'excellent'],
    default: 'new'
  },
  favorite: {
    type: Boolean,
    default: false
  },
  lastReviewed: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sentence = mongoose.model('Sentence', sentenceSchema);

// Routes

// GET - جلب جميع الجمل
app.get('/api/sentences', async (req, res) => {
  try {
    const sentences = await Sentence.find().sort({ createdAt: -1 });
    res.json(sentences);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الجمل', error: error.message });
  }
});

// POST - إضافة جملة جديدة
app.post('/api/sentences', async (req, res) => {
  try {
    const { german, arabic } = req.body;

    // التحقق من وجود الجملة
    const existingSentence = await Sentence.findOne({ german });
    if (existingSentence) {
      return res.status(400).json({
        message: 'الجملة موجودة مسبقًا',
        exists: true
      });
    }

    const newSentence = new Sentence({
      german,
      arabic,
      reviewLevel: 'new',
      favorite: false
    });

    await newSentence.save();
    res.status(201).json(newSentence);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'الجملة موجودة مسبقًا',
        exists: true
      });
    }
    res.status(500).json({ message: 'خطأ في إضافة الجملة', error: error.message });
  }
});

// PUT - تعديل الجملة
app.put('/api/sentences/:id', async (req, res) => {
  try {
    const { german, arabic, reviewLevel, favorite } = req.body;

    const updateData = {
      ...(german && { german }),
      ...(arabic && { arabic }),
      ...(reviewLevel && { reviewLevel, lastReviewed: new Date() }),
      ...(favorite !== undefined && { favorite })
    };

    const updatedSentence = await Sentence.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSentence) {
      return res.status(404).json({ message: 'الجملة غير موجودة' });
    }

    res.json(updatedSentence);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'الجملة موجودة مسبقًا',
        exists: true
      });
    }
    res.status(500).json({ message: 'خطأ في تعديل الجملة', error: error.message });
  }
});

// DELETE - حذف الجملة
app.delete('/api/sentences/:id', async (req, res) => {
  try {
    const deletedSentence = await Sentence.findByIdAndDelete(req.params.id);

    if (!deletedSentence) {
      return res.status(404).json({ message: 'الجملة غير موجودة' });
    }

    res.json({ message: 'تم حذف الجملة بنجاح', sentence: deletedSentence });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف الجملة', error: error.message });
  }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// package.json dependencies:
/*
{
  "name": "german-learning-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
*/