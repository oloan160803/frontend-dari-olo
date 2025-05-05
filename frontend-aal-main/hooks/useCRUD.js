// src/hooks/useCRUD.js
import { useState, useEffect } from 'react';

export default function useCRUD(baseUrl, idField = 'id') {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  async function fetchItems() {
    try {
      const res = await fetch(baseUrl);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [baseUrl]);

  async function addItem(payload) {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Add failed');
    await fetchItems();
  }

  async function updateItem(id, payload) {
    const res = await fetch(`${baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Update failed');
    await fetchItems();
  }

  async function deleteItem(id) {
    const res = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    await fetchItems();
  }

  return { items, error, fetchItems, addItem, updateItem, deleteItem };
}
