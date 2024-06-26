import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { addRoommate, getRoommates } from './roommate.js';
import { getGastos, addGasto, updateGasto, deleteGasto } from './gasto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.method === 'POST' && req.url === '/roommate') {
        addRoommate(req, res);
    } else if (req.method === 'GET' && req.url === '/roommates') {
        getRoommates(req, res);
    } else if (req.method === 'GET' && req.url === '/gastos') {
        getGastos(req, res);
    } else if (req.method === 'POST' && req.url === '/gasto') {
        addGasto(req, res);
    } else if (req.method === 'PUT' && req.url.startsWith('/gasto')) {
        updateGasto(req, res);
    } else if (req.method === 'DELETE' && req.url.startsWith('/gasto')) {
        deleteGasto(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
