#!/usr/bin/env python3
"""
Number Atlas
A zero-dependency Tkinter experiment that turns an integer into visual forms.
"""

from __future__ import annotations

import math
import tkinter as tk
from tkinter import ttk


DEFAULT_NUMBER = 360
MAX_INPUT = 10**12
MAX_COLLATZ_STEPS = 500


def prime_factors(n: int) -> list[int]:
    n = abs(n)
    if n < 2:
        return []
    out = []
    while n % 2 == 0:
        out.append(2)
        n //= 2
    p = 3
    while p * p <= n:
        while n % p == 0:
            out.append(p)
            n //= p
        p += 2
    if n > 1:
        out.append(n)
    return out


def digital_root(n: int) -> int:
    n = abs(n)
    if n == 0:
        return 0
    return 1 + (n - 1) % 9


def collatz(n: int, max_steps: int = MAX_COLLATZ_STEPS) -> list[int]:
    n = abs(n)
    if n == 0:
        return [0]
    seq = [n]
    for _ in range(max_steps):
        if n == 1:
            break
        n = n // 2 if n % 2 == 0 else 3 * n + 1
        seq.append(n)
    return seq


class NumberAtlas(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Number Atlas")
        self.geometry("1100x760")
        self.minsize(820, 620)

        self.number_var = tk.StringVar(value=str(DEFAULT_NUMBER))
        self.status_var = tk.StringVar(value="Enter an integer and press Visualize.")
        self.current = DEFAULT_NUMBER

        self._build_ui()
        self.bind("<Return>", lambda _e: self.visualize())
        self.canvas.bind("<Configure>", lambda _e: self.draw())
        self.visualize()

    def _build_ui(self):
        top = ttk.Frame(self, padding=14)
        top.pack(fill="x")

        ttk.Label(top, text="NUMBER ATLAS", font=("Segoe UI", 17, "bold")).pack(side="left")
        ttk.Label(top, text="  one integer, four visual languages").pack(side="left")

        controls = ttk.Frame(self, padding=(14, 0, 14, 10))
        controls.pack(fill="x")

        ttk.Label(controls, text="Number").pack(side="left")
        entry = ttk.Entry(controls, textvariable=self.number_var, width=24)
        entry.pack(side="left", padx=(8, 8))
        ttk.Button(controls, text="Visualize", command=self.visualize).pack(side="left")
        ttk.Button(controls, text="Random", command=self.randomize).pack(side="left", padx=8)

        self.info = ttk.Label(controls, textvariable=self.status_var)
        self.info.pack(side="right")

        self.canvas = tk.Canvas(self, bg="#101114", highlightthickness=0)
        self.canvas.pack(fill="both", expand=True, padx=14, pady=(0, 14))

    def randomize(self):
        import random
        value = random.randint(2, 999999)
        self.number_var.set(str(value))
        self.visualize()

    def visualize(self):
        raw = self.number_var.get().strip().replace(",", "")
        try:
            value = int(raw)
        except ValueError:
            self.status_var.set("Please enter a whole number.")
            return

        if abs(value) > MAX_INPUT:
            self.status_var.set(f"Keep |n| ≤ {MAX_INPUT:,} for a responsive demo.")
            return

        self.current = value
        factors = prime_factors(value)
        prime_text = "prime" if len(factors) == 1 and factors[0] == abs(value) else "composite"
        if abs(value) < 2:
            prime_text = "special case"

        self.status_var.set(
            f"{prime_text} · {len(bin(abs(value))[2:])} bits · digital root {digital_root(value)}"
        )
        self.draw()

    def panel(self, x0, y0, x1, y1, title):
        self.canvas.create_rectangle(
            x0, y0, x1, y1, fill="#17191e", outline="#2b2f38", width=1
        )
        self.canvas.create_text(
            x0 + 18, y0 + 18, anchor="nw", text=title,
            fill="#aeb6c4", font=("Segoe UI", 11, "bold")
        )

    def draw(self):
        if not self.canvas.winfo_width():
            return

        self.canvas.delete("all")
        w = self.canvas.winfo_width()
        h = self.canvas.winfo_height()
        gap = 12
        margin = 12

        if w < 760:
            # stacked layout on narrow windows
            panel_w = w - 2 * margin
            panel_h = max(220, (h - 5 * gap) / 4)
            boxes = []
            y = margin
            for _ in range(4):
                boxes.append((margin, y, margin + panel_w, y + panel_h))
                y += panel_h + gap
            total_h = y
            self.canvas.configure(scrollregion=(0, 0, w, total_h))
        else:
            self.canvas.configure(scrollregion=(0, 0, w, h))
            panel_w = (w - 2 * margin - gap) / 2
            panel_h = (h - 2 * margin - gap) / 2
            boxes = [
                (margin, margin, margin + panel_w, margin + panel_h),
                (margin + panel_w + gap, margin, w - margin, margin + panel_h),
                (margin, margin + panel_h + gap, margin + panel_w, h - margin),
                (margin + panel_w + gap, margin + panel_h + gap, w - margin, h - margin),
            ]

        titles = [
            "01  FACTOR CONSTELLATION",
            "02  BINARY STRIP",
            "03  DIGITAL ROOT ORBIT",
            "04  COLLATZ LANDSCAPE",
        ]
        for box, title in zip(boxes, titles):
            self.panel(*box, title)

        self.draw_factors(boxes[0])
        self.draw_binary(boxes[1])
        self.draw_root(boxes[2])
        self.draw_collatz(boxes[3])

    def draw_factors(self, box):
        x0, y0, x1, y1 = box
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2 + 10
        n = self.current
        factors = prime_factors(n)

        self.canvas.create_text(
            cx, y0 + 52, text=f"n = {n:,}", fill="#f4f6f8",
            font=("Consolas", 17, "bold")
        )

        if not factors:
            self.canvas.create_text(
                cx, cy, text="No prime factorization",
                fill="#747d8c", font=("Segoe UI", 12)
            )
            return

        unique = []
        for p in factors:
            if p not in unique:
                unique.append(p)

        radius = max(42, min((x1-x0), (y1-y0)) * 0.24)
        node_r = max(9, min(18, 110 / max(1, len(factors))))

        for i, p in enumerate(factors):
            angle = -math.pi/2 + 2 * math.pi * i / len(factors)
            px = cx + math.cos(angle) * radius
            py = cy + math.sin(angle) * radius
            self.canvas.create_line(cx, cy, px, py, fill="#38404c")
            self.canvas.create_oval(
                px-node_r, py-node_r, px+node_r, py+node_r,
                fill="#c7a86b", outline=""
            )
            self.canvas.create_text(
                px, py, text=str(p), fill="#101114",
                font=("Consolas", 9, "bold")
            )

        product = " × ".join(map(str, factors))
        if len(product) > 48:
            product = product[:45] + "…"
        self.canvas.create_text(
            cx, y1 - 22, text=product, fill="#7e8795",
            font=("Consolas", 10)
        )

    def draw_binary(self, box):
        x0, y0, x1, y1 = box
        bits = bin(abs(self.current))[2:]
        if self.current < 0:
            prefix = "−"
        else:
            prefix = ""

        self.canvas.create_text(
            (x0+x1)/2, y0 + 55,
            text=f"{prefix}{bits}",
            fill="#f4f6f8", font=("Consolas", 13, "bold")
        )

        left = x0 + 30
        right = x1 - 30
        top = y0 + 95
        usable = max(1, right-left)

        shown = bits[-64:]
        cell = usable / max(1, len(shown))
        cell = min(cell, 22)
        total = cell * len(shown)
        start = (x0+x1-total)/2

        for i, bit in enumerate(shown):
            bx0 = start + i*cell
            by0 = top
            self.canvas.create_rectangle(
                bx0, by0, bx0+cell-2, by0+44,
                fill="#d5d9df" if bit == "1" else "#242831",
                outline=""
            )
            if cell >= 13:
                self.canvas.create_text(
                    bx0 + (cell-2)/2, by0+22, text=bit,
                    fill="#101114" if bit=="1" else "#828a98",
                    font=("Consolas", 9, "bold")
                )

        ones = shown.count("1")
        zeros = shown.count("0")
        self.canvas.create_text(
            (x0+x1)/2, y1 - 42,
            text=f"{len(bits)} bits   ·   ones {ones}   ·   zeros {zeros}",
            fill="#7e8795", font=("Segoe UI", 10)
        )
        if len(bits) > 64:
            self.canvas.create_text(
                (x0+x1)/2, y1 - 22,
                text="showing the lowest 64 bits",
                fill="#5f6774", font=("Segoe UI", 9)
            )

    def draw_root(self, box):
        x0, y0, x1, y1 = box
        cx, cy = (x0+x1)/2, (y0+y1)/2 + 8
        r = min(x1-x0, y1-y0) * 0.29
        root = digital_root(self.current)

        for digit in range(1, 10):
            angle = -math.pi/2 + 2*math.pi*(digit-1)/9
            px = cx + math.cos(angle)*r
            py = cy + math.sin(angle)*r
            active = digit == root
            rr = 18 if active else 12
            self.canvas.create_oval(
                px-rr, py-rr, px+rr, py+rr,
                fill="#8bb8a8" if active else "#2a3037",
                outline=""
            )
            self.canvas.create_text(
                px, py, text=str(digit),
                fill="#101114" if active else "#8b94a2",
                font=("Consolas", 10, "bold")
            )

        if root == 0:
            self.canvas.create_text(
                cx, cy, text="0", fill="#8bb8a8",
                font=("Consolas", 34, "bold")
            )
        else:
            self.canvas.create_line(
                cx, cy,
                cx + math.cos(-math.pi/2 + 2*math.pi*(root-1)/9)*(r-22),
                cy + math.sin(-math.pi/2 + 2*math.pi*(root-1)/9)*(r-22),
                fill="#8bb8a8", width=3
            )
            self.canvas.create_text(
                cx, cy, text=str(root), fill="#f4f6f8",
                font=("Consolas", 32, "bold")
            )

        self.canvas.create_text(
            cx, y1-22, text="repeated digit sum → one digit",
            fill="#7e8795", font=("Segoe UI", 9)
        )

    def draw_collatz(self, box):
        x0, y0, x1, y1 = box
        seq = collatz(self.current)
        left, right = x0+28, x1-22
        top, bottom = y0+58, y1-38

        if len(seq) <= 1:
            self.canvas.create_text(
                (x0+x1)/2, (y0+y1)/2,
                text="No trajectory for 0", fill="#747d8c"
            )
            return

        values = [math.log10(max(1, v)) for v in seq]
        ymin, ymax = min(values), max(values)
        span = ymax-ymin or 1

        pts = []
        for i, v in enumerate(values):
            px = left + (right-left) * i / max(1, len(values)-1)
            py = bottom - (bottom-top) * (v-ymin) / span
            pts.extend([px, py])

        self.canvas.create_line(*pts, fill="#7f91c7", width=2, smooth=False)

        self.canvas.create_text(
            left, y0+42, anchor="w",
            text=f"{len(seq)-1} steps · peak {max(seq):,}",
            fill="#c7cdd6", font=("Consolas", 10)
        )
        self.canvas.create_text(
            right, y1-20, anchor="e",
            text="y-axis = log10(value)",
            fill="#66707f", font=("Segoe UI", 9)
        )


if __name__ == "__main__":
    NumberAtlas().mainloop()
