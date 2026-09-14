import json
from datetime import datetime

from fastapi import BackgroundTasks, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Quantum HQ API")
app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


class ConnectionManager:
	def __init__(self):
		self.active_connections: list[WebSocket] = []

	async def connect(self, websocket: WebSocket):
		await websocket.accept()
		self.active_connections.append(websocket)

	def disconnect(self, websocket: WebSocket):
		if websocket in self.active_connections:
			self.active_connections.remove(websocket)

	async def broadcast(self, message: dict):
		stale_connections = []
		for connection in self.active_connections:
			try:
				await connection.send_json(message)
			except Exception:
				stale_connections.append(connection)
		for connection in stale_connections:
			self.disconnect(connection)


manager = ConnectionManager()


@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
	await manager.connect(websocket)
	await websocket.send_json(
		{
			"type": "SYSTEM_STATUS",
			"data": {"status": "LIVE", "timestamp": datetime.now().isoformat()},
		}
	)
	try:
		while True:
			message = await websocket.receive_text()
			print(f"Received from UI: {message}")
			try:
				parsed = json.loads(message)
			except json.JSONDecodeError:
				continue

			if parsed.get("type") == "VETO_COMMAND":
				await manager.broadcast(
					{
						"type": "FLOOR_EVENT",
						"floor": 4,
						"agent": "Human_Supervisor",
						"message": f"HALT ORDER INJECTED: {parsed.get('command', '')}",
						"timestamp": datetime.now().isoformat(),
					}
				)
			elif parsed.get("type") == "PING":
				await websocket.send_json({"type": "PONG"})
	except WebSocketDisconnect:
		pass
	finally:
		manager.disconnect(websocket)


@app.get("/health")
async def health_check():
	return {"status": "Quantum HQ Backend is Online", "version": "2.4.0-STABLE"}


@app.post("/api/trigger-loop")
async def trigger_full_firm_loop(background_tasks: BackgroundTasks):
	async def run_pipeline():
		events = [
			(0, "Chief_of_Staff", "Autonomous cron trigger: waking up Floor 1 for pre-market scan."),
			(1, "Quant_Alpha_Bot", "Scan complete: AAPL z-score anomalous at +2.01. Handing off to SEC Auditor."),
			(2, "SEC_Auditor_Kratos", "SEC EDGAR CIK 0000320193 retrieved: Gross Margin 48.7%, FCF $107.72B. Fundamentals GREEN."),
			(3, "CRO_Sentinel", "RISK BREACH: Proposed $12M allocation pushes AAPL exposure to 17.0% (Ceiling: 15.0%)."),
			(4, "CIO_Agent_Alpha", "Quorum adjourned: Committee rejects capital deployment. Resolution archived."),
		]
		for floor, agent, message in events:
			await manager.broadcast(
				{
					"type": "FLOOR_EVENT",
					"floor": floor,
					"agent": agent,
					"message": message,
					"timestamp": datetime.now().isoformat(),
				}
			)

	background_tasks.add_task(run_pipeline)
	return {"status": "Firm loop dispatched to WebSocket"}