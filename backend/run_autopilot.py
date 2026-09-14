import os
from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler
from dotenv import load_dotenv

load_dotenv()

from app.departments.f1_quant.agent import get_quant_agent
from app.departments.f2_fundamental.agent import get_fundamental_agent
from app.departments.f3_risk.agent import get_risk_agent
from app.departments.f4_boardroom.agent import get_boardroom_agent


def _final_message_content(result):
	return result["messages"][-1].content


def execute_firm_workflow():
	print(
		f"\n[{datetime.now().strftime('%H:%M:%S')}] CHIEF OF STAFF: "
		"Initiating Firm-Wide Autonomous Loop..."
	)

	print("\n[FLOOR 1] Quant Desk scanning markets...")
	f1_result = get_quant_agent().invoke(
		{"messages": [("user", "Run daily scan on AAPL.")]}
	)
	f1_output = _final_message_content(f1_result)
	print("Quant output captured.")

	print("\n[FLOOR 2] SEC Auditor checking balance sheet...")
	f2_result = get_fundamental_agent().invoke(
		{
			"messages": [
				(
					"user",
					f"Analyze this AAPL quant signal and audit AAPL fundamentals: {f1_output}",
				)
			]
		}
	)
	f2_output = _final_message_content(f2_result)
	print("SEC audit captured.")

	print("\n[FLOOR 3] CRO Sentinel verifying exposure limits...")
	f3_result = get_risk_agent().invoke(
		{
			"messages": [
				(
					"user",
					f"Verify risk for this AAPL fundamental setup: {f2_output}. "
					"Propose a $12,000,000 allocation.",
				)
			]
		}
	)
	f3_output = _final_message_content(f3_result)
	print("Risk verdict captured.")

	print("\n[FLOOR 4] Executive Boardroom convening for final vote...")
	board_prompt = (
		"Synthesize and formally publish the resolution for AAPL based on this data:\n"
		f"Quant: {f1_output}\nFundamentals: {f2_output}\nRisk: {f3_output}"
	)
	get_boardroom_agent().invoke({"messages": [("user", board_prompt)]})
	print(
		f"\n[{datetime.now().strftime('%H:%M:%S')}] FIRM LOOP COMPLETE. "
		"Official report saved to backend/firm_reports/."
	)


def start_autopilot():
	print("Starting Apex Quantum Autopilot...")
	scheduler = BlockingScheduler()
	execute_firm_workflow()
	scheduler.add_job(
		execute_firm_workflow,
		"cron",
		day_of_week="mon-fri",
		hour=16,
		minute=0,
		id="daily_firm_close",
	)
	scheduler.add_job(execute_firm_workflow, "interval", minutes=2, id="development_loop")
	try:
		scheduler.start()
	except KeyboardInterrupt:
		print("\nAutopilot offline.")


if __name__ == "__main__":
	if not os.getenv("GOOGLE_API_KEY"):
		print("SECURITY HALT: GOOGLE_API_KEY not found in .env")
	else:
		start_autopilot()