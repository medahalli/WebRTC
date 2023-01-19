# Zoom'eirb a P2P Video Conferencing project

This project is a peer-to-peer video conferencing application that utilizes WebRTC for real-time communication, a Node.js server with Socket.io for signaling, and a frontend built with Node.js and Pug.

## Context
RTCPeerConnection is a WebRTC API that allows two browsers to communicate directly with each other without the need for a centralized server. It is used to establish a peer-to-peer connection between two devices, allowing them to share video, audio, and data.

The RTCPeerConnection API provides a way for the client-side JavaScript code to create, configure and manage peer-to-peer connections. When two clients want to establish a connection, each client creates an RTCPeerConnection object, exchange information about the media and network configuration and then use this object to send and receive media.

Once the connection is established, you can start sending and receiving data using the createOffer and createAnswer methods, and by setting the remoteDescription property.

It's important to note that the RTCPeerConnection API requires the use of a signaling server to exchange information needed to establish the connection, such as IP addresses and ports. In this project we are using a Node.js server with Socket.io for signaling.

It is also important to be familiar with the concepts of STUN and TURN servers and how they are used in WebRTC to ensure that the connection is successful.

You can read more about the RTCPeerConnection API and its usage on the following link:
https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection

You can read more about signaling servers and how they are used in WebRTC on the following link :
https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling

You can read more about STUN and TURN servers and how they are used in WebRTC on the following links :

https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/STUN_and_TURN_servers
https://tools.ietf.org/html/rfc5389

## Project Architecture

![Screenshot](archi.svg)

The architecture of the project can be broken down into 3 main components:

1. Client-side: This component is responsible for handling the user interface and the WebRTC functionality. It consists of the frontend code, which is written in JavaScript and uses the RTCPeerConnection API to establish a peer-to-peer connection with another client. It also uses pug as a template engine to generate the HTML pages.

2. Signaling server: This component is responsible for relaying signaling messages between clients. It is written in Node.js and uses Socket.io to handle the WebSocket connections. It also uses a database to store the information about the clients and the rooms.

3. STUN/TURN servers: These servers are used to assist with the connection establishment process. They are used to ensure that the clients are able to establish a peer-to-peer connection even if they are behind a NAT firewall. They can be either public servers or private servers that are hosted by the project itself. In this project Google STUN server and Numb TURN server are used.

The client-side and the signaling server are communicating with each other via webSocket, the signaling server is communicating with STUN/TURN servers via their APIs.

The clients connect to the signaling server, exchange information with each other through the signaling server, and use the information to establish a peer-to-peer connection.

The STUN/TURN servers are used as a fallback solution when a direct connection cannot be established.
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have Node.js and npm (Node Package Manager) installed on your system. You can download and install them from the official Node.js website: https://nodejs.org/en/

### Installation

1. Clone the repository to your local machine:

```
$ git clone https://github.com/medahalli/WebRTC.git
```
2. Navigate to the project directory:

```
$ cd WebRTC
```
3. Adding ssl to the server
```
#Create key and certificate:
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

# Create sslcert folder and move the files there:
mkdir sslcert && mv *.pem sslcert
```
4. Install the required dependencies and launch the app:
```
$ ./install.sh
```

5. Open a web browser and go to https://localhost:8081 to access the application.

## Built With

- [WebRTC](https://webrtc.org/) - Real-time communication technology
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Socket.io](https://socket.io/) - Real-time communication library
- [Pug](https://pugjs.org/) - Templating engine for Node.js

## Authors

- **Fellah Hicham**
- **Ahalli Mohamed**
- **Smaili Nabil**
- **Rajae Sefrioui**
- **Lamghari Taha**

## License

This project is licensed under the MIT License 

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
