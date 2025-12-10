import React from 'react';
import { Card } from '../ui';

export interface BirthInfo {
  date?: string;
  time?: string;
  location?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface BasicInfoProps {
  birth?: BirthInfo;
}

// Displays the birth data used for all calculations so users can verify
// the core information driving their profile.

export default function BasicInfo({ birth }: BasicInfoProps) {
  if (!birth) return null;

  return (
    <Card variant="glass" className="mb-6">
      <h2 title="Your basic birth information used for all further analysis">Birth Details</h2>
      <p className="help-text">These details form the foundation of your horoscope.</p>
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
        {Math.abs(birth.latitude).toFixed(4)}°{" "}
        {birth.latitude >= 0 ? "N" : "S"},{" "}
        {Math.abs(birth.longitude).toFixed(4)}°{" "}
        {birth.longitude >= 0 ? "E" : "W"}
      </p>
      <p>
        <strong>Timezone:</strong> {birth.timezone}
      </p>
    </Card>
  );
}
