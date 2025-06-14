import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({ name: "", dob: "", tob: "", pob: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${apiUrl}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Server error");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Vedic Astrology Profile</h1>
      <form onSubmit={handleSubmit} className="profile-form">
        <label>
          Name:
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date of Birth:
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Time of Birth:
          <input
            type="time"
            name="tob"
            value={form.tob}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Place of Birth:
          <input
            name="pob"
            value={form.pob}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Submit"}
        </button>
      </form>

      {error && <div className="error">Error: {error}</div>}

      {result && (
        <div className="result">
          <h2>Profile Results</h2>
          <ul>
            <li><strong>Moon Longitude:</strong> {result.moon_longitude.toFixed(4)}</li>
            <li><strong>Rashi:</strong> {result.rashi}</li>
            <li><strong>Nakshatra:</strong> {result.nakshatra}</li>
            <li><strong>Pada:</strong> {result.pada}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
