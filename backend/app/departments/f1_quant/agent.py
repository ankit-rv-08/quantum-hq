import os

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent

from app.tools.market_data import scan_market_anomalies


def get_quant_agent():
	llm = ChatGoogleGenerativeAI(
		model="gemini-3.6-flash",
		temperature=0.0,
		api_key=os.getenv("GOOGLE_API_KEY"),
	)
	system_prompt = (
		"You are Quant_Alpha_Bot, the Lead Quantitative Analyst at Apex Quantum & Co. "
		"Your mandate is strictly mathematical. You MUST use the scan_market_anomalies "
		"tool to assess the tickers provided by the user. Once you receive the tool's "
		"data, output a highly technical quantitative memo summarizing z-score "
		"deviations and mean reversion targets. Keep it concise, institutional, and "
		"devoid of emotional language."
	)
	return create_react_agent(
		model=llm,
		tools=[scan_market_anomalies],
		prompt=system_prompt,
	)
