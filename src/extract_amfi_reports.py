"""Extract Liquid and Overnight rows from the archived official AMFI report tables."""
from pathlib import Path
import csv
import hashlib
import re

ROOT = Path(__file__).resolve().parents[1]
TABLES = ROOT / "data" / "raw" / "amfi_report_tables"
REPORTS = ROOT / "data" / "raw" / "amfi_monthly_reports"
OUTPUT = ROOT / "data" / "raw" / "AMFI.csv"
MONTHS = {name: index for index, name in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1
)}


def extract_amfi_rows():
    rows, manifest = [], []
    pattern = re.compile(
        r"am(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(20\d{2})repo(?:revised)?\.csv",
        re.IGNORECASE,
    )
    for table_path in sorted(TABLES.glob("*.csv")):
        match = pattern.fullmatch(table_path.name)
        if not match:
            raise ValueError(f"Unexpected AMFI report-table name: {table_path.name}")
        year, month = match.group(2), MONTHS[match.group(1).lower()]
        month_key = f"{year}-{month:02d}"
        report_path = REPORTS / f"{table_path.stem}.xls"
        if not report_path.exists():
            raise FileNotFoundError(f"Missing original AMFI report: {report_path.name}")

        found = {}
        with table_path.open(newline="", encoding="utf-8-sig") as stream:
            for source_row in csv.reader(stream):
                if len(source_row) <= 7 or source_row[1].strip() not in ("Liquid Fund", "Overnight Fund"):
                    continue
                category = source_row[1].strip().removesuffix(" Fund")
                values = [float(source_row[index].replace(",", "").strip()) for index in (4, 5, 6, 7)]
                found[category] = values

        if set(found) != {"Liquid", "Overnight"}:
            raise ValueError(f"{month_key}: report must contain both target categories")
        for category in ("Liquid", "Overnight"):
            mobilized, redemptions, net_flow, aum = found[category]
            if abs((mobilized - redemptions) - net_flow) > 0.02:
                raise ValueError(f"{month_key} {category}: mobilized-minus-redemptions check failed")
            rows.append([month_key, category, mobilized, redemptions, net_flow, aum])

        digest = hashlib.sha256(report_path.read_bytes()).hexdigest()
        revised = "revised" in report_path.stem.lower()
        source_name = report_path.name
        manifest.append([
            month_key, source_name,
            f"https://portal.amfiindia.com/spages/{source_name}",
            digest, "revised" if revised else "as listed",
        ])

    months = sorted({row[0] for row in rows})
    if len(months) != 69 or months[0] != "2021-01" or months[-1] != "2026-09":
        raise ValueError(f"Expected 69 consecutive months 2021-01..2026-09; got {len(months)}")
    if len(rows) != 138:
        raise ValueError(f"Expected 138 category-month rows; got {len(rows)}")

    with OUTPUT.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.writer(stream)
        writer.writerow(["month", "category", "mobilized", "redemptions", "net_flow", "aum"])
        writer.writerows(rows)
    with (REPORTS / "manifest.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.writer(stream)
        writer.writerow(["month", "source_file", "source_url", "sha256", "archive_status"])
        writer.writerows(manifest)
    return rows


if __name__ == "__main__":
    extracted = extract_amfi_rows()
    print(f"Verified and extracted {len(extracted)} AMFI rows from 69 monthly reports.")
