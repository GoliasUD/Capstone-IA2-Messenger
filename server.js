import express from 'express';
import { randomUUID } from 'node:crypto';

// create application
const app = express();
app.use(express.json({ limit: '16kb' }));
const notes = [];

function health(_req, res) {
	res.status(200).json({ status: 'ok' });
}
app.get('/api/health', health);

function get_data(_req, res) {
	res.status(200).json({ notes });
}
app.get('/api/examples/notes', get_data);

function post_data(req, res) {
	const raw = req.body?.text;
	if (typeof raw != 'string') {
		return res.status(400).json({ error: 'invalid text' });
	}
	
	const text = raw.trim();
	if (text.length === 0 || text.length > 280) {
		return res.status(400).json({ error: 'invalid text' });
	}
	
	const note = { id: randomUUID(), text };
	notes.push(note);
	return res.status(201).json({ note });
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

app.listen(3000, '127.0.0.1', start_server);
