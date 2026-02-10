Problem Statement

Build a scalable real-time fleet & delivery management system that enables administrators to monitor delivery vehicles live on a map, assign orders to drivers, and track delivery progress using WebSockets for real-time updates and a map-based UI.
The system should be designed to handle high concurrency, frequent location updates, and horizontal scaling.

👥 Actors (Users)
Actor	Description
Admin	Manages orders, views live vehicle locations, monitors system
Driver	Logs in, receives assigned orders, sends live GPS location
System	Matches drivers to orders, broadcasts real-time updates
⚙️ Functional Requirements
Admin

Login securely

View live locations of all active drivers on a map

Create and assign orders to drivers

Track order status (Created → Assigned → In Transit → Delivered)

Driver

Login securely

Receive assigned orders in real time

Send live GPS coordinates periodically

View current delivery route

System

Push real-time vehicle location updates

Handle driver disconnections gracefully

Support multiple admins viewing data simultaneously

🧱 Non-Functional Requirements (Very Important)
Category	Requirement
Scalability	Support thousands of concurrent drivers
Latency	Location updates < 200 ms
Availability	99.9% uptime
Security	JWT-based authentication, role-based access
Performance	High-frequency writes without DB overload
Observability	Logs, metrics, and health checks
Fault Tolerance	Automatic recovery from service crashes
✅ 2. HLD (HIGH-LEVEL DESIGN)
🧠 High-Level Architecture (Textual Diagram)
 Admin / Driver (React App)
          |
          | REST + WebSocket
          |
       NGINX (API Gateway)
          |
  --------------------------------
  | Auth Service (REST)           |
  | Order Service (REST)          |
  | Tracking Service (WebSocket)  |
  --------------------------------
          |
     Redis (Cache + Pub/Sub)
          |
     MongoDB (Persistent Storage)

🧩 Services & Responsibilities
Auth Service

User authentication

JWT token generation

Role validation (Admin / Driver)

Order Service

Create orders

Assign drivers

Maintain order lifecycle

Tracking Service

WebSocket server

Receive driver GPS updates

Broadcast live location to admins

🗄️ Data Stores
MongoDB

Users

Orders

Vehicles

Delivery history

Redis

Active drivers

Live locations (temporary)

Pub/Sub for WebSocket scaling

🔄 Communication Flow
REST

Login

Order creation

Order assignment

WebSocket

Driver → Server: Location updates

Server → Admin: Live vehicle locations

📈 Scalability Design Decisions

Services are stateless

WebSocket instances scaled horizontally

Redis used for fan-out messaging

No sticky sessions required