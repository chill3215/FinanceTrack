import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000; //process.env ist ein Obj, das alle Umgebungsvariablen enthält

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})