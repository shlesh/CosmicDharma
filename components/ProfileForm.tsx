// src/components/ProfileForm.jsx
import React from 'react';

export interface ProfileFormState {
  name: string;
  birthDate: string;
  birthTime: string;
  location: string;
}

export interface ProfileFormProps {
  form: ProfileFormState;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  loading?: boolean;
}

// Collects birth information from the visitor to generate their horoscope.

export default function ProfileForm({ form, onChange, onSubmit, loading }: ProfileFormProps) {
  return (
    <div className="glass-card mb-6">
      <form onSubmit={onSubmit} className="space-y-4">
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
    </div>
  );
}
