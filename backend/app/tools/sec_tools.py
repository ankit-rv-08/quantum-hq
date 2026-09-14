from functools import lru_cache

import requests
import yfinance as yf
from langchain_core.tools import tool


SEC_HEADERS = {
	"User-Agent": "Apex Quantum Co research@apexquantum.com",
	"Accept-Encoding": "gzip, deflate",
}
SEC_TIMEOUT_SECONDS = 15


@lru_cache(maxsize=1)
def _ticker_to_cik() -> dict[str, str]:
	response = requests.get(
		"https://www.sec.gov/files/company_tickers.json",
		headers=SEC_HEADERS,
		timeout=SEC_TIMEOUT_SECONDS,
	)
	response.raise_for_status()
	return {
		str(entry["ticker"]).upper(): str(entry["cik_str"]).zfill(10)
		for entry in response.json().values()
	}


def _sec_filing_summary(ticker: str) -> tuple[str, str]:
	try:
		cik = _ticker_to_cik().get(ticker.upper())
		if not cik:
			return "SEC EDGAR: Ticker not found", "N/A"

		submissions = requests.get(
			f"https://data.sec.gov/submissions/CIK{cik}.json",
			headers=SEC_HEADERS,
			timeout=SEC_TIMEOUT_SECONDS,
		)
		submissions.raise_for_status()
		recent = submissions.json().get("filings", {}).get("recent", {})
		filing_index = next(
			(
				index
				for index, form in enumerate(recent.get("form", []))
				if form in {"10-K", "10-Q"}
			),
			None,
		)
		if filing_index is None:
			return f"SEC EDGAR: CIK {cik} resolved", "No 10-K/10-Q found"

		form = recent["form"][filing_index]
		filed = recent["filingDate"][filing_index]
		accession = recent["accessionNumber"][filing_index]
		facts = requests.get(
			f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json",
			headers=SEC_HEADERS,
			timeout=SEC_TIMEOUT_SECONDS,
		)
		facts.raise_for_status()
		return (
			f"SEC EDGAR: CIK {cik}; company facts retrieved",
			f"{form} filed {filed} (accession {accession})",
		)
	except requests.RequestException as error:
		return f"SEC EDGAR request failed: {error}", "Unavailable"
	except (KeyError, TypeError, ValueError) as error:
		return f"SEC EDGAR response invalid: {error}", "Unavailable"


@tool
def audit_fundamental_health(ticker: str) -> str:
	"""
	Audits balance sheet health, debt ratios, free cash flow, and operating margins
	for a given ticker using SEC EDGAR filings and Yahoo Finance fundamentals.
	"""
	try:
		ticker = ticker.strip().upper()
		if not ticker:
			return "Error retrieving fundamentals: ticker is required."

		stock = yf.Ticker(ticker)
		info = stock.info

		gross_margins = info.get("grossMargins", "N/A")
		operating_margins = info.get("operatingMargins", "N/A")
		debt_to_equity = info.get("debtToEquity", "N/A")
		free_cashflow = info.get("freeCashflow", "N/A")
		revenue_growth = info.get("revenueGrowth", "N/A")
		quick_ratio = info.get("quickRatio", "N/A")
		sec_status, latest_filing = _sec_filing_summary(ticker)

		fcf_formatted = (
			f"${free_cashflow / 1e9:.2f}B"
			if isinstance(free_cashflow, (int, float))
			else "N/A"
		)
		gm_pct = (
			f"{gross_margins * 100:.1f}%"
			if isinstance(gross_margins, (int, float))
			else "N/A"
		)
		om_pct = (
			f"{operating_margins * 100:.1f}%"
			if isinstance(operating_margins, (int, float))
			else "N/A"
		)

		return (
			f"SEC AUDIT DOSSIER // {ticker}\n"
			f"- {sec_status}\n"
			f"- Latest SEC Filing: {latest_filing}\n"
			f"- Gross Margin: {gm_pct}\n"
			f"- Operating Margin: {om_pct}\n"
			f"- Debt to Equity Ratio: {debt_to_equity}\n"
			f"- Free Cash Flow: {fcf_formatted}\n"
			f"- Quarterly Revenue Growth: {revenue_growth}\n"
			f"- Quick Liquidity Ratio: {quick_ratio}\n"
		)
	except Exception as error:
		return f"Error retrieving SEC fundamentals for {ticker}: {error}"