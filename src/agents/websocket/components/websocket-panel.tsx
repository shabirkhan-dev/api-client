"use client";

import { Download, Send, Trash2, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, Input, LabelText, StatusDot, Textarea } from "@/shared/components/ui";

interface WsMessage {
	id: string;
	direction: "sent" | "received";
	data: string;
	timestamp: number;
}

export function WebSocketPanel() {
	const [url, setUrl] = useState("wss://echo.websocket.events");
	const [connected, setConnected] = useState(false);
	const [message, setMessage] = useState('{"type":"ping"}');
	const [messages, setMessages] = useState<WsMessage[]>([]);
	const [format, setFormat] = useState<"json" | "text" | "binary">("json");
	const [latency, setLatency] = useState<number | null>(null);
	const [sentCount, setSentCount] = useState(0);
	const [receivedCount, setReceivedCount] = useState(0);
	const socketRef = useRef<WebSocket | null>(null);
	const logRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (logRef.current) {
			logRef.current.scrollTop = logRef.current.scrollHeight;
		}
	}, []);

	const connect = useCallback(() => {
		if (!url.trim()) {
			toast.error("WebSocket URL is required");
			return;
		}
		try {
			const ws = new WebSocket(url);
			ws.onopen = () => {
				setConnected(true);
				toast.success("Connected");
			};
			ws.onmessage = (event) => {
				setReceivedCount((c) => c + 1);
				setMessages((prev) => [
					...prev,
					{
						id: `msg-${Date.now()}-${Math.random()}`,
						direction: "received",
						data: typeof event.data === "string" ? event.data : "[Binary]",
						timestamp: Date.now(),
					},
				]);
			};
			ws.onclose = () => {
				setConnected(false);
				toast.info("Disconnected");
			};
			ws.onerror = () => {
				toast.error("Connection error");
			};
			socketRef.current = ws;
		} catch (_err) {
			toast.error("Failed to connect");
		}
	}, [url]);

	const disconnect = useCallback(() => {
		socketRef.current?.close();
		socketRef.current = null;
		setConnected(false);
	}, []);

	const sendMessage = useCallback(() => {
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			toast.error("Not connected");
			return;
		}
		const pingStart = performance.now();
		socketRef.current.send(message);
		setSentCount((c) => c + 1);
		setMessages((prev) => [
			...prev,
			{
				id: `msg-${Date.now()}-${Math.random()}`,
				direction: "sent",
				data: message,
				timestamp: Date.now(),
			},
		]);
		setLatency(Math.round(performance.now() - pingStart));
	}, [message]);

	const clearMessages = useCallback(() => setMessages([]), []);

	const exportMessages = useCallback(() => {
		const content = messages.map((m) => `[${m.direction}] ${m.data}`).join("\n");
		const blob = new Blob([content], { type: "text/plain" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "websocket-log.txt";
		a.click();
	}, [messages]);

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-hidden">
			<GlassPanel className="p-4 space-y-3">
				<LabelText>Connection</LabelText>
				<div className="flex items-center gap-3 flex-wrap">
					<Input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="wss://echo.websocket.events"
						className="flex-1 font-mono text-xs"
					/>
					<Button variant="primary" size="sm" onClick={connected ? disconnect : connect}>
						{connected ? <WifiOff size={14} /> : <Wifi size={14} />}
						{connected ? "Disconnect" : "Connect"}
					</Button>
					<StatusDot color={connected ? "green" : "muted"} />
					<span className="text-xs text-ctp-overlay0">
						{connected ? "Connected" : "Disconnected"}
					</span>
				</div>
				<div className="text-xs text-ctp-overlay0 flex items-center gap-4">
					<span>Latency: {latency !== null ? `${latency}ms` : "-"}</span>
					<span>Sent: {sentCount}</span>
					<span>Received: {receivedCount}</span>
				</div>
			</GlassPanel>

			<div className="flex gap-4 flex-1 overflow-hidden min-h-0">
				<GlassPanel className="p-4 flex-1 flex flex-col">
					<div className="flex items-center justify-between mb-2">
						<LabelText>Message Log</LabelText>
						<div className="flex gap-1">
							<Button variant="kbd" size="sm" onClick={clearMessages}>
								<Trash2 size={12} />
							</Button>
							<Button variant="kbd" size="sm" onClick={exportMessages}>
								<Download size={12} />
							</Button>
						</div>
					</div>
					<div ref={logRef} className="flex-1 overflow-y-auto space-y-1 pr-1">
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`text-xs font-mono p-2 rounded-lg ${
									msg.direction === "sent"
										? "bg-ctp-blue/10 text-ctp-blue border-l-2 border-ctp-blue"
										: "bg-ctp-green/10 text-ctp-green border-l-2 border-ctp-green"
								}`}
							>
								<div className="flex items-center justify-between mb-1">
									<span className="text-[10px] uppercase font-semibold">{msg.direction}</span>
									<span className="text-[10px] text-ctp-overlay0">
										{new Date(msg.timestamp).toLocaleTimeString()}
									</span>
								</div>
								<pre className="whitespace-pre-wrap break-all">{msg.data}</pre>
							</div>
						))}
						{messages.length === 0 && (
							<div className="text-xs text-ctp-overlay0 text-center py-8">No messages yet</div>
						)}
					</div>
				</GlassPanel>

				<GlassPanel className="p-4 w-1/3 flex flex-col gap-3">
					<LabelText>Compose Message</LabelText>
					<select
						value={format}
						onChange={(e) => setFormat(e.target.value as "json" | "text" | "binary")}
						className="bg-transparent border border-ctp-border rounded-lg px-3 py-1.5 text-xs text-ctp-text outline-none"
					>
						<option value="json" className="bg-ctp-base">
							JSON
						</option>
						<option value="text" className="bg-ctp-base">
							Text
						</option>
						<option value="binary" className="bg-ctp-base">
							Binary (Base64)
						</option>
					</select>
					<Textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder='{"type":"ping"}'
						className="flex-1 text-xs"
					/>
					<Button variant="primary" size="sm" onClick={sendMessage} disabled={!connected}>
						<Send size={14} />
						Send
					</Button>
				</GlassPanel>
			</div>
		</div>
	);
}
