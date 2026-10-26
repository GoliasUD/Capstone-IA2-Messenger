export async function login(username, password) {
	const response = await fetch('/api/auth/login', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify({ username, password })
	});
	
	const data = await response.json();
	if (response.ok === false) {
		throw new Error(data.error ?? 'Login failed');
	}
	
	return data.token;
}

async function requestJson(path, options = {}) {
	let response;
	try {
		response = await fetch(path, options);
	} catch (err) {
		if (err.name === 'AbortError') throw err;
		throw new Error('Cannot reach the API');
	}
	let data;
	try {
		data = await response.json();
	} catch {
		throw new Error(`API returned invalid JSON (HTTP ${response.status})`);
	}
	if (response.ok === false) {
		throw new Error(data.error ?? `HTTP ${response.status}`);
	}
	return data;
}

// GET returns notes list
export function getNotes(signal) {
	return requestJson('/api/examples/notes', { signal });
}

export async function loadPrivateNotes(token) {
	const response = await fetch('/api/private/notes', {
	  headers: { Authorization: `Bearer ${token}` }
	});
	
	if (response.ok === false) {
		throw new Error(`Private GET failed: ${response.status}`);
	}
	
	return (await response.json()).notes;
}

// POST returns created note after saving
export function createNote(text) {
	return requestJson('/api/examples/notes', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify({ text })
	});
}
