import { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    tob: "",
    pob: "",
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch profile. Try again later.");
    }
  };

  return (
    <div className="container">
      <h1>🪐 Vedic Astrology Profile</h1>
      <input name="name" placeholder="Your Name" onChange={handleChange} />
      <input name="dob" type="date" onChange={handleChange} />
      <input name="tob" type="time" onChange={handleChange} />
      <input name="pob" placeholder="Place of Birth" onChange={handleChange} />
      <button onClick={handleSubmit}>Get My Profile</button>

      {result && (
        <div className="result">
          <h2>Your Vedic Profile</h2>
          <p><strong>Lagna:</strong> {result.lagna}</p>
          <p><strong>Moon Sign:</strong> {result.rashi}</p>
          <p><strong>Nakshatra:</strong> {result.nakshatra} (Pada {result.pada})</p>
          <p><strong>Mahadasha:</strong> {result.mahadasa}</p>
          <p><em>{result.message}</em></p>
        </div>
      )}
    </div>
  );
}

export default App;
