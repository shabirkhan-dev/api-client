"use client";

import { Play, Search } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button, GlassPanel, Input, LabelText, Textarea } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

type GraphqlTab = "query" | "mutation" | "subscription" | "variables";

export function GraphQLPanel() {
	const [url, setUrl] = useState("");
	const [activeTab, setActiveTab] = useState<GraphqlTab>("query");
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
		if (!url.trim()) {
			toast.error("GraphQL URL required");
			return;
		}
		const gqlQuery = getActiveQuery();
		let vars = {};
		if (variables.trim()) {
			try {
				vars = JSON.parse(variables);
			} catch {
				toast.error("Variables must be valid JSON");
				return;
			}
		}
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: gqlQuery, variables: vars }),
			});
			const data = await res.json();
			setResponse(JSON.stringify(data, null, 2));
			toast.success("Query executed");
		} catch (err) {
			toast.error(`GraphQL request failed: ${err instanceof Error ? err.message : "Unknown"}`);
		}
	}, [url, getActiveQuery, variables]);

	const introspect = useCallback(async () => {
		if (!url.trim()) {
			toast.error("GraphQL URL required");
			return;
		}
		const introspectionQuery =
			"query IntrospectionQuery { __schema { types { name kind fields { name } } } }";
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query: introspectionQuery }),
			});
			const data = await res.json();
			const types = data.data?.__schema?.types || [];
			setSchema(
				types.map((t: { name: string; kind: string }) => `${t.name} (${t.kind})`).join("\n"),
			);
			toast.success("Schema introspected");
		} catch {
			toast.error("Schema introspection failed");
		}
	}, [url]);

	const tabs: { id: GraphqlTab; label: string }[] = [
		{ id: "query", label: "Query" },
		{ id: "mutation", label: "Mutation" },
		{ id: "subscription", label: "Subscription" },
		{ id: "variables", label: "Variables" },
	];

	return (
		<div className="flex-1 flex flex-col gap-4 overflow-auto">
			<GlassPanel className="p-4 flex items-center justify-between flex-wrap gap-3">
				<div>
					<div className="text-sm font-semibold">GraphQL Support</div>
					<div className="text-xs text-ctp-overlay0">Schema introspection, variables, and tabs</div>
				</div>
				<div className="flex items-center gap-2">
					<Input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://api.example.com/graphql"
						className="w-64 font-mono text-xs"
					/>
					<Button variant="kbd" size="sm" onClick={introspect}>
						<Search size={12} />
						Introspect
					</Button>
					<Button variant="primary" size="sm" onClick={runQuery}>
						<Play size={14} />
						Run
					</Button>
				</div>
			</GlassPanel>

			<GlassPanel className="p-4">
				<div className="flex items-center gap-1 border-b border-ctp-surface0 pb-1 mb-3">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"px-3 py-1.5 text-xs font-medium transition-all border-b-2",
								activeTab === tab.id
									? "text-ctp-lavender border-ctp-lavender bg-ctp-lavender/5"
									: "text-ctp-overlay0 border-transparent hover:text-ctp-text",
							)}
						>
							{tab.label}
						</button>
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div>
						{activeTab === "query" && (
							<Textarea
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="query { viewer { id name } }"
								className="h-64 text-xs"
							/>
						)}
						{activeTab === "mutation" && (
							<Textarea
								value={mutation}
								onChange={(e) => setMutation(e.target.value)}
								placeholder="mutation { updateUser(id: 1) { id } }"
								className="h-64 text-xs"
							/>
						)}
						{activeTab === "subscription" && (
							<Textarea
								value={subscription}
								onChange={(e) => setSubscription(e.target.value)}
								placeholder="subscription { onMessage { id text } }"
								className="h-64 text-xs"
							/>
						)}
						{activeTab === "variables" && (
							<Textarea
								value={variables}
								onChange={(e) => setVariables(e.target.value)}
								placeholder='{"id": 1}'
								className="h-64 text-xs"
							/>
						)}
					</div>
					<div className="bg-ctp-crust/40 rounded-xl p-3 h-64 overflow-auto">
						<LabelText>Schema Preview</LabelText>
						<pre className="text-xs font-mono mt-2 text-ctp-subtext0">
							{schema || "Introspect a schema to see types here"}
						</pre>
					</div>
				</div>
			</GlassPanel>

			<GlassPanel className="p-4">
				<LabelText>Response</LabelText>
				<pre className="text-xs font-mono mt-2 max-h-64 overflow-auto text-ctp-text">
					{response || "// Response will appear here"}
				</pre>
			</GlassPanel>
		</div>
	);
}
