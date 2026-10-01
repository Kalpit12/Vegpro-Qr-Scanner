"use client";

export function PrintPageActions() {
  return (
    <button
      type="button"
      className="rounded-md border border-neutral-300 px-4 py-2 text-sm print:hidden"
      onClick={() => window.print()}
    >
      Print
    </button>
  );
}
