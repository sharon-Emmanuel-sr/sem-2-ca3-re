const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/libraryDB';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log(' Connected to MongoDB'))
.catch(err => console.error(' MongoDB connection error:', err));

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    publishedYear: { type: Number },
    availableCopies: { type: Number, required: true },
    borrowedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Book = mongoose.model('Book', bookSchema);

app.get('/', (req, res) => {
    res.send('Welcome to the Library Management API');
});

app.post('/api/books', async (req, res) => {
    try {
        const { title, author, genre, publishedYear, availableCopies } = req.body;

        if (!title || !author || !genre || availableCopies == null) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newBook = new Book({ title, author, genre, publishedYear, availableCopies });
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/books/:id?', async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
            if (!book) return res.status(404).json({ error: 'Book not found' });
            return res.json(book);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;    

        const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBook) return res.status(404).json({ error: 'Book not found' });

        res.json(updatedBook);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBook = await Book.findByIdAndDelete(id);
        if (!deletedBook) return res.status(404).json({ error: 'Book not found' });

        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
