import os

from dotenv import load_dotenv

load_dotenv()

from app.departments.f2_fundamental.agent import get_fundamental_agent


def run_floor_2():
	print("Waking up Floor 2: Fundamental & Macro Desk (Auditor Kratos)...\n")
	agent = get_fundamental_agent()
	handoff_prompt = (
		"Floor 1 Quant Desk flagged AAPL with a +2.01 z-score statistical anomaly. "
		"Perform an audit on AAPL balance sheet fundamentals and report on solvency, "
		"cash flow, and margin durability."
	)
	inputs = {"messages": [("user", handoff_prompt)]}

	print("[LIVE TELEMETRY STREAM // FLOOR 2]")
	print("--------------------------------------------------")
	for event in agent.stream(inputs, stream_mode="values"):
		message = event["messages"][-1]
		message.pretty_print()


if __name__ == "__main__":
	if not os.getenv("GOOGLE_API_KEY"):
		print("SECURITY HALT: GOOGLE_API_KEY not found in .env")
	else:
		run_floor_2()