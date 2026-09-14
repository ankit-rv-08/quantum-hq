import os

from dotenv import load_dotenv

load_dotenv()

from app.departments.f3_risk.agent import get_risk_agent


def run_floor_3():
	print("Waking up Floor 3: Risk & Compliance (CRO Sentinel)...\n")
	agent = get_risk_agent()
	handoff_prompt = (
		"Floor 2 verified AAPL balance sheet is GREEN. The Quant Desk proposes a "
		"$12,000,000 allocation into AAPL. Verify portfolio exposure."
	)
	inputs = {"messages": [("user", handoff_prompt)]}

	print("[LIVE TELEMETRY STREAM // FLOOR 3]")
	print("--------------------------------------------------")
	for event in agent.stream(inputs, stream_mode="values"):
		message = event["messages"][-1]
		message.pretty_print()


if __name__ == "__main__":
	if not os.getenv("GOOGLE_API_KEY"):
		print("SECURITY HALT: GOOGLE_API_KEY not found in .env")
	else:
		run_floor_3()