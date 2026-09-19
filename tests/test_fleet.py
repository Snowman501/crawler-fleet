import unittest
from unittest.mock import patch

from fleet import format_text_report, inspect, validate_url


class FleetTests(unittest.TestCase):
    def test_findings_are_scoped_to_one_page(self):
        report = inspect("https://example.com/", "<html><head><title>Example</title></head><body><a href='/about'>About</a></body></html>")
        self.assertEqual(report["title"], "Example")
        self.assertFalse(next(f for f in report["findings"] if f["check"] == "Contact link on inspected page")["detected"])
        self.assertIn("one public page", report["scope"])
        self.assertIn("technical", report["team_summary"])
        self.assertIn("content", report["team_summary"])
        self.assertIn("trust", report["team_summary"])
        self.assertIn("conversion", report["team_summary"])

    def test_text_report_includes_team_summary_and_evidence(self):
        report = inspect(
            "https://example.com/",
            """
            <html>
              <head>
                <title>Example</title>
                <meta name="description" content="A sample page">
                <meta name="viewport" content="width=device-width, initial-scale=1">
              </head>
              <body><a href="mailto:hello@example.com">Email us</a><form></form></body>
            </html>
            """,
        )
        text = format_text_report(report)
        self.assertIn("Team summary", text)
        self.assertIn("[trust] Contact link on inspected page: detected", text)
        self.assertIn("Evidence checked", text)

    @patch("fleet.socket.getaddrinfo", return_value=[(None, None, None, None, ("127.0.0.1", 80))])
    def test_private_destination_is_rejected(self, _lookup):
        with self.assertRaisesRegex(ValueError, "public"):
            validate_url("http://localhost/")

    def test_credentials_and_custom_ports_are_rejected(self):
        for url in ("https://person:secret@example.com", "http://example.com:8080/"):
            with self.subTest(url=url), self.assertRaises(ValueError):
                validate_url(url)


if __name__ == "__main__":
    unittest.main()
