// src/components/BasicInfo.jsx
import React from 'react';

export default function BasicInfo({ birth }) {
  if (!birth) return null;
  return (
    <section className="mb-6">
      <h2>Birth Details</h2>
      {birth.date && (
        <p>
          <strong>Date:</strong> {birth.date}
        </p>
      )}
      {birth.time && (
        <p>
          <strong>Time:</strong> {birth.time}
        </p>
      )}
      {birth.location && (
        <p>
          <strong>Location:</strong> {birth.location}
        </p>
      )}
      <p>
        <strong>Coordinates:</strong>{" "}
        {birth.latitude.toFixed(2)}°, {birth.longitude.toFixed(2)}°
      </p>
      <p>
        <strong>Timezone:</strong> {birth.timezone}
      </p>
    </section>
  );
}
