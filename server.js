// load the packages
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// create the app and set port
const app = express();
const PORT = 3000;

// middleware setup
app.use(cors());                    // allow requests from other websites
app.use(express.json());            // parse JSON in request body
app.use(express.static("public"));  // serve files from public folder

// folder where we save level files
const LEVELS_DIR = path.join(__dirname, 'levels');

// create levels folder if it doesn't exist
if (!fs.existsSync(LEVELS_DIR)) {
	fs.mkdirSync(LEVELS_DIR);
	console.log("Created level directory at", LEVELS_DIR);
}

// helper function - get file path for a level
function levelFilePath(id) {
	return path.join(LEVELS_DIR, `${id}.json`);
}

// helper function -> save level to file
function writeLevel(id, blocks, callback) {
	const json = JSON.stringify(blocks);
	fs.writeFile(levelFilePath(id), json, "utf8", callback);
}

// helper function -> load level from file
function readLevel(id, callback) {
	fs.readFile(levelFilePath(id), "utf8", (err, data) => {
		if (err) return callback(err);

		try {
			const blocks = JSON.parse(data);
			// make sure it's an array
			if (!Array.isArray(blocks)) {
				return callback(new Error("Level does not contain an array"));
			}
			callback(null, blocks);
		} catch (parseErr) {
			callback(parseErr);
		}
	});
}



// API
// GET - load a level by id
app.get('/api/v1/levels/:id', (req, res) => {
	const id = req.params.id;

	readLevel(id, (err, blocks) => {
		if (err) {
			console.error("Error reading level data:", err);
			return res.status(404).json({ error: "Level not found" });
		}
		res.json({ id, blocks });
	});
});

// POST -> create a new level
app.post('/api/v1/levels', (req, res) => {
	let { id, blocks } = req.body;

	// check if blocks array exists and not empty
	if (!Array.isArray(blocks) || blocks.length == 0) {
		return res.status(411).json({ error: "Request body must have a non-empty 'blocks' array" });
	}

	// check if level already exists
	const filePath = levelFilePath(id);
	if (fs.existsSync(filePath)) {
		return res.status(409).json({ error: `Level with ID ${id} already exists` });
	}

	// save the level
	writeLevel(id, blocks, (err) => {
		if (err) {
			console.error("Error saving data", err);
			return res.status(500).json({ error: "Failed to save level" });
		}

		res.status(201).location(`/api/v1/levels/${id}`).json({ message: "level created", id, blocks });
	});
});

// PUT -> update a level (or create if not exists)
app.put('/api/v1/levels/:id', (req, res) => {
	const id = req.params.id;
	const { blocks } = req.body;

	// check if blocks array exists and not empty
	if (!Array.isArray(blocks) || blocks.length === 0) {
		return res.status(411).json({ error: "Request body must have a non-empty 'blocks' array" });
	}

	const filePath = levelFilePath(id);
	const exists = fs.existsSync(filePath);

	// save the level
	writeLevel(id, blocks, (err) => {
		if (err) {
			console.error("Error saving data", err);
			return res.status(500).json({ error: "Failed to save level" });
		}

		// return 200 if updated, 201 if created new
		res.status(exists ? 200 : 201).json({
			message: exists ? "Level updated" : "Level created",
			id,
			blocks
		});
	});
});

// DELETE -> remove a level
app.delete('/api/v1/levels/:id', (req, res) => {
	const id = req.params.id;
	const filePath = levelFilePath(id);

	// check if level exists
	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ error: "Level not found" });
	}

	// delete the file
	fs.unlink(filePath, (err) => {
		if (err) {
			console.error("Error deleting data", err);
			return res.status(500).json({ error: "Failed to delete level" });
		}

		res.status(204).send();
	});
});

// start the server
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});