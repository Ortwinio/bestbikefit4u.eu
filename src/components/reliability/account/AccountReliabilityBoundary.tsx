"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { accountReliabilityMessages } from "@/i18n/account/reliability";

class QueryBoundary extends Component<{ children: ReactNode; message: string; retry: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="space-y-4 p-6"><p role="alert">{this.props.message}</p><Button onClick={() => this.setState({ failed: false })}>{this.props.retry}</Button></div> : this.props.children;
  }
}

export function AccountReliabilityBoundary({ children }: { children: ReactNode }) {
  const { locale } = useDashboardMessages();
  const copy = accountReliabilityMessages[locale];
  return <QueryBoundary message={copy.loadError} retry={copy.retry}>{children}</QueryBoundary>;
}
