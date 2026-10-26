import { useEffect, useState } from 'react';
import { getNotes, createNote } from './api.js';
import NotesList from './NotesList.jsx';

export default function App () {
	const [notes, setNotes] = useState([]);
	const [text, setText] = useState('');
	const[loading, setLoading] = useState(true);
	const[loadFailed, setLoadFailed] = useState(false);
	const[saving, setSaving] = useState(false);
	const[error, setError] = useState('');


	useEffect(() => {
		const controller = new AbortController();
		async function load() {
			try {
				const result = await getNotes(controller.signal);
				if (controller.signal.aborted === false) setNotes(result.notes);
			} catch (err) {
				if (controller.signal.aborted === false) {
					setLoadFailed(true);
					setError(`Could not load notes: ${err.message}`);
				}
			} finally {
				if (controller.signal.aborted === false) setLoading(false);
			}
		}
		void load();
		return () => controller.abort();
	}, []);

	async function handleSubmit(event) {
		event.preventDefault();
		if (saving || loading || loadFailed) return;
		const value = text.trim();
		if (value.length < 1 || value.length > 280) {
			setError('Enter 1-280 characters');
			return;
		}
		setSaving(true);
		setError('');
		try {
			const result = await createNote(value);
			setNotes((current) => [result.note, ...current].slice(0,50));
			setText('');
		} catch (err) {
			setError(`Could not create note: ${err.message}`);
		} finally {
			setSaving(false);
		}
	}

	return (
	  <main>
	    <h1>Persistent Notes</h1>
	    <p>React, Express, and MongoDB</p>
	    <form onSubmit={handleSubmit}>
	      <label htmlFor="new-note">New note</label>
	      <input id="new-note" value={text}
	        maxLength={280} disabled={loading || saving || loadFailed}
	        onChange={(event) => setText(event.target.value)} />
	      <button type="submit" disabled={loading || saving || loadFailed}>
	        {saving ? 'Saving...' : 'Add note'}
	      </button>
	    </form>
	      {error && <p role="alert">{error}</p>}
	      {loading ? <p>Notes unavailable. Reload to retry.</p> :
	      <NotesList notes={notes} />}
	  </main>
	);
}
