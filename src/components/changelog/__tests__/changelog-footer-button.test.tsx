import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChangelogFooterButton } from "../changelog-footer-button";
import * as changelogData from "../../../lib/changelog/changelog-data";
import * as telemetry from "../../../lib/telemetry";
import type { ChangelogEntry } from "../../../lib/changelog/changelog-data";

// Mock changelog data
vi.mock("../../../lib/changelog/changelog-data", () => ({
  getChangelogEntries: vi.fn(),
}));

// Mock telemetry
vi.mock("../../../lib/telemetry", () => ({
  telemetry: {
    changelogOpened: vi.fn(),
    changelogClosed: vi.fn(),
  },
}));

// Mock the ChangelogModal component
vi.mock("../changelog-modal", () => ({
  ChangelogModal: ({
    isOpen,
    onClose,
    changelog,
  }: {
    isOpen: boolean;
    onClose: () => void;
    changelog: ChangelogEntry[];
  }) => (
    <div data-testid="changelog-modal">
      {isOpen ? (
        <>
          <div>Modal is open</div>
          <div data-testid="entry-count">{changelog.length} entries</div>
          <button onClick={onClose}>Close</button>
        </>
      ) : null}
    </div>
  ),
}));

describe("ChangelogFooterButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("renders button correctly", () => {
    render(<ChangelogFooterButton />);
    
    const button = screen.getByRole("button", { name: "What's New" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  test("opens modal with all changelog entries when clicked", async () => {
    const mockEntries = [
      {
        version: "0.5.1",
        date: "2025-01-01", 
        changes: [
          { type: "feature" as const, description: "Added new feature" },
        ],
      },
      {
        version: "0.5.0",
        date: "2024-12-01",
        changes: [
          { type: "fix" as const, description: "Fixed bug" },
        ],
      },
    ];

    vi.mocked(changelogData.getChangelogEntries).mockResolvedValue(mockEntries);

    render(<ChangelogFooterButton />);
    
    const button = screen.getByRole("button", { name: "What's New" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("changelog-modal")).toBeInTheDocument();
      expect(screen.getByText("Modal is open")).toBeInTheDocument();
      expect(screen.getByTestId("entry-count")).toHaveTextContent("2 entries");
    });

    expect(changelogData.getChangelogEntries).toHaveBeenCalled();
    expect(telemetry.telemetry.changelogOpened).toHaveBeenCalledWith({
      changelog_entries_count: 2,
      is_automatic_open: false,
    });
  });

  test("shows modal even when no changelog entries exist", async () => {
    vi.mocked(changelogData.getChangelogEntries).mockResolvedValue([]);

    render(<ChangelogFooterButton />);
    
    const button = screen.getByRole("button", { name: "What's New" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("changelog-modal")).toBeInTheDocument();
      expect(screen.getByText("Modal is open")).toBeInTheDocument();
      expect(screen.getByTestId("entry-count")).toHaveTextContent("0 entries");
    });

    expect(telemetry.telemetry.changelogOpened).toHaveBeenCalledWith({
      changelog_entries_count: 0,
      is_automatic_open: false,
    });
  });

  test("shows loading state while fetching entries", async () => {
    let resolvePromise: (value: ChangelogEntry[]) => void = () => {};
    const promise = new Promise<ChangelogEntry[]>((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.mocked(changelogData.getChangelogEntries).mockReturnValue(promise);

    render(<ChangelogFooterButton />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Should show loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Resolve the promise
    resolvePromise([]);

    await waitFor(() => {
      expect(screen.getByText("What's New")).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  test("handles fetch error gracefully", async () => {
    vi.mocked(changelogData.getChangelogEntries).mockRejectedValue(
      new Error("Failed to fetch")
    );

    render(<ChangelogFooterButton />);
    
    const button = screen.getByRole("button", { name: "What's New" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("What's New")).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    // Modal should not be open
    expect(screen.queryByText("Modal is open")).not.toBeInTheDocument();
    expect(telemetry.telemetry.changelogOpened).not.toHaveBeenCalled();
  });

  test("tracks telemetry when modal is closed", async () => {
    const mockEntries = [
      {
        version: "0.5.1",
        date: "2025-01-01",
        changes: [
          { type: "feature" as const, description: "Added new feature" },
        ],
      },
    ];

    vi.mocked(changelogData.getChangelogEntries).mockResolvedValue(mockEntries);

    render(<ChangelogFooterButton />);
    
    const button = screen.getByRole("button", { name: "What's New" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Modal is open")).toBeInTheDocument();
    });

    // Close the modal
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    expect(telemetry.telemetry.changelogClosed).toHaveBeenCalledWith({
      changelog_entries_count: 1,
      time_open_ms: expect.any(Number),
    });

    // Modal should be closed
    expect(screen.queryByText("Modal is open")).not.toBeInTheDocument();
  });
});