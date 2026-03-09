(async () => {
  const res = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enrollmentNo: "ENR004", name: "Riya Mishra", password: "122007" })
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
})();
