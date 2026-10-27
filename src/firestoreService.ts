import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

export const initialDefaultShipments: Record<string, any> = {
  "AUR-8829-X": {
    id: "AUR-8829-X",
    awbNumber: "7389210482",
    sender: "Maison de L'Ambre, Paris, France",
    recipient: "The Ritz-Carlton Penthouse, Tokyo, Japan",
    origin: "Paris (CDG Gateway)",
    destination: "Tokyo (HND Terminal)",
    currentLocation: "Transit Vault Alpha, Dubai World Central",
    status: "In Transit",
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

export async function seedInitialFirestoreData() {
  const path = 'shipments';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      console.log('[Firestore] Seeding initial consignment state to Cloud Firestore...');
      for (const [id, item] of Object.entries(initialDefaultShipments)) {
        await setDoc(doc(db, path, id), item);
      }
      console.log('[Firestore] Initial consignment state successfully seeded.');
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function subscribeToShipments(callback: (shipments: Record<string, any>) => void) {
  const path = 'shipments';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.forEach((docSnap) => {
        data[docSnap.id] = docSnap.data();
      });
      callback(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveShipmentToFirestore(shipment: any) {
  const path = `shipments/${shipment.id}`;
  try {
    await setDoc(doc(db, 'shipments', shipment.id), shipment, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateShipmentInFirestore(id: string, updates: Record<string, any>) {
  const path = `shipments/${id}`;
  try {
    await updateDoc(doc(db, 'shipments', id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteShipmentFromFirestore(id: string) {
  const path = `shipments/${id}`;
  try {
    await deleteDoc(doc(db, 'shipments', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function addChatMessageToFirestore(shipmentId: string, message: any) {
  const path = `shipments/${shipmentId}`;
  try {
    await updateDoc(doc(db, 'shipments', shipmentId), {
      chatMessages: arrayUnion(message)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
