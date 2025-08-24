// POST Route to add Visitor's name (this will be visible in the CEO dashboard)
app.post('/api/visitor', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).send('Visitor name is required');
  }

  try {
    // Insert visitor name into a table in the database
    const query = 'INSERT INTO visitors (name) VALUES ($1)';
    await client.query(query, [name]);

    res.status(200).send('Visitor name added successfully');
  } catch (error) {
    console.error('Error adding visitor:', error);
    res.status(500).send('Error adding visitor');
  }
});
