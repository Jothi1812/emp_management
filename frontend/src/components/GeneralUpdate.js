import React, { useState } from 'react';
import axios from 'axios';

export default function GeneralUpdate() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendStatus('');

    try {
      await axios.post('https://emp-management-hbon.onrender.com/api/send-general-update', { subject, message });
      setSendStatus('Update sent successfully to all employees.');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending general update:', error);
      setSendStatus('Failed to send update. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="general-update">
      <h2>Send General Update</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="message">Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Update'}
        </button>
      </form>
      {sendStatus && <p>{sendStatus}</p>}
    </div>
  );
}