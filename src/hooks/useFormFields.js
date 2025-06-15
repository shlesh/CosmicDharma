import { useState } from 'react';

export default function useFormFields(initialFields = {}) {
  const [fields, setFields] = useState(initialFields);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  return [fields, handleChange, setFields];
}
