// src/components/BasicInfo.jsx
import React from 'react';

export default function BasicInfo({ birth }) {
  if (!birth) return null;
  return (
    <section className="mb-6">
      <h2>Birth Details</h2>
      <p><strong>Date:</strong> {birth.date_string}</p>
      <p><strong>Time:</strong> {birth.time_string}</p>
      <p><strong>Location:</strong> {birth.location}</p>
      <p><strong>Coordinates:</strong> {birth.latitude.toFixed(2)}°, {birth.longitude.toFixed(2)}°</p>
    </section>
  );
}
