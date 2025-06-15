// src/components/ProfileForm.jsx
import React from 'react';

export default function ProfileForm({ form, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-4">
      <label>
        Name:
        <input
          name="name"
          value={form.name}
          placeholder="Shailesh Tiwari"
          onChange={onChange}
          required
          className="glass-input"
        />
      </label>
      <label>
        Date of Birth:
        <input
          type="date"
          name="birthDate"
          value={form.birthDate}
          onChange={onChange}
          required
          className="glass-input"
        />
      </label>
      <label>
        Time of Birth:
        <input
          type="time"
          name="birthTime"
          value={form.birthTime}
          onChange={onChange}
          required
          className="glass-input"
        />
      </label>
      <label>
        Place of Birth:
        <input
          name="location"
          value={form.location}
          placeholder="Renukoot, India"
          onChange={onChange}
          required
          className="glass-input"
        />
      </label>
      <button type="submit" disabled={loading} className="glass-button">
        {loading ? 'Calculating…' : 'Submit'}
      </button>
    </form>
  );
}
