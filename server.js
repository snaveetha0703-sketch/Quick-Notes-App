
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Notes file location
const file = path.join(__dirname, "notes.json");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Read notes
function readNotes() {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Save notes
function saveNotes(notes) {
    fs.writeFileSync(file, JSON.stringify(notes, null, 2));
}

// Display all notes
app.get("/notes", (req, res) => {
    res.json(readNotes());
});

// Add a new note
app.post("/notes", (req, res) => {
    const { title, content } = req.body;

    if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({
            message: "Enter title and content"
        });
    }

    const notes = readNotes();

    const note = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        pinned: false,
        date: new Date().toLocaleString()
    };

    notes.unshift(note);
    saveNotes(notes);

    res.status(201).json(note);
});

// Edit a note
app.put("/notes/:id", (req, res) => {
    const notes = readNotes();

    const note = notes.find(n => n.id === req.params.id);

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    const { title, content } = req.body;

    if (!title?.trim() || !content?.trim()) {
        return res.status(400).json({
            message: "Enter title and content"
        });
    }

    note.title = title.trim();
    note.content = content.trim();

    saveNotes(notes);

    res.json(note);
});

// Pin or unpin a note
app.patch("/notes/:id", (req, res) => {
    const notes = readNotes();

    const note = notes.find(n => n.id === req.params.id);

    if (!note) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    note.pinned = !note.pinned;

    saveNotes(notes);

    res.json(note);
});

// Delete a note
app.delete("/notes/:id", (req, res) => {
    const notes = readNotes();

    const updatedNotes = notes.filter(
        n => n.id !== req.params.id
    );

    if (notes.length === updatedNotes.length) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    saveNotes(updatedNotes);

    res.json({
        message: "Note deleted successfully"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
