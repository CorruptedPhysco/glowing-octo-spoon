const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Serve the add.html file
app.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'add.html'));
});

// Handle form submission
app.post('/add-program', (req, res) => {
    const { programName, programCode, question} = req.body;
    const programFileName = programName.toLowerCase().replace(/\s+/g, '_') + '.html';

    // Create the new program HTML file content
    const programHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${programName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        pre {
            background-color: #eaeaea;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .back-link {
            display: block;
            margin-top: 20px;
            text-align: center;
            text-decoration: none;
            color: #333;
            font-weight: bold;
            transition: color 0.3s ease;
        }
        .back-link:hover {
            color: #000000;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${programName}</h1>
        <h4>${question}</h1>
        <pre><code>${programCode}</code></pre>
        <a class="back-link" href="index.html">Back to Programs List</a>
    </div>
</body>
</html>
`;

    // Write the new program file
    fs.writeFile(path.join(__dirname, 'public', programFileName), programHtml, (err) => {
        if (err) throw err;

        // Path to your index.html file
        const indexFilePath = path.join(__dirname, 'public', 'index.html');

        // Read the existing index.html file
        fs.readFile(indexFilePath, 'utf8', (err, data) => {
            if (err) throw err;

            // Find where to insert the new program link
            const insertIndex = data.indexOf('<!-- Add more programs as needed -->');

            // Create the new program link
            const newProgramLink = `<a href="${programFileName}">${programName}</a>\n`;

            // Insert the new link into the HTML
            const updatedHtml = data.slice(0, insertIndex) + newProgramLink + data.slice(insertIndex);

            // Write the updated HTML back to the index.html file
            fs.writeFile(indexFilePath, updatedHtml, 'utf8', (err) => {
                if (err) throw err;

                res.send('Program added successfully!');
            });
        });
    });
});


// Route to get the list of programs
app.get('/program-list', (req, res) => {
    fs.readdir(path.join(__dirname, 'public'), (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory.');
        }

        // Filter for HTML files only
        const programs = files.filter(file => file.endsWith('.html') && file !== 'index.html');
        res.json(programs);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

