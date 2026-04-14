/* @vitest-environment jsdom */

import type { ReactElement, ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../../../convex/_generated/api";
import { GuideCreateView } from "./GuideCreateView";

const { pushMock, refreshMock, createGuideMock, submitGuideForReviewMock, successMock, useQueryMock, useMutationMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    refreshMock: vi.fn(),
    createGuideMock: vi.fn(),
    submitGuideForReviewMock: vi.fn(),
    successMock: vi.fn(),
    useQueryMock: vi.fn(),
    useMutationMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

vi.mock("@/components/ui", () => {
  const React = require("react");

  return {
    Button: ({
      children,
      onClick,
      render,
      isLoading: _isLoading,
      ...props
    }: {
      children?: ReactNode;
      onClick?: () => void;
      render?: ReactElement;
      isLoading?: boolean;
      [key: string]: unknown;
    }) =>
      render
        ? React.cloneElement(render, props, children)
        : (
            <button type="button" onClick={onClick} {...props}>
              {children}
            </button>
          ),
    Input: ({
      label,
      value,
      onChange,
      helperText: _helperText,
      ...props
    }: {
      label?: string;
      value?: string;
      onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
      helperText?: string;
      [key: string]: unknown;
    }) => (
      <label>
        <span>{label}</span>
        <input aria-label={label} value={value ?? ""} onChange={onChange} {...props} />
      </label>
    ),
    Textarea: ({
      label,
      value,
      onChange,
      helperText: _helperText,
      ...props
    }: {
      label?: string;
      value?: string;
      onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
      helperText?: string;
      [key: string]: unknown;
    }) => (
      <label>
        <span>{label}</span>
        <textarea aria-label={label} value={value ?? ""} onChange={onChange} {...props} />
      </label>
    ),
    Select: ({
      label,
      value,
      onChange,
      options,
      ...props
    }: {
      label?: string;
      value?: string;
      onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
      options: { value: string; label: string }[];
      [key: string]: unknown;
    }) => (
      <label>
        <span>{label}</span>
        <select aria-label={label} value={value ?? ""} onChange={onChange} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    ),
    SegmentedControl: ({
      children,
      onValueChange,
    }: {
      children?: ReactNode;
      onValueChange?: (value: string) => void;
    }) => (
      <div data-testid="segmented-control">
        {React.Children.map(children, (child: ReactNode) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { onSelect: onValueChange })
            : child
        )}
      </div>
    ),
    SegmentedControlItem: ({
      children,
      value,
      onSelect,
    }: {
      children?: ReactNode;
      value: string;
      onSelect?: (value: string) => void;
    }) => (
      <button type="button" onClick={() => onSelect?.(value)}>
        {children}
      </button>
    ),
    useToast: () => ({
      success: successMock,
    }),
  };
});

vi.mock("@/components/admin/layout/AdminUi", () => ({
  AdminPageHeader: ({
    title,
    description,
    actions,
  }: {
    title: string;
    description?: string;
    actions?: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <div>{actions}</div>
    </div>
  ),
  AdminSectionCard: ({
    title,
    children,
  }: {
    title: string;
    children?: ReactNode;
  }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
  AdminStatusPill: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  createGuideMock.mockResolvedValue("guidePages_42");
  submitGuideForReviewMock.mockResolvedValue("guidePages_42");
  useMutationMock.mockImplementation(() => createGuideMock);
  useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
    if (
      typeof args === "object" &&
      args !== null &&
      "slug" in args
    ) {
      return null;
    }
    return {
      authorOptions: [
        {
          _id: "admin_1",
          label: "Admin User",
          adminRole: "super_admin",
        },
      ],
      relatedGuideOptions: [
        {
          _id: "guide_1",
          slug: "existing-guide",
          pageTitle: { en: "Existing guide", nl: "Bestaande gids" },
          status: "published",
        },
      ],
    };
  });
});

describe("GuideCreateView", () => {
  it("submits a guide draft with author and quick-answer fields", async () => {
    render(<GuideCreateView sessionRole="super_admin" />);

    fireEvent.change(screen.getByLabelText("Internal title"), {
      target: { value: "Guide title EN" },
    });
    fireEvent.change(screen.getByLabelText("H1"), {
      target: { value: "Guide H1 EN" },
    });
    fireEvent.change(screen.getByLabelText("Page brief"), {
      target: { value: "Guide brief EN" },
    });
    fireEvent.change(screen.getByLabelText("Item 1 (English)"), {
      target: { value: "Body EN" },
    });
    fireEvent.change(screen.getByLabelText("Key takeaway (English)"), {
      target: { value: "Key takeaway EN" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Dutch" }));
    fireEvent.change(screen.getByLabelText("Internal title"), {
      target: { value: "Guide title NL" },
    });
    fireEvent.change(screen.getByLabelText("H1"), {
      target: { value: "Guide H1 NL" },
    });
    fireEvent.change(screen.getByLabelText("Page brief"), {
      target: { value: "Guide brief NL" },
    });
    fireEvent.change(screen.getByLabelText("Item 1 (Dutch)"), {
      target: { value: "Body NL" },
    });
    fireEvent.change(screen.getByLabelText("Key takeaway (Dutch)"), {
      target: { value: "Key takeaway NL" },
    });

    fireEvent.click(screen.getByRole("button", { name: "SEO" }));
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    fireEvent.change(screen.getByLabelText("Meta title"), {
      target: { value: "Meta title EN" },
    });
    fireEvent.change(screen.getByLabelText("Meta description"), {
      target: { value: "A sufficiently long English meta description for testing." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Dutch" }));
    fireEvent.change(screen.getByLabelText("Meta title"), {
      target: { value: "Meta title NL" },
    });
    fireEvent.change(screen.getByLabelText("Meta description"), {
      target: { value: "Een voldoende lange Nederlandse metabeschrijving voor testen." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.change(screen.getByLabelText("Author"), {
      target: { value: "admin_1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Existing guide" }));

    fireEvent.click(screen.getByRole("button", { name: "Save as draft" }));

    await waitFor(() => expect(createGuideMock).toHaveBeenCalledTimes(1));

    expect(createGuideMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "guide-title-en",
        author: "admin_1",
        relatedGuides: ["existing-guide"],
        quickAnswer: expect.objectContaining({
          keyTakeaway: { en: "Key takeaway EN", nl: "Key takeaway NL" },
        }),
      })
    );
    expect(pushMock).toHaveBeenCalledWith("/admin/guides/guidePages_42/edit");
    expect(successMock).toHaveBeenCalled();
  });
});
