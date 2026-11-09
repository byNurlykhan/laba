#!/usr/bin/env python3
"""Тізім xlsx файлының «Тізім» парағын JSON-ға шығару (gen.js үшін).
Қолданылуы: python3 tools/data/dump.py <тізім.xlsx> <sheet.json>"""
import json, sys
import openpyxl


def disp(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)


wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
rows = [[disp(c) for c in r] for r in wb["Тізім" if "Тізім" in wb.sheetnames else "\u0422\u0456\u0437\u0456\u043b\u0456\u043c"].iter_rows(values_only=True)]
w = max(len(r) for r in rows)
rows = [r + [""] * (w - len(r)) for r in rows]
json.dump(rows, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False)
print(len(rows), "rows,", w, "columns")
