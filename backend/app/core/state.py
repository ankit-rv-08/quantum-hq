from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class FirmState(TypedDict):
	# add_messages ensures we append to the transcript, not overwrite it
	messages: Annotated[list[BaseMessage], add_messages]
	active_tickers: list[str]
	quant_signals: str
	risk_clearance: bool
	final_resolution: str
