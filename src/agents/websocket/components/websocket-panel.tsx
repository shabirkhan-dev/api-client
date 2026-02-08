"use client";

import {
	Delete02Icon,
	Download01Icon,
	SentIcon,
	Wifi01Icon,
	WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
	const [sentCount, setSentCount] = useState(0);
	const [receivedCount, setReceivedCount] = useState(0);
	const socketRef = useRef<WebSocket | null>(null);
	const logRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
	}, []);

	const connect = useCallback(() => {
		if (!url.trim()) return toast.error("URL required");
		try {
			const ws = new WebSocket(url);
			ws.onopen = () => {
				setConnected(true);
				toast.success("Connected");
			};
			ws.onmessage = (e) => {
				setReceivedCount((c) => c + 1);
				setMessages((prev) => [
					...prev,
					{
						id: `m-${Date.now()}-${Math.random()}`,
						direction: "received",
						data: typeof e.data === "string" ? e.data : "[Binary]",
						timestamp: Date.now(),
					},
				]);
			};
			ws.onclose = () => {
				setConnected(false);
				toast.info("Disconnected");
			};
			ws.onerror = () => toast.error("Connection error");
			socketRef.current = ws;
		} catch {
			toast.error("Failed to connect");
		}
	}, [url]);

	const disconnect = useCallback(() => {
		socketRef.current?.close();
		socketRef.current = null;
		setConnected(false);
	}, []);

	const sendMessage = useCallback(() => {
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
			return toast.error("Not connected");
		socketRef.current.send(message);
		setSentCount((c) => c + 1);
		setMessages((prev) => [
			...prev,
			{
				id: `m-${Date.now()}-${Math.random()}`,
				direction: "sent",
				data: message,
				timestamp: Date.now(),
			},
		]);
	}, [message]);

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-hidden">
			<GlassPanel className="p-4 space-y-2">
				<div className="flex items-center gap-2 flex-wrap">
					<Input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="wss://echo.websocket.events"
						className="flex-1 font-mono text-[11px]"
					/>
					<Button variant="primary" size="sm" onClick={connected ? disconnect : connect}>
						<HugeiconsIcon icon={connected ? WifiDisconnected01Icon : Wifi01Icon} size={13} />
						{connected ? "Disconnect" : "Connect"}
					</Button>
					<StatusDot color={connected ? "green" : "muted"} />
				</div>
				<div className="flex items-center gap-4 text-[10px] text-ctp-overlay0">
					<span>
						Sent: <span className="text-ctp-blue font-mono">{sentCount}</span>
					</span>
					<span>
						Received: <span className="text-ctp-green font-mono">{receivedCount}</span>
					</span>
				</div>
			</GlassPanel>
			<div className="flex gap-3 flex-1 overflow-hidden min-h-0">
				<GlassPanel className="p-4 flex-1 flex flex-col">
					<div className="flex items-center justify-between mb-2">
						<LabelText>Messages</LabelText>
						<div className="flex gap-1">
							<Button variant="subtle" size="xs" onClick={() => setMessages([])}>
								<HugeiconsIcon icon={Delete02Icon} size={10} />
							</Button>
							<Button
								variant="subtle"
								size="xs"
								onClick={() => {
									const content = messages.map((m) => `[${m.direction}] ${m.data}`).join("\n");
									const a = document.createElement("a");
									a.href = URL.createObjectURL(new Blob([content]));
									a.download = "ws-log.txt";
									a.click();
								}}
							>
								<HugeiconsIcon icon={Download01Icon} size={10} />
							</Button>
						</div>
					</div>
					<div ref={logRef} className="flex-1 overflow-y-auto space-y-1 pr-0.5">
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`text-[10px] font-mono p-2 rounded-lg border-l-2 ${msg.direction === "sent" ? "bg-ctp-blue/10 border-ctp-blue/40 text-ctp-blue" : "bg-ctp-green/10 border-ctp-green/40 text-ctp-green"}`}
							>
								<div className="flex justify-between mb-0.5 text-[9px] opacity-60">
									<span className="uppercase font-semibold">{msg.direction}</span>
									<span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
								</div>
								<pre className="whitespace-pre-wrap break-all">{msg.data}</pre>
							</div>
						))}
						{messages.length === 0 && (
							<div className="text-[10px] text-ctp-overlay0 text-center py-6">No messages</div>
						)}
					</div>
				</GlassPanel>
				<GlassPanel className="p-4 w-1/3 flex flex-col gap-2">
					<LabelText>Compose</LabelText>
					<Textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder='{"type":"ping"}'
						className="flex-1 text-[11px]"
					/>
					<Button variant="primary" size="sm" onClick={sendMessage} disabled={!connected}>
						<HugeiconsIcon icon={SentIcon} size={13} /> Send
					</Button>
				</GlassPanel>
			</div>
		</div>
	);
}
