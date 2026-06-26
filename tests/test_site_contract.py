import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.scripts = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "a" and values.get("href"):
            self.links.append(values["href"])
        if tag == "script" and values.get("src"):
            self.scripts.append(values["src"])
        if tag == "img" and values.get("src"):
            self.images.append(values["src"])


class SiteContractTest(unittest.TestCase):
    def page(self, route):
        return PUBLIC.joinpath(route, "index.html") if route else PUBLIC / "index.html"

    def test_pages_exist(self):
        for route in ["", "resume", "at-0", "community", "contact"]:
            self.assertTrue(self.page(route).exists(), route)

    def test_resume_data_is_public_safe(self):
        data = json.loads((PUBLIC / "data" / "resume.json").read_text())
        text = json.dumps(data)
        self.assertIn("Ken Haas", data["name"])
        self.assertNotRegex(text, r"\b\d{3}[-.) ]*\d{3}[-. ]*\d{4}\b")
        self.assertNotIn("@gmail.com", text)
        self.assertIn("https://www.linkedin.com/in/kphaas/", text)

    def test_local_assets_resolve(self):
        for html_path in PUBLIC.glob("**/index.html"):
            parser = LinkParser()
            parser.feed(html_path.read_text())
            for asset in parser.scripts + parser.images:
                if asset.startswith("/"):
                    self.assertTrue((PUBLIC / asset.lstrip("/")).exists(), f"{html_path}: {asset}")

    def test_sitemap_covers_pages(self):
        sitemap = (PUBLIC / "sitemap.xml").read_text()
        for route in ["", "resume/", "at-0/", "community/", "contact/"]:
            self.assertIn(f"https://ken-haas.com/{route}", sitemap)


if __name__ == "__main__":
    unittest.main()
