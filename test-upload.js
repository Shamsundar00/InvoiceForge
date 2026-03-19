const fs = require('fs');
const path = require('path');

async function testUpload() {
  const formData = new FormData();
  
  // Create a dummy simple Excel file (or just a text file named .csv)
  const dummyCsv = 'Name,Amount\nJohn,100\nJane,200';
  const blob = new Blob([dummyCsv], { type: 'text/csv' });
  formData.append('file', blob, 'test.csv');

  try {
    const res = await fetch('http://localhost:3000/api/source', {
      method: 'POST',
      body: formData
    });
    
    const text = await res.text();
    fs.writeFileSync('error.html', text);
    console.log('STATUS:', res.status);
    
    // Attempt to extract <title>
    const titleMatch = text.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      console.log('ERROR TITLE:', titleMatch[1]);
    }
    
    // Next.js error overlay often contains the error string inside <div data-nextjs-dialog-header> or <p>
    const match = text.match(/Unhandled Runtime Error.*?<p>(.*?)<\/p>/s) || text.match(/Error: (.*?)<br>/);
    if (match) {
      console.log('ERROR EXTRACT:', match[1].substring(0, 500));
    }
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
}

testUpload();
