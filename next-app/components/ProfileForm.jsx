// src/components/ProfileForm.jsx
import React from 'react';
import PropTypes from 'prop-types';

// Collects birth information from the visitor to generate their horoscope.

export default function ProfileForm({ form, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-4">
      <p className="help-text">Fill out your birth details to generate a personalized chart.</p>
      <label>
        Name:
        <input
          name="name"
          value={form.name}
          placeholder="Shailesh Tiwari"
          onChange={onChange}
          required
          className="glass-input"
          title="Your full name for reference"
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
          title="Choose the exact calendar date"
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
          title="Local time of your birth"
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
          title="City or town where you were born"
        />
      </label>
      <button type="submit" disabled={loading} className="glass-button">
        {loading ? 'Calculating…' : 'Submit'}
      </button>
    </form>
  );
}

ProfileForm.propTypes = {
  form: PropTypes.shape({
    name: PropTypes.string,
    birthDate: PropTypes.string,
    birthTime: PropTypes.string,
    location: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
