"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  RiAddFill,
  RiArrowUpDownLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
} from "@remixicon/react";

function ensureProtocol(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidUrl(href: string) {
  try {
    new URL(href);
    return true;
  } catch {
    return false;
  }
}

type LinkItem = { id: string; value: string };

const makeId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function buildHref(raw: string) {
  const href = ensureProtocol(raw);
  if (!href) return null;
  return isValidUrl(href) ? href : null;
}

function urlWithPage(baseHref: string, page: number) {
  const base = buildHref(baseHref);
  if (!base) return null;

  const pageValue = String(page);
  const hasPage = /[?&]page=/i.test(base);
  const next = hasPage
    ? base.replace(/([?&]page=)[^&#]*/i, `$1${pageValue}`)
    : `${base}${base.includes("?") ? "&" : "?"}page=${pageValue}`;

  return isValidUrl(next) ? next : null;
}

type LinkActionsProps = {
  isLast: boolean;
  onAdd: () => void;
  onDelete: () => void;
  onOpen: () => void;
  onOpenAndDelete: () => void;
};

function LinkActions({
  isLast,
  onAdd,
  onDelete,
  onOpen,
  onOpenAndDelete,
}: LinkActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
      {isLast ? (
        <>
          <Button type="button" size="icon" variant="outline" onClick={onAdd}>
            <RiAddFill size={18} />
          </Button>
          <Button type="button" size="icon" onClick={onOpen}>
            <RiExternalLinkLine size={18} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={onOpenAndDelete}
          >
            <RiExternalLinkLine size={18} />
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={onDelete}
          >
            <RiDeleteBinLine size={18} />
          </Button>
          <Button type="button" size="icon" onClick={onOpen}>
            <RiExternalLinkLine size={18} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={onOpenAndDelete}
          >
            <RiExternalLinkLine size={18} />
          </Button>
        </>
      )}
    </div>
  );
}

type LinkRowProps = {
  index: number;
  link: string;
  isLast: boolean;
  onChange: (value: string) => void;
  onAdd: () => void;
  onDelete: () => void;
  onOpen: () => void;
  onOpenAndDelete: () => void;
};

function LinkRow({
  index,
  link,
  isLast,
  onChange,
  onAdd,
  onDelete,
  onOpen,
  onOpenAndDelete,
}: LinkRowProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-background/40 p-3 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground">
          {index + 1}
        </span>
        <Input
          type="text"
          placeholder="Enter a link"
          value={link}
          onChange={(e) => onChange(e.target.value)}
          className="sm:min-w-180"
        />
      </div>
      <LinkActions
        isLast={isLast}
        onAdd={onAdd}
        onDelete={onDelete}
        onOpen={onOpen}
        onOpenAndDelete={onOpenAndDelete}
      />
    </div>
  );
}

export function InputLink() {
  const [links, setLinks] = useState<LinkItem[]>([{ id: makeId(), value: "" }]);
  const [paramBase, setParamBase] = useState("");
  const [rangeStart, setRangeStart] = useState("0");
  const [rangeEnd, setRangeEnd] = useState("0");
  const [ascending, setAscending] = useState(true);

  const addInput = () => {
    setLinks((prev) => [...prev, { id: makeId(), value: "" }]);
  };

  const updateLink = (index: number, value: string) => {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, value } : link)),
    );
  };

  const deleteInput = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const openLinkInNewTab = (raw: string) => {
    const href = buildHref(raw);
    if (!href) return;
    const tab = window.open(href, "_blank", "noopener,noreferrer");
    if (tab) tab.blur();
    window.focus();
  };

  const openAllLinks = () => {
    const hrefs = links
      .map((link) => buildHref(link.value))
      .filter((href): href is string => Boolean(href));

    hrefs.forEach((href) => {
      const newTab = window.open("", "_blank");
      if (!newTab) return;
      newTab.opener = null;
      newTab.location.href = href;
    });
    window.focus();
  };

  const deleteAllLinks = () => {
    setLinks([{ id: makeId(), value: "" }]);
  };

  const generateLinksFromParams = () => {
    const base = buildHref(paramBase);
    if (!base) return;
    const start = Number.parseInt(rangeStart.trim(), 10);
    const end = Number.parseInt(rangeEnd.trim(), 10);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
      return;
    }
    const generated: LinkItem[] = [];
    for (let p = start; p <= end; p++) {
      const href = urlWithPage(base, p);
      if (href) generated.push({ id: makeId(), value: href });
    }
    if (generated.length) setLinks(generated);
  };

  const hasAnyLink = links.some((link) => link.value.trim() !== "");

  return (
    <div className="w-full max-w-6xl space-y-4">
      <div className="rounded-2xl border bg-card/60 p-5 shadow-sm backdrop-blur">
        <div className="mb-4 space-y-1 text-left">
          <h2 className="text-lg font-semibold">Generate link combinations</h2>
          <p className="text-sm text-muted-foreground">
            Masukkan base URL lalu tentukan rentang halaman yang ingin dibuat.
          </p>
        </div>
        <Field orientation="horizontal" className="flex-wrap items-end gap-4">
          <div className="min-w-[min(100%,18rem)] flex-1">
            <FieldLabel htmlFor="param-link-base">Parameter Links</FieldLabel>
            <Input
              id="param-link-base"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://example.com/...&page=1"
              value={paramBase}
              onChange={(e) => setParamBase(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel htmlFor="param-range-start">
              Parameter Combinations
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="param-range-start"
                type="number"
                min={1}
                className="w-24"
                placeholder="0"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
              />
              <span aria-hidden>-</span>
              <Input
                id="param-range-end"
                type="number"
                min={1}
                className="w-24"
                placeholder="0"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="button"
            className="sm:self-end"
            onClick={generateLinksFromParams}
          >
            Generate
            <RiAddFill size={18} />
          </Button>
        </Field>
      </div>

      <div className="rounded-2xl border bg-card/60 p-5 shadow-sm backdrop-blur">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-left">
            <h2 className="text-lg font-semibold">Links</h2>
            <p className="text-sm text-muted-foreground">
              Kelola dan buka link yang sudah digenerate.
            </p>
          </div>
          {hasAnyLink && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setLinks((prev) => {
                    const next = [...prev].reverse();
                    return next;
                  });
                  setAscending((prev) => !prev);
                }}
                aria-label="Toggle order"
              >
                <RiArrowUpDownLine
                  size={18}
                  className={ascending ? "" : "rotate-180"}
                />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={deleteAllLinks}
              >
                Delete all
              </Button>
              <Button type="button" size="sm" onClick={openAllLinks}>
                Open all
                <RiExternalLinkLine size={18} />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2 max-h-[46vh] overflow-auto pr-1">
          {links.map((link, index) => (
            <LinkRow
              key={link.id}
              index={index}
              link={link.value}
              isLast={index === links.length - 1}
              onChange={(value) => updateLink(index, value)}
              onAdd={addInput}
              onDelete={() => deleteInput(index)}
              onOpen={() => openLinkInNewTab(link.value)}
              onOpenAndDelete={() => {
                openLinkInNewTab(link.value);
                deleteInput(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
