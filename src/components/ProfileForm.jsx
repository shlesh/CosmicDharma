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
          pattern="\\d{4}-\\d{2}-\\d{2}"
          title="YYYY-MM-DD"
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
          pattern="\\d{2}:\\d{2}"
          title="HH:MM"
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
      <details>
        <summary>Advanced Options</summary>
        <div className="space-y-2 mt-2">
          <label>
            Ayanāṅśā:
            <select
              name="ayanamsa"
              value={form.ayanamsa}
              onChange={onChange}
              className="glass-input"
            >
              <option value="fagan_bradley">Fagan-Bradley</option>
              <option value="lahiri">Lahiri</option>
              <option value="raman">Raman</option>
              <option value="kp">Krishnamurti (KP)</option>
            </select>
          </label>
          <label>
            House System:
            <select
              name="houseSystem"
              value={form.houseSystem}
              onChange={onChange}
              className="glass-input"
            >
              <option value="placidus">Placidus</option>
              <option value="whole_sign">Whole Sign</option>
            </select>
          </label>
          <label>
            Node Type:
            <select
              name="nodeType"
              value={form.nodeType}
              onChange={onChange}
              className="glass-input"
            >
              <option value="mean">Mean</option>
              <option value="true">True</option>
            </select>
          </label>
        </div>
      </details>
      <button type="submit" disabled={loading} className="glass-button">
        {loading ? 'Calculating…' : 'Submit'}
      </button>
    </form>
  );
}
