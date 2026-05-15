# Voxel PVP Multiplayer Project

This version keeps the multiplayer controls inside your game's ESC menu.

## What is included

- `public/index.html` . Your voxel PVP game with multiplayer added into the ESC menu
- `server.js` . Tiny Socket.IO signaling server
- `package.json` . Node dependencies and start script

## How to run locally

Install Node.js first.

Then open Terminal in this folder and run:

```bash
npm install
npm start
```

Open this in Chrome:

```text
http://localhost:3000
```

## How students connect

1. Student A opens the game.
2. Press ESC.
3. Click `Multiplayer / PVP Connect`.
4. Click `Host Room`.
5. Copy the room code.
6. Student B opens the same website.
7. Press ESC.
8. Click `Multiplayer / PVP Connect`.
9. Enter the room code.
10. Click `Join Room`.

The server only connects the browsers. After that, movement, attacks, and block changes go through WebRTC P2P.

## Free hosting recommendation

Use Render for the Node server because this project needs WebSocket support.

Render settings:

```text
Build Command: npm install
Start Command: npm start
```

Render will give you a URL like:

```text
https://your-game-name.onrender.com
```

Students should use that URL.

## Notes

- This is designed for 2-player PVP first.
- It syncs movement, basic attack messages, block breaking, block placing, and the host world snapshot.
- Free servers may sleep when unused, so the first load can take longer.
- For school networks, some P2P connections may need a TURN server. This starter uses Google's public STUN server only.
