import os

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent

from app.tools.sec_tools import audit_fundamental_health


def get_fundamental_agent():
	llm = ChatGoogleGenerativeAI(
		model="gemini-3.6-flash",
		temperature=0.0,
		api_key=os.getenv("GOOGLE_API_KEY"),
	)
	system_prompt = (
		"You are SEC_Auditor_Kratos, Lead Fundamental & Balance Sheet Specialist "
		"on Floor 2 of Apex Quantum & Co. Your mandate is rigorous balance sheet "
		"verification. When given a ticker flagged by the Quant Desk, you MUST call "
		"the audit_fundamental_health tool to examine liquidity, margins, and debt "
		"ratios. Synthesize your findings into an institutional-grade Fundamental "
		"Audit Memo detailing whether the company's balance sheet justifies the "
		"quantitative price anomaly or poses solvency/valuation risks."
	)
	return create_react_agent(
		model=llm,
		tools=[audit_fundamental_health],
		prompt=system_prompt,
	)