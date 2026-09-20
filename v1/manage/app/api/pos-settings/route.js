import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'pos_branches.json');

const DEFAULT_STORE_BRANCHES = {
  patna: {
    id: "patna",
    name: "Patna Branch",
    storeName: "AESTHETX WAYS (PATNA)",
    storeAddress: "Kankarbagh Colony More, Ghrounda, Patna, Bihar 800001",
    phone: "+91 70337 69997",
    gstin: "10AAACA0000A1Z5",
    upiId: "8008439762@ptsbi"
  },
  gaya: {
    id: "gaya",
    name: "Gaya Branch",
    storeName: "AESTHETX WAYS (GAYA)",
    storeAddress: "Gaya Railway Station Campus Rd, Gol Bagicha, Gaya, Bihar 823002",
    phone: "+91 70337 69997",
    gstin: "10AAACA0000A1Z5",
    upiId: "8008439762@ptsbi"
  }
};

const USERS_FILE = path.join(DATA_DIR, 'pos_users.json');

export async function GET() {
  try {
    let settings = { branches: DEFAULT_STORE_BRANCHES, activeBranch: "patna" };
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      settings = JSON.parse(data);
    } catch {
      // File does not exist yet; return defaults
    }

    let users = null;
    try {
      const userData = await fs.readFile(USERS_FILE, 'utf-8');
      users = JSON.parse(userData);
    } catch {
      // Users file not created yet
    }

    return Response.json({ success: true, ...settings, users });
  } catch (err) {
    return Response.json({ success: false, error: String(err), branches: DEFAULT_STORE_BRANCHES }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { branches, activeBranch, users } = body;

    await fs.mkdir(DATA_DIR, { recursive: true });

    if (branches && typeof branches === 'object') {
      await fs.writeFile(
        SETTINGS_FILE,
        JSON.stringify({ branches, activeBranch: activeBranch || 'patna', updatedAt: new Date().toISOString() }, null, 2),
        'utf-8'
      );
    }

    if (users && Array.isArray(users)) {
      await fs.writeFile(
        USERS_FILE,
        JSON.stringify(users, null, 2),
        'utf-8'
      );
    }

    return Response.json({ success: true, message: 'Saved to server successfully' });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}

