import { promises as fs } from 'fs';
import { join } from 'path';
import { updateRoommateBalances } from './roommate.js';

const gastosFilePath = join(process.cwd(), 'data', 'gastos.json');

export async function getGastos(req, res) {
    try {
        const data = await fs.readFile(gastosFilePath, 'utf-8');
        const gastos = JSON.parse(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(gastos));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to get gastos' }));
    }
}

export async function addGasto(req, res) {
    try {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const newGasto = JSON.parse(body);
            const data = await fs.readFile(gastosFilePath, 'utf-8');
            const gastos = JSON.parse(data);
            newGasto.id = gastos.length ? gastos[gastos.length - 1].id + 1 : 1;
            gastos.push(newGasto);
            await fs.writeFile(gastosFilePath, JSON.stringify(gastos, null, 2));
            await updateRoommateBalances();  // Update balances after adding a gasto
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newGasto));
        });
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to add gasto' }));
    }
}

export async function updateGasto(req, res) {
    try {
        const id = parseInt(new URL(req.url, `http://${req.headers.host}`).searchParams.get('id'));
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const updatedGasto = JSON.parse(body);
            const data = await fs.readFile(gastosFilePath, 'utf-8');
            const gastos = JSON.parse(data);
            const index = gastos.findIndex(g => g.id === id);
            if (index !== -1) {
                gastos[index] = { ...gastos[index], ...updatedGasto };
                await fs.writeFile(gastosFilePath, JSON.stringify(gastos, null, 2));
                await updateRoommateBalances();  // Update balances after updating a gasto
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(gastos[index]));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Gasto not found' }));
            }
        });
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to update gasto' }));
    }
}

export async function deleteGasto(req, res) {
    try {
        const id = parseInt(new URL(req.url, `http://${req.headers.host}`).searchParams.get('id'));
        const data = await fs.readFile(gastosFilePath, 'utf-8');
        const gastos = JSON.parse(data);
        const newGastos = gastos.filter(g => g.id !== id);
        await fs.writeFile(gastosFilePath, JSON.stringify(newGastos, null, 2));
        await updateRoommateBalances();  // Update balances after deleting a gasto
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to delete gasto' }));
    }
}

