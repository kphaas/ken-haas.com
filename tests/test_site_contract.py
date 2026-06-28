import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit


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
        for route in ["", "resume", "timeline", "at-0", "community", "contact"]:
            self.assertTrue(self.page(route).exists(), route)

    def test_resume_data_is_public_safe(self):
        data = json.loads((PUBLIC / "data" / "resume.json").read_text())
        text = json.dumps(data)
        self.assertIn("Ken Haas", data["name"])
        self.assertNotRegex(text, r"\b\d{3}[-.) ]*\d{3}[-. ]*\d{4}\b")
        self.assertNotIn("@gmail.com", text)
        self.assertIn("https://www.linkedin.com/in/kphaas/", text)
        self.assertIn("https://at-0.com/", text)
        self.assertIn("$850M", text)
        self.assertIn("financial-services enterprises", text)
        self.assertGreaterEqual(len(data["lenses"]), 4)
        self.assertTrue(any(lens["id"] == "governance" for lens in data["lenses"]))

    def test_interactive_resume_and_at0_link_exist(self):
        index = (PUBLIC / "index.html").read_text()
        resume = (PUBLIC / "resume" / "index.html").read_text()
        timeline = (PUBLIC / "timeline" / "index.html").read_text()
        at0 = (PUBLIC / "at-0" / "index.html").read_text()
        self.assertIn("Career timeline", index)
        self.assertEqual(index.count('class="highlight-title'), 4)
        self.assertIn('class="button secondary at0-button" href="/at-0/"', index)
        self.assertIn("AI transformation leadership", index)
        self.assertIn("AI-first transformation capability", index)
        self.assertIn("Ken's AI-first transformation capability", index)
        self.assertLess(index.index("AI-first"), index.index("$850M"))
        self.assertIn("large financial enterprises", index)
        self.assertIn("20-year career from IBM to a Managing Director seat at Microsoft", index)
        self.assertIn("financial-services sales motion", index)
        self.assertIn('href="/at-0/"><img src="/assets/at0-logo.svg"', index)
        self.assertIn("multi-tier infrastructure, data privacy", index)
        self.assertIn("Executive evidence", index)
        self.assertIn("Career path", index)
        self.assertIn("Hands-on AI proof", index)
        self.assertIn("Impact beyond the role", index)
        self.assertIn('href="/community/"', index)
        self.assertIn("data-resume-modal", resume)
        self.assertIn("data-resume-dialog", resume)
        self.assertIn("Career Path: From enterprise architecture to AI transformation leadership", timeline)
        self.assertIn("IBM: enterprise cloud and security architecture", timeline)
        self.assertIn("Microsoft: Managing Director of Customer Success", timeline)
        self.assertIn("Leads teams for adoption and business-value realization", timeline)
        self.assertIn("Earned business and computer science degrees at Furman", timeline)
        self.assertIn("UNC Kenan-Flagler", timeline)
        self.assertIn("2025-now", timeline)
        self.assertIn("Recognition and credentials", timeline)
        self.assertIn("Microsoft Platinum Club", timeline)
        self.assertIn("IBM 100% Club", timeline)
        self.assertIn("CISSP", timeline)
        self.assertIn("Visit at-0.com", at0)
        self.assertIn("AT-0 logo", at0)
        self.assertNotIn("See resume evidence", at0)
        self.assertIn("memory", at0)
        self.assertIn("domains", at0)
        self.assertIn("approvals", at0)
        self.assertIn("Architecture proof", at0)
        self.assertIn("owner-controlled infrastructure", at0)
        self.assertIn("Domains covered", at0)
        self.assertIn("Family", at0)
        self.assertIn("Financial", at0)
        self.assertIn("Medical", at0)
        self.assertIn("Legal", at0)
        self.assertIn("Documents", at0)
        self.assertIn("Calendar", at0)
        self.assertIn("Code", at0)
        self.assertIn("Forge, Warden, Smithy, Crucible, Spark, and Herald", at0)
        self.assertIn("data boundaries", at0)
        self.assertNotIn("Interactive resume", resume)
        self.assertIn("Operating at the intersection of AI, business, and transformation", resume)
        self.assertNotIn("Executive resume", resume)
        self.assertNotIn("ATS keyword signal", resume)
        self.assertIn("1,000+ personal hours building AT-0", resume)
        self.assertIn("Managing Director and senior IT executive", resume)
        self.assertIn("Explore the proof", resume)
        self.assertIn("senior IT executive story", resume)
        self.assertIn("Hands-on AI proof", resume)
        self.assertIn("Leads AI transformation with builder-level credibility", resume)
        self.assertIn("Cloud modernization and FinOps", resume)
        self.assertIn("Cybersecurity and privacy", resume)
        self.assertIn("IBM to Microsoft", resume)
        self.assertIn("20 years of experience leading AI transformation", resume)
        self.assertNotIn("19+", index + resume)
        self.assertIn("financial-services sales motion designed from scratch", resume)
        community = (PUBLIC / "community" / "index.html").read_text()
        self.assertIn("BESN.TV", community)
        self.assertIn("Community leadership", community)
        self.assertIn("10+", community)
        self.assertIn("50+", community)
        self.assertIn("mentorship, representation, and neurodiversity", community)
        self.assertIn("underrepresented communities", community)
        self.assertIn("Building Future Enterprises", community)
        self.assertIn("partnerships and provide overall business direction", community)
        self.assertIn("Mentorship, partnerships, advisory", community)

    def test_resume_has_ats_keywords(self):
        resume = (PUBLIC / "resume" / "index.html").read_text()
        data = (PUBLIC / "data" / "resume.json").read_text()
        combined = resume + data
        for phrase in [
            "Managing Director",
            "SVP",
            "Executive stakeholder management",
            "Execution",
            "Thought leadership",
            "Responsible enterprise AI",
            "AI governance",
            "Azure",
            "cybersecurity",
            "organizational change",
            "AT-0",
        ]:
            self.assertIn(phrase, combined)

    def test_local_assets_resolve(self):
        for html_path in PUBLIC.glob("**/index.html"):
            parser = LinkParser()
            parser.feed(html_path.read_text())
            for asset in parser.scripts + parser.images:
                if asset.startswith("/"):
                    path = urlsplit(asset).path
                    self.assertTrue((PUBLIC / path.lstrip("/")).exists(), f"{html_path}: {asset}")

    def test_sitemap_covers_pages(self):
        sitemap = (PUBLIC / "sitemap.xml").read_text()
        for route in ["", "resume/", "timeline/", "at-0/", "community/", "contact/"]:
            self.assertIn(f"https://ken-haas.com/{route}", sitemap)

    def test_cloudflare_routes_existing_dns(self):
        config = (ROOT / "wrangler.jsonc").read_text()
        self.assertIn('"pattern": "ken-haas.com/*"', config)
        self.assertIn('"pattern": "www.ken-haas.com/*"', config)
        self.assertNotIn('"custom_domain": true', config)


if __name__ == "__main__":
    unittest.main()
