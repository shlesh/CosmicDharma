// src/components/ProfileForm.jsx
import React from 'react';

export default function ProfileForm({ form, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-4">
      <label>
        Name:
        <input name="name" value={form.name} placeholder="Shailesh Tiwari" onChange={onChange} required />
      </label>
      <label>
        Date of Birth:
        <input type="date" name="dob" value={form.dob} onChange={onChange} required />
      </label>
      <label>
        Time of Birth:
        <input type="time" name="tob" value={form.tob} onChange={onChange} required />
      </label>
      <label>
        Place of Birth:
        <input name="pob" value={form.pob} placeholder="Renukoot, Sonebhadra" onChange={onChange} required />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Calculating…' : 'Submit'}
      </button>
    </form>
  );
}
