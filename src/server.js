import express from 'express';
import mongoose from 'mongoose';
import { Note } from './models/Note.js';
import { PrimerUser } from './models/PrimerUser.js';
import { authRouter } from './routes/auth.js';
import { privateNotesRouter } from './routes/privateNotes.js';
import { requireAuth } from './middleware/requireAuth.js'
import { studyRouter } from './routes/study.js';
//import { randomUUID } from 'node:crypto';

// create application
const app = express();
app.use(express.json({ limit: '16kb' }));
//const notes = [];

function health(_req, res) {
	res.status(200).json({ status: 'ok' });
}
app.get('/api/health', health);

function ready(_req, res) {
	const isReady = mongoose.connection.readyState === 1;
	return res.status(isReady ? 200 : 503).json({ status: isReady ? 'ready' : 'unavailable' });
}
app.get('/api/ready', ready);

function requireDatabase(_req, res, next) {
	if (mongoose.connection.readyState !== 1) {
		return res.status(503).json({ error: 'database unavailable' });
	}
	next();
}
app.use('/api/auth', requireDatabase, authRouter);
app.use('/api/private/notes', requireDatabase, requireAuth, privateNotesRouter);
app.use('/api/study', requireDatabase, requireAuth, studyRouter);

function available(_req, res, next) {
	if (mongoose.connection.readyState !== 1) {
		return res.status(503).json({ error: 'database unavailable' });
	}
	next();
}
app.use('/api/examples/notes', available);

function noteView(doc) {
	return {
		id: doc._id.toString(),
		text: doc.text,
		createdAt: doc.createdAt
	};
}

async function get_data(_req, res, next) {
	try {
		const docs = await Note.find()
			.sort({ createdAt: -1, _id: -1 })
			.limit(50)	// limits results to newest 50 notes; not full pagination
			.lean();
		return res.status(200).json({ notes: docs.map(noteView) });
	} catch (err) {
		next(err);
	}
	//res.status(200).json({ notes });
}
app.get('/api/examples/notes', get_data);

async function post_data(req, res, next) {
	const raw = req.body?.text;
	if (typeof raw != 'string') {
		return res.status(400).json({ error: 'invalid text' });
	}
	
	const text = raw.trim();
	if (text.length === 0 || text.length > 280) {
		return res.status(400).json({ error: 'invalid text' });
	}
	
	try {
		const doc = await Note.create({ text });
		return res.status(201).json({ note: noteView(doc) });
	} catch (err) {
		next(err);
	}
	//const note = { id: randomUUID(), text };
	//notes.push(note);
	//return res.status(201).json({ note });
}
app.post('/api/examples/notes', post_data);

function check_route(_req, res) {
	res.status(404).json({ error: 'route not found' });
}
app.use(check_route);

function handle_error(err, _req, res, _next) {
	if (err.type === 'entity.parse.failed') {
		return res.status(400).json({ error: 'invalid JSON' });
	}
	if (err.type === 'entity.too.large') {
		return res.status(413).json({ error: 'body too large' });
	}
	console.error(err);
	return res.status(500).json({ error: 'server error' });
}
app.use(handle_error);

function start_server() {
	console.log('Listening on http://127.0.0.1:3000');
}

// connect before listening for requests
const mongoUri = process.env.MONGODB_URI ??
	'mongodb://127.0.0.1:27018/capstone_notes_primer';
  
try {
	await mongoose.connect(mongoUri, {
	  serverSelectionTimeoutMS: 5000
	});
	await PrimerUser.init();
	app.listen(3000, '127.0.0.1', () => {
		console.log('Listening on http://127.0.0.1:3000');
	});
} catch (err) {
	console.error('MongoDB connection failed:', err.message);
	process.exitCode = 1;
}

// app.listen(3000, '127.0.0.1', start_server);
