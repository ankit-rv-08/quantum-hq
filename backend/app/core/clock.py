from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler


def morning_quant_scan():
	print(
		f"\n[{datetime.now().strftime('%H:%M:%S')}] CHIEF OF STAFF: "
		"Initiating Morning Check-In."
	)
	print("Waking up Floor 1 (Quant Desk) for pre-market anomaly scanning...")


def midday_risk_audit():
	print(
		f"\n[{datetime.now().strftime('%H:%M:%S')}] CHIEF OF STAFF: "
		"Midday Exposure Check."
	)
	print("Waking up Floor 2 & 3 to parse ongoing SEC filings and VaR limits...")


def end_of_day_boardroom():
	print(
		f"\n[{datetime.now().strftime('%H:%M:%S')}] CHIEF OF STAFF: "
		"End of Day Close."
	)
	print("Convening Floor 4 (Executive Boardroom) for daily capital allocation vote...")


def build_scheduler():
	scheduler = BlockingScheduler()
	scheduler.add_job(
		morning_quant_scan,
		"cron",
		day_of_week="mon-fri",
		hour=7,
		minute=30,
		id="morning_quant_scan",
	)
	scheduler.add_job(
		midday_risk_audit,
		"cron",
		day_of_week="mon-fri",
		hour=12,
		minute=0,
		id="midday_risk_audit",
	)
	scheduler.add_job(
		end_of_day_boardroom,
		"cron",
		day_of_week="mon-fri",
		hour=16,
		minute=0,
		id="end_of_day_boardroom",
	)
	# Short interval keeps local development visibly active.
	scheduler.add_job(
		morning_quant_scan,
		"interval",
		seconds=10,
		id="development_heartbeat",
	)
	return scheduler


def start_firm_clock():
	print("Quantum HQ Autonomous Clock Started. Chief of Staff is monitoring shifts...")
	scheduler = build_scheduler()
	try:
		scheduler.start()
	except KeyboardInterrupt:
		print("\nFirm Clock Stopped.")


if __name__ == "__main__":
	start_firm_clock()