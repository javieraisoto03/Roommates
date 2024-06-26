import { promises as fs } from 'fs';
import { join } from 'path';

const roommatesFilePath = join(process.cwd(), 'data', 'roommates.json');
const gastosFilePath = join(process.cwd(), 'data', 'gastos.json');

export async function addRoommate(req, res) {
    try {
        const data = await fs.readFile(roommatesFilePath, 'utf-8');
        const roommates = JSON.parse(data);
        const newRoommate = { name: `Roommate ${roommates.length + 1}`, debe: 0, recibe: 0 };
        roommates.push(newRoommate);
        await fs.writeFile(roommatesFilePath, JSON.stringify(roommates, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newRoommate));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to add roommate' }));
    }
}

export async function getRoommates(req, res) {
    try {
        const data = await fs.readFile(roommatesFilePath, 'utf-8');
        const roommates = JSON.parse(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(roommates));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to get roommates' }));
    }
}

export async function updateRoommateBalances() {
    try {
        const roommatesData = await fs.readFile(roommatesFilePath, 'utf-8');
        const gastosData = await fs.readFile(gastosFilePath, 'utf-8');

        const roommates = JSON.parse(roommatesData);
        const gastos = JSON.parse(gastosData);

        // Reset balances
        roommates.forEach(r => {
            r.debe = 0;
            r.recibe = 0;
        });

        gastos.forEach(g => {
            const roommate = roommates.find(r => r.name === g.roommate);
            if (roommate) {
                roommate.recibe += g.monto;
            }
        });

        const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
        const share = totalGastos / roommates.length;

        roommates.forEach(r => {
            r.debe = share - r.recibe;
        });

        await fs.writeFile(roommatesFilePath, JSON.stringify(roommates, null, 2));
    } catch (error) {
        console.error('Failed to update roommate balances:', error);
    }
}

