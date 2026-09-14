import os
import re
from datetime import datetime
from pathlib import Path

from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent


REPORTS_DIR = Path(__file__).resolve().parents[3] / "firm_reports"


@tool
def publish_executive_resolution(
	ticker: str, decision: str, rationale: str
) -> str:
	"""Save the final board decision as a Markdown report for firm records."""
	REPORTS_DIR.mkdir(parents=True, exist_ok=True)
	safe_ticker = re.sub(r"[^A-Za-z0-9_-]", "", ticker.upper()) or "UNKNOWN"
	timestamp = datetime.now()
	filename = REPORTS_DIR / (
		f"RESOLUTION_{safe_ticker}_{timestamp.strftime('%Y%m%d_%H%M')}.md"
	)
	content = (
		"# APEX QUANTUM & CO. | EXECUTIVE BOARD RESOLUTION\n"
		f"**Date:** {timestamp.strftime('%Y-%m-%d %H:%M')}\n"
		f"**Target Asset:** {safe_ticker}\n"
		f"**Committee Decision:** {decision.upper()}\n\n"
		f"## Strategic Rationale & Departmental Synthesis\n{rationale}\n\n"
		"---\n*Report generated autonomously by Floor 4 CIO Agent.*"
	)
	filename.write_text(content, encoding="utf-8")
	return f"SUCCESS: Official Board Resolution archived locally as {filename}."


def get_boardroom_agent():
	llm = ChatGoogleGenerativeAI(
		model="gemini-3.6-flash",
		temperature=0.0,
		api_key=os.getenv("GOOGLE_API_KEY"),
	)
	system_prompt = (
		"You are CIO_Agent_Alpha, presiding over the Executive Boardroom (Floor 4). "
		"You will receive a summarized dossier containing Quant signals (Floor 1), "
		"Fundamental SEC Audits (Floor 2), and Risk Checks (Floor 3). Review all "
		"inputs. If Risk and Fundamentals are GREEN, approve the trade. If any are "
		"RED or contain a RISK BREACH, reject it. You MUST use the "
		"publish_executive_resolution tool to formalize your decision into an official "
		"report. Do not end your turn until the tool is called."
	)
	return create_react_agent(
		model=llm,
		tools=[publish_executive_resolution],
		prompt=system_prompt,
	)