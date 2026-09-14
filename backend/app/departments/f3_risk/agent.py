import os

from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent


@tool
def calculate_portfolio_exposure(
	ticker: str, proposed_allocation_usd: float
) -> str:
	"""Simulates adding a position and checks the 15% maximum exposure rule."""
	current_aum = 100_000_000
	current_ticker_exposure = 5_000_000
	new_total = current_ticker_exposure + proposed_allocation_usd
	exposure_pct = (new_total / current_aum) * 100

	if exposure_pct > 15.0:
		return (
			f"RISK BREACH: Proposed allocation brings {ticker} exposure to "
			f"{exposure_pct:.1f}%. Firm ceiling is 15.0%."
		)
	return (
		f"RISK CLEARED: Proposed allocation brings {ticker} exposure to "
		f"{exposure_pct:.1f}%. Well under 15.0% ceiling."
	)


def get_risk_agent():
	llm = ChatGoogleGenerativeAI(
		model="gemini-3.6-flash",
		temperature=0.0,
		api_key=os.getenv("GOOGLE_API_KEY"),
	)
	system_prompt = (
		"You are CRO_Sentinel, the Chief Risk Officer on Floor 3. You receive "
		"fundamental audit dossiers from Floor 2. Your ONLY job is to use the "
		"calculate_portfolio_exposure tool to ensure the proposed trade size does "
		"not breach firm risk parameters. Output a definitive RISK VERDICT "
		"(Approved or Rejected) to pass to the Executive Board."
	)
	return create_react_agent(
		model=llm,
		tools=[calculate_portfolio_exposure],
		prompt=system_prompt,
	)