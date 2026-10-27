import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ noServer: true });
const dummyHmrWss = new WebSocketServer({ noServer: true });
let viteDevServer: any = null;

// Handle dummy HMR connection cleanly so client socket open event fires without closing prematurely
dummyHmrWss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (_) {}
  });
});

server.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // Connect Vite client cleanly to dummyHmrWss so isOpened is true and no unhandled error occurs
      dummyHmrWss.handleUpgrade(request, socket, head, (ws) => {
        dummyHmrWss.emit('connection', ws, request);
      });
    }
  } catch (err) {
    socket.destroy();
  }
});

app.use(express.json());

// Aurelia Authoritative In-Memory Shipment Database
let shipmentsState: Record<string, any> = {
  "AUR-8829-X": {
    id: "AUR-8829-X",
    awbNumber: "7389210482",
    sender: "Maison de L'Ambre, Paris, France",
    recipient: "The Ritz-Carlton Penthouse, Tokyo, Japan",
    origin: "Paris (CDG Gateway)",
    destination: "Tokyo (HND Terminal)",
    currentLocation: "Transit Vault Alpha, Dubai World Central",
    status: "In Transit", // Order Placed, In Transit, Paused, Resumed, Out for Delivery, Delivered
    progressPercentage: 58,
    speed: "840 km/h",
    eta: "Today at 18:45 JST",
    courier: "Specialist V. Sterling (Vault Transport)",
    cargo: "Haute Horlogerie Timepiece Set #04/10",
    weight: "14.2 kg",
    pieces: 2,
    serviceLevel: "Aurelia Sovereign Direct",
    checkpoints: [
      { title: "Order Placed", location: "Paris CDG Vault", time: "Oct 24, 02:15 GMT", completed: true },
      { title: "In Transit", location: "Dubai Hub Customs Clearance", time: "Oct 24, 11:30 GMT", completed: true },
      { title: "Out for Delivery", location: "Tokyo Haneda Hub", time: "Estimated 17:00 JST", completed: false },
      { title: "Delivered", location: "Final Handover at Residence", time: "Pending Sign-off", completed: false }
    ],
    chatMessages: [
      {
        id: "msg-101",
        sender: "specialist",
        senderName: "Specialist V. Sterling",
        text: "Greetings. I am currently escorting consignment AUR-8829-X through Dubai Transit Hub. Please notify me if you require gate access authorization.",
        timestamp: "11:35 GMT"
      }
    ],
    eventLog: [
      { id: "evt-101", timestamp: "Oct 24, 02:15 GMT", title: "Order Placed", location: "Paris CDG Vault", note: "Consignment registered into Aurelia Sovereign telemetry system." },
      { id: "evt-102", timestamp: "Oct 24, 07:40 GMT", title: "Air Transit Departure", location: "CDG Airside Apron", note: "Loaded into climate-controlled vault hold on Sovereign Flight AE-409." },
      { id: "evt-103", timestamp: "Oct 24, 11:30 GMT", title: "In Transit", location: "Dubai World Central", note: "Customs clearance verified & transit vault transfer completed." }
    ],
    coordinates: {
      origin: { x: 120, y: 160, label: "Paris (CDG)" },
      current: { x: 440, y: 210, label: "Dubai Hub" },
      destination: { x: 780, y: 170, label: "Tokyo (HND)" }
    }
  },
  "AUR-5510-Y": {
    id: "AUR-5510-Y",
    awbNumber: "9102847120",
    sender: "Savile Row Atelier, London, UK",
    recipient: "Private Estate, Zurich, Switzerland",
    origin: "London Vault Facility",
    destination: "Zurich Airside Depot",
    currentLocation: "Customs Inspection Bay 3, Zurich Docks",
    status: "Paused",
    progressPercentage: 72,
    speed: "0 km/h (Customs Hold)",
    eta: "Delayed (Pending Clear)",
    courier: "Express Diplomatic Pouch Unit",
    cargo: "Bespoke Cashmere Overshirts & Diamond Cufflinks",
    weight: "6.8 kg",
    pieces: 1,
    serviceLevel: "Diplomatic Express Pouch",
    checkpoints: [
      { title: "Order Placed", location: "Savile Row Hub", time: "Oct 24, 04:00 GMT", completed: true },
      { title: "In Transit", location: "Eurotunnel Transit Node", time: "Oct 24, 07:20 GMT", completed: true },
      { title: "Out for Delivery", location: "Zurich City Dispatch", time: "On Hold", completed: false },
      { title: "Delivered", location: "Private Residence Zurich", time: "Pending Unpause", completed: false }
    ],
    chatMessages: [
      {
        id: "msg-201",
        sender: "specialist",
        senderName: "Diplomatic Pouch Lead",
        text: "Customs clearance paperwork is currently under diplomatic audit. I will update you as soon as release clearance is granted.",
        timestamp: "09:12 GMT"
      }
    ],
    eventLog: [
      { id: "evt-201", timestamp: "Oct 24, 04:00 GMT", title: "Order Placed", location: "Savile Row Hub", note: "Intake completed & diplomatic pouch seal applied." },
      { id: "evt-202", timestamp: "Oct 24, 07:20 GMT", title: "In Transit", location: "Eurotunnel Transit Node", note: "Crossed UK border via high-speed diplomatic shuttle." },
      { id: "evt-203", timestamp: "Oct 24, 09:12 GMT", title: "Customs Hold (Paused)", location: "Zurich Docks Bay 3", note: "Diplomatic audit requested by Zurich customs control." }
    ],
    coordinates: {
      origin: { x: 140, y: 140, label: "London" },
      current: { x: 310, y: 190, label: "Customs Zurich" },
      destination: { x: 480, y: 220, label: "Zurich" }
    }
  },
  "AUR-9904-Z": {
    id: "AUR-9904-Z",
    awbNumber: "4029182740",
    sender: "Sotheby's Gallery, New York, USA",
    recipient: "Bel-Air Private Vault, Los Angeles, USA",
    origin: "New York Midtown Depot",
    destination: "Los Angeles Heliport Node",
    currentLocation: "Final Courier Escort - Sunset Blvd",
    status: "Out for Delivery",
    progressPercentage: 92,
    speed: "65 km/h",
    eta: "Today at 09:15 PST",
    courier: "Armored Ground Escort Bravo",
    cargo: "Mid-Century Masterwork Oil Canvas",
    weight: "22.5 kg",
    pieces: 3,
    serviceLevel: "Armored Direct Courier",
    checkpoints: [
      { title: "Order Placed", location: "NY Gallery Intake", time: "Oct 23, 20:00 EST", completed: true },
      { title: "In Transit", location: "Cross-Country Flight Charter", time: "Oct 24, 01:10 EST", completed: true },
      { title: "Out for Delivery", location: "LAX Helipad Courier", time: "Oct 24, 08:30 PST", completed: true },
      { title: "Delivered", location: "Bel-Air Safehouse", time: "In Next 15 mins", completed: false }
    ],
    chatMessages: [
      {
        id: "msg-301",
        sender: "specialist",
        senderName: "Armored Escort Commander",
        text: "Approaching Sunset Blvd. Armored escort unit is 15 minutes away from the residence. Please have biometric receiver ready.",
        timestamp: "08:50 PST"
      }
    ],
    eventLog: [
      { id: "evt-301", timestamp: "Oct 23, 20:00 EST", title: "Order Placed", location: "NY Gallery Intake", note: "Artwork inspected, sealed, and transferred to armored vehicle." },
      { id: "evt-302", timestamp: "Oct 24, 01:10 EST", title: "Air Charter Departure", location: "JFK Terminal 8", note: "Charter flight departed for Los Angeles." },
      { id: "evt-303", timestamp: "Oct 24, 08:30 PST", title: "Out for Delivery", location: "LAX Helipad Courier", note: "Transferred to Armored Ground Escort Bravo." }
    ],
    coordinates: {
      origin: { x: 100, y: 200, label: "New York" },
      current: { x: 680, y: 240, label: "Los Angeles" },
      destination: { x: 740, y: 250, label: "Bel-Air" }
    }
  }
};

// ==================== REST API ENDPOINTS ==================== //

// Get all shipments
app.get('/api/shipments', (_req: Request, res: Response) => {
  res.json({ success: true, count: Object.keys(shipmentsState).length, data: shipmentsState });
});

// Get single shipment by ID or AWB
app.get('/api/shipments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const shipment = shipmentsState[id.toUpperCase()];
  if (shipment) {
    res.json({ success: true, data: shipment });
  } else {
    res.status(404).json({ success: false, error: 'Shipment not found' });
  }
});

// Create new Aurelia shipment / Book waybill
app.post('/api/shipments', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.id) {
    body.id = `AUR-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
  }
  if (!body.awbNumber) {
    body.awbNumber = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  }

  shipmentsState[body.id] = {
    status: 'Order Placed',
    progressPercentage: 10,
    speed: 'In Dispatch',
    eta: 'In 24-48 Hours',
    checkpoints: [
      { title: 'Order Placed', location: body.origin || 'Origin Vault', time: 'Just Now', completed: true },
      { title: 'In Transit', location: 'Airside Gateway', time: 'Pending', completed: false },
      { title: 'Out for Delivery', location: body.destination || 'Destination Hub', time: 'Pending', completed: false },
      { title: 'Delivered', location: body.recipient || 'Recipient Residence', time: 'Pending', completed: false }
    ],
    coordinates: {
      origin: { x: 120, y: 180, label: body.origin || 'Origin' },
      current: { x: 220, y: 180, label: 'Airside Intake' },
      destination: { x: 720, y: 180, label: body.destination || 'Destination' }
    },
    ...body
  };

  broadcastWebSocketEvent('SHIPMENT_ADDED', { newShipment: shipmentsState[body.id], shipments: shipmentsState });
  res.status(201).json({ success: true, message: 'Shipment created successfully', data: shipmentsState[body.id] });
});

// Update / Override shipment
app.put('/api/shipments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const targetId = id.toUpperCase();

  if (shipmentsState[targetId]) {
    const updates = req.body;
    Object.assign(shipmentsState[targetId], updates);

    broadcastWebSocketEvent('STATE_CHANGED', { updatedId: targetId, shipment: shipmentsState[targetId], shipments: shipmentsState });
    res.json({ success: true, message: 'Shipment updated successfully', data: shipmentsState[targetId] });
  } else {
    res.status(404).json({ success: false, error: 'Shipment not found' });
  }
});

// Delete shipment
app.delete('/api/shipments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const targetId = id.toUpperCase();

  if (shipmentsState[targetId]) {
    delete shipmentsState[targetId];
    broadcastWebSocketEvent('SHIPMENT_DELETED', { deletedId: targetId, shipments: shipmentsState });
    res.json({ success: true, message: 'Shipment deleted successfully' });
  } else {
    res.status(404).json({ success: false, error: 'Shipment not found' });
  }
});

// Get chat messages for a shipment
app.get('/api/shipments/:id/chat', (req: Request, res: Response) => {
  const { id } = req.params;
  const targetId = id.toUpperCase();
  if (shipmentsState[targetId]) {
    res.json({ success: true, chatMessages: shipmentsState[targetId].chatMessages || [] });
  } else {
    res.status(404).json({ success: false, error: 'Shipment not found' });
  }
});

// Post chat message via REST
app.post('/api/shipments/:id/chat', (req: Request, res: Response) => {
  const { id } = req.params;
  const targetId = id.toUpperCase();
  const { sender = 'customer', senderName, text } = req.body;

  if (shipmentsState[targetId] && text) {
    if (!shipmentsState[targetId].chatMessages) {
      shipmentsState[targetId].chatMessages = [];
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      sender,
      senderName: senderName || (sender === 'specialist' ? 'Aurelia Specialist Escort' : 'Customer'),
      text,
      timestamp: timeStr
    };
    shipmentsState[targetId].chatMessages.push(newMsg);

    broadcastWebSocketEvent('NEW_CHAT_MESSAGE', {
      shipmentId: targetId,
      message: newMsg,
      chatMessages: shipmentsState[targetId].chatMessages,
      shipment: shipmentsState[targetId]
    });

    res.json({ success: true, message: newMsg });
  } else {
    res.status(400).json({ success: false, error: 'Invalid shipment or message text' });
  }
});

// Calculate Aurelia Shipping Rate & Delivery Time
app.post('/api/quote', (req: Request, res: Response) => {
  const { weight = 1, origin = 'Paris', destination = 'Tokyo', serviceType = 'sovereign' } = req.body;
  const numericWeight = parseFloat(weight) || 1;

  let baseRate = 85;
  if (serviceType === 'armored') baseRate = 220;
  if (serviceType === 'diplomatic') baseRate = 120;

  const totalCost = (baseRate + numericWeight * 18.5).toFixed(2);
  const estimatedDays = serviceType === 'armored' ? 'Today (Direct Escort)' : '1-2 Business Days';

  res.json({
    success: true,
    quote: {
      origin,
      destination,
      weight: `${numericWeight} kg`,
      serviceType,
      currency: 'USD',
      amount: totalCost,
      estimatedDelivery: estimatedDays,
      carrier: 'Aurelia Sovereign Transport'
    }
  });
});

// ==================== ADMIN AUTHENTICATION ==================== //
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aurelia.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AureliaVault2026!';
const activeAdminSessions = new Set<string>();

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, email, password, identifier } = req.body || {};
  const userIdentifier = String(identifier || email || username || '').trim().toLowerCase();
  const pass = String(password || '').trim();

  const isIdentifierValid = (
    userIdentifier === ADMIN_EMAIL.toLowerCase() ||
    userIdentifier === ADMIN_USERNAME.toLowerCase() ||
    userIdentifier === 'admin'
  );

  if (isIdentifierValid && pass === ADMIN_PASSWORD) {
    const token = `aur_adm_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    activeAdminSessions.add(token);
    res.json({
      success: true,
      token,
      admin: {
        email: ADMIN_EMAIL,
        name: 'Aurelia Dispatch Commander',
        role: 'SUPER_ADMIN'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid administrator credentials. Access restricted to authorized personnel.'
    });
  }
});

// Verify Admin Session
app.get('/api/admin/session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (token && activeAdminSessions.has(token)) {
    res.json({
      success: true,
      authenticated: true,
      admin: {
        email: ADMIN_EMAIL,
        name: 'Aurelia Dispatch Commander',
        role: 'SUPER_ADMIN'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Session invalid or expired'
    });
  }
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, '').trim();
  const tokenFromBody = (req.body && req.body.token) || '';
  const token = tokenFromHeader || tokenFromBody;

  if (token) {
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==================== WEBSOCKET BROADCASTING ==================== //

function recordEventLogEntry(shipmentId: string, title: string, location?: string, note?: string) {
  const item = shipmentsState[shipmentId];
  if (!item) return;
  if (!Array.isArray(item.eventLog)) item.eventLog = [];

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const fullStamp = `${dateStr}, ${timeStr}`;

  item.eventLog.push({
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: fullStamp,
    title: title,
    location: location || item.currentLocation || item.origin || "Airside Vault",
    note: note || `Operational state recorded as ${title}.`
  });
}

function broadcastWebSocketEvent(type: string, payload: any) {
  const msg = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  console.log('[Aurelia WebSocket] Client connected');

  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: shipmentsState
  }));

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'UPDATE_SHIPMENT') {
        const { id, updates, status, currentLocation, progressPercentage } = data.payload;
        if (shipmentsState[id]) {
          if (updates && typeof updates === 'object') {
            Object.assign(shipmentsState[id], updates);
          }
          if (status !== undefined) {
            shipmentsState[id].status = status;
            if (status === 'Paused') {
              shipmentsState[id].speed = '0 km/h (Vault Hold)';
            } else if (status === 'Resumed' || status === 'In Transit') {
              shipmentsState[id].speed = '840 km/h';
            } else if (status === 'Delivered') {
              shipmentsState[id].progressPercentage = 100;
              shipmentsState[id].speed = '0 km/h (Handover Complete)';
              if (Array.isArray(shipmentsState[id].checkpoints)) {
                shipmentsState[id].checkpoints.forEach((cp: any) => cp.completed = true);
              }
            }
            recordEventLogEntry(id, `Status: ${status}`, currentLocation, `Consignment status updated to ${status}.`);
          } else if (currentLocation !== undefined) {
            shipmentsState[id].currentLocation = currentLocation;
            recordEventLogEntry(id, `Location Update`, currentLocation, `Consignment position updated to ${currentLocation}.`);
          } else {
            recordEventLogEntry(id, `State Updated`, shipmentsState[id].currentLocation, `Master logistics override applied.`);
          }

          if (progressPercentage !== undefined) {
            shipmentsState[id].progressPercentage = progressPercentage;
          }

          broadcastWebSocketEvent('STATE_CHANGED', { updatedId: id, shipment: shipmentsState[id], shipments: shipmentsState });
        }
      } else if (data.type === 'DELETE_SHIPMENT') {
        const { id } = data.payload;
        if (shipmentsState[id]) {
          delete shipmentsState[id];
          broadcastWebSocketEvent('SHIPMENT_DELETED', { deletedId: id, shipments: shipmentsState });
        }
      } else if (data.type === 'ADD_SHIPMENT') {
        const newShipment = data.payload;
        if (!newShipment.chatMessages) newShipment.chatMessages = [];
        if (!newShipment.eventLog) {
          const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
          const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
          newShipment.eventLog = [
            { id: `evt-${Date.now()}`, timestamp: `${dateStr}, ${timeStr}`, title: "Order Placed", location: newShipment.origin || "Vault Depot", note: "Waybill registered into Aurelia Sovereign telemetry system." }
          ];
        }
        shipmentsState[newShipment.id] = newShipment;
        broadcastWebSocketEvent('SHIPMENT_ADDED', { newShipment, shipments: shipmentsState });
      } else if (data.type === 'SEND_CHAT_MESSAGE' || data.type === 'CHAT_MESSAGE') {
        const { shipmentId, sender, senderName, text } = data.payload;
        if (shipmentsState[shipmentId] && text) {
          if (!shipmentsState[shipmentId].chatMessages) {
            shipmentsState[shipmentId].chatMessages = [];
          }
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newMsg = {
            id: `msg-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            sender: sender || 'customer',
            senderName: senderName || (sender === 'specialist' ? 'Aurelia Specialist Escort' : 'Customer'),
            text,
            timestamp: timeStr
          };
          shipmentsState[shipmentId].chatMessages.push(newMsg);

          broadcastWebSocketEvent('NEW_CHAT_MESSAGE', {
            shipmentId,
            message: newMsg,
            chatMessages: shipmentsState[shipmentId].chatMessages,
            shipment: shipmentsState[shipmentId]
          });
        }
      }
    } catch (err) {
      console.error('[Aurelia WebSocket] Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[Aurelia WebSocket] Client disconnected');
  });
});

// Server Initialization
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    viteDevServer = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'custom'
    });

    // Provide clean mock Vite client with HMR disabled to prevent WebSocket connection attempts to unreachable ports
    app.get('/@vite/client', (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.send(`
export function createHotContext(ownerPath) {
  return {
    accept(deps, cb) {},
    acceptExports(deps, cb) {},
    prune(cb) {},
    dispose(cb) {},
    decline() {},
    invalidate(message) {},
    on(event, cb) {},
    off(event, cb) {},
    send(event, data) {}
  };
}
export function updateStyle(id, content) {
  try {
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = content;
  } catch (_) {}
}
export function removeStyle(id) {
  try {
    const style = document.getElementById(id);
    if (style) style.remove();
  } catch (_) {}
}
export function injectQuery(url, queryToInject) {
  return url + (url.includes('?') ? '&' : '?') + queryToInject;
}
export class ErrorOverlay extends HTMLElement {}
export default {};
`);
    });

    app.use(viteDevServer.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await viteDevServer.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        viteDevServer.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`[Aurelia Logistics Server] Running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;

