require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// In-memory URL store
const urls = {};
let urlCount = 1;

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Shorten URL
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  try {
    const hostname = urlParser.parse(original_url).hostname;

    dns.lookup(hostname, (err, address) => {
      if (err || !address) {
        return res.json({ error: 'invalid url' });
      }

      const short_url = urlCount++;
      urls[short_url] = original_url;

      res.json({
        original_url,
        short_url
      });
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

// Redirect short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url;
  const original_url = urls[short_url];

  if (original_url) {
    return res.redirect(original_url);
  } else {
    return res.json({ error: 'No short URL found for given input' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
