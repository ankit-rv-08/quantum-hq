import pandas as pd
import yfinance as yf
from langchain_core.tools import tool


@tool
def scan_market_anomalies(tickers: list[str]) -> str:
	"""
	Scans recent market data for a list of tickers to find price anomalies.
	Calculates 30-day z-scores and flags any deviations > 2.0.
	"""
	anomalies = []
	for ticker in tickers:
		try:
			prices = yf.download(ticker, period="1mo", progress=False)["Close"]
			if isinstance(prices, pd.DataFrame):
				prices = prices.squeeze("columns")
			if prices.empty:
				continue

			mean_price = prices.mean()
			std_price = prices.std()
			if std_price <= 0:
				continue

			current_price = prices.iloc[-1]
			z_score = (current_price - mean_price) / std_price
			if abs(z_score) > 2.0:
				anomalies.append(
					f"[{ticker}] Z-Score: {z_score:.2f} (Price: ${current_price:.2f})"
				)
		except Exception:
			continue

	if not anomalies:
		return "No statistical anomalies detected beyond 2 standard deviations."

	return "QUANT ANOMALIES DETECTED:\n" + "\n".join(anomalies)
