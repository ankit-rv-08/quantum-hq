import os

from dotenv import load_dotenv

load_dotenv()

from app.departments.f1_quant.agent import get_quant_agent


def run_floor_1():
	print("Waking up Floor 1: Quantitative Research Desk...\n")
	agent = get_quant_agent()
	inputs = {
		"messages": [
			("user", "Initiate pre-market scan for NVDA, AAPL, MSFT, and TSLA.")
		]
	}

	print("[LIVE TELEMETRY STREAM]")
	print("--------------------------------------------------")
	for event in agent.stream(inputs, stream_mode="values"):
		message = event["messages"][-1]
		message.pretty_print()


if __name__ == "__main__":
	if not os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_API_KEY") == "your_sk_key_here":
		print("SECURITY HALT: Valid GOOGLE_API_KEY not found in .env")
	else:
		run_floor_1()
