"use client";

import { PlayIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, Input, LabelText, Textarea } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

type GqlTab = "query" | "mutation" | "subscription" | "variables";

export function GraphQLPanel() {
	const [url, setUrl] = useState("");
	const [activeTab, setActiveTab] = useState<GqlTab>("query");
	const [query, setQuery] = useState("");
	const [mutation, setMutation] = useState("");
	const [subscription, setSubscription] = useState("");
	const [variables, setVariables] = useState("");
	const [response, setResponse] = useState("");
	const [schema, setSchema] = useState("");

	const getActiveQuery = useCallback(() => {
		switch (activeTab) {
			case "mutation":
				return mutation;
			case "subscription":
				return subscription;
			default:
				return query;
		}
	}, [activeTab, query, mutation, subscription]);

	const runQuery = useCallback(async () => {
		if (!url.trim()) return toast.error("GraphQL URL required");
		let vars = {};
		if (variables.trim()) {
			try {
				vars = JSON.parse(variables);
			} catch {
				return toast.error("Variables must be valid JSON");
			}
		}
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: getActiveQuery(), variables: vars }),
			});
			const data = await res.json();
			setResponse(JSON.stringify(data, null, 2));
			toast.success("Query executed");
		} catch (err) {
			toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown"}`);
		}
	}, [url, getActiveQuery, variables]);

	const introspect = useCallback(async () => {
		if (!url.trim()) return toast.error("URL required");
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query: "query { __schema { types { name kind fields { name } } } }",
				}),
			});
			const data = await res.json();
			const types = data.data?.__schema?.types || [];
			setSchema(
				types.map((t: { name: string; kind: string }) => `${t.name} (${t.kind})`).join("\n"),
			);
			toast.success("Schema introspected");
		} catch {
			toast.error("Introspection failed");
		}
	}, [url]);

	const tabs: { id: GqlTab; label: string }[] = [
		{ id: "query", label: "Query" },
		{ id: "mutation", label: "Mutation" },
		{ id: "subscription", label: "Subscription" },
		{ id: "variables", label: "Variables" },
	];

	return (
		<div className="flex-1 flex flex-col gap-3 overflow-auto">
			<GlassPanel className="p-4 flex items-center gap-2 flex-wrap">
				<Input
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://api.example.com/graphql"
					className="flex-1 font-mono text-[11px]"
				/>
				<Button variant="outline" size="sm" onClick={introspect}>
					<HugeiconsIcon icon={Search01Icon} size={12} /> Introspect
				</Button>
				<Button variant="primary" size="sm" onClick={runQuery}>
					<HugeiconsIcon icon={PlayIcon} size={13} /> Run
				</Button>
			</GlassPanel>
			<GlassPanel className="p-4">
				<div className="flex items-center gap-1 border-b border-ctp-surface1/20 pb-2 mb-3">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all",
								activeTab === tab.id
									? "text-ctp-text bg-ctp-surface0/60"
									: "text-ctp-overlay0 hover:text-ctp-subtext1 hover:bg-ctp-surface0/25",
							)}
						>
							{tab.label}
						</button>
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
					<div>
						{activeTab === "query" && (
							<Textarea
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="query { viewer { id name } }"
								className="h-56 text-[11px]"
							/>
						)}
						{activeTab === "mutation" && (
							<Textarea
								value={mutation}
								onChange={(e) => setMutation(e.target.value)}
								placeholder="mutation { updateUser(id: 1) { id } }"
								className="h-56 text-[11px]"
							/>
						)}
						{activeTab === "subscription" && (
							<Textarea
								value={subscription}
								onChange={(e) => setSubscription(e.target.value)}
								placeholder="subscription { onMessage { id text } }"
								className="h-56 text-[11px]"
							/>
						)}
						{activeTab === "variables" && (
							<Textarea
								value={variables}
								onChange={(e) => setVariables(e.target.value)}
								placeholder='{"id": 1}'
								className="h-56 text-[11px]"
							/>
						)}
					</div>
					<div className="bg-ctp-mantle/40 rounded-lg p-2.5 h-56 overflow-auto">
						<LabelText>Schema</LabelText>
						<pre className="text-[10px] font-mono mt-1.5 text-ctp-overlay1">
							{schema || "Introspect to view"}
						</pre>
					</div>
				</div>
			</GlassPanel>
			<GlassPanel className="p-4">
				<LabelText>Response</LabelText>
				<pre className="text-[10px] font-mono mt-1.5 max-h-52 overflow-auto text-ctp-subtext1">
					{response || "// Run a query"}
				</pre>
			</GlassPanel>
		</div>
	);
}
