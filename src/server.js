import express from 'express';

const app = express();

app.listen(30000, () => {
    console.log('Server is running on http://localhost:30000');
})