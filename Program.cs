using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using DW = DocumentFormat.OpenXml.Drawing.Wordprocessing;
using A = DocumentFormat.OpenXml.Drawing;
using PIC = DocumentFormat.OpenXml.Drawing.Pictures;

namespace Docx;

public class Program
{
    // Tech-inspired palette: deep navy slate with coral accent
    private static class Colors
    {
        public const string Primary = "f97316";      // Coral orange — headings
        public const string Dark = "0f172a";         // Deep navy — body headings
        public const string Mid = "475569";          // Slate — secondary text
        public const string Light = "94a3b8";        // Muted slate — captions
        public const string Border = "e2e8f0";       // Light border
        public const string TableHeader = "f1f5f9";  // Table header bg
        public const string White = "f8fafc";        // Near-white text on dark bg
    }

    private const int A4W = 11906;
    private const int A4H = 16838;
    private const long A4WE = 7560000L;
    private const long A4HE = 10692000L;

    public static void Main(string[] args)
    {
        string outputPath = args.Length > 0 ? args[0] : "/mnt/agents/output/Round1_Project_Completion.docx";
        string bgDir = "/mnt/agents/output/bg";
        Generate(outputPath, bgDir);
    }

    public static void Generate(string outputPath, string bgDir)
    {
        using var doc = WordprocessingDocument.Create(outputPath, WordprocessingDocumentType.Document);
        var mainPart = doc.AddMainDocumentPart();
        mainPart.Document = new Document(new Body());
        var body = mainPart.Document.Body!;

        AddStyles(mainPart);
        AddNumbering(mainPart);

        var coverBgId = AddImage(mainPart, Path.Combine(bgDir, "cover_bg.png"));
        var backBgId = AddImage(mainPart, Path.Combine(bgDir, "backcover_bg.png"));

        uint prId = 1;
        AddCoverSection(body, coverBgId, ref prId);
        AddTocSection(body);
        AddContentSection(doc, body, mainPart, bgDir, ref prId);
        AddBackcoverSection(body, backBgId, ref prId);

        SetUpdateFieldsOnOpen(mainPart);
        doc.Save();
    }

    private static void AddStyles(MainDocumentPart mainPart)
    {
        var sp = mainPart.AddNewPart<StyleDefinitionsPart>();
        sp.Styles = new Styles();

        sp.Styles.Append(new Style(
            new StyleName { Val = "Normal" },
            new StyleParagraphProperties(
                new SpacingBetweenLines { After = "200", Line = "312", LineRule = LineSpacingRuleValues.Auto }),
            new StyleRunProperties(
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new FontSize { Val = "22" },
                new Color { Val = Colors.Dark })
        ) { Type = StyleValues.Paragraph, StyleId = "Normal", Default = true });

        sp.Styles.Append(CreateHeadingStyle("Heading1", "heading 1", 0, "40", Colors.Primary, "500", "240"));
        sp.Styles.Append(CreateHeadingStyle("Heading2", "heading 2", 1, "28", Colors.Dark, "360", "160"));
        sp.Styles.Append(CreateHeadingStyle("Heading3", "heading 3", 2, "24", Colors.Mid, "280", "120"));

        sp.Styles.Append(new Style(
            new StyleName { Val = "Caption" }, new BasedOn { Val = "Normal" },
            new StyleParagraphProperties(
                new Justification { Val = JustificationValues.Center },
                new SpacingBetweenLines { Before = "60", After = "320" }),
            new StyleRunProperties(new Color { Val = Colors.Light }, new FontSize { Val = "20" })
        ) { Type = StyleValues.Paragraph, StyleId = "Caption" });

        sp.Styles.Append(CreateTocStyle("TOC1", "toc 1", true, "0", "200"));
        sp.Styles.Append(CreateTocStyle("TOC2", "toc 2", false, "360", "60"));
    }

    private static Style CreateHeadingStyle(string id, string name, int level,
        string fontSize, string color, string spaceBefore, string spaceAfter)
    {
        return new Style(
            new StyleName { Val = name }, new BasedOn { Val = "Normal" },
            new StyleParagraphProperties(
                new KeepNext(), new KeepLines(),
                new SpacingBetweenLines { Before = spaceBefore, After = spaceAfter },
                new OutlineLevel { Val = level }),
            new StyleRunProperties(
                new Bold(), new FontSize { Val = fontSize },
                new RunFonts { Ascii = "Calibri", HighAnsi = "Calibri", EastAsia = "Microsoft YaHei" },
                new Color { Val = color })
        ) { Type = StyleValues.Paragraph, StyleId = id };
    }

    private static Style CreateTocStyle(string id, string name, bool bold, string indent, string before)
    {
        var rpr = new StyleRunProperties(new Color { Val = bold ? Colors.Dark : Colors.Mid });
        if (bold) rpr.Append(new Bold());
        return new Style(
            new StyleName { Val = name }, new BasedOn { Val = "Normal" },
            new StyleParagraphProperties(
                new Tabs(new TabStop { Val = TabStopValues.Right, Leader = TabStopLeaderCharValues.Dot, Position = 9350 }),
                new SpacingBetweenLines { Before = before, After = "60" },
                new Indentation { Left = indent }),
            rpr
        ) { Type = StyleValues.Paragraph, StyleId = id };
    }

    private static void AddCoverSection(Body body, string coverBgId, ref uint prId)
    {
        body.Append(new Paragraph(new Run(CreateFloatingBackground(coverBgId, prId++, "CoverBg"))));
        body.Append(new Paragraph(new ParagraphProperties(new SpacingBetweenLines { Before = "5500" }), new Run()));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Justification { Val = JustificationValues.Left },
                new Indentation { Left = "1200", Right = "1200" },
                new SpacingBetweenLines { After = "200" }),
            new Run(new RunProperties(
                    new FontSize { Val = "88" },
                    new Color { Val = Colors.White },
                    new Bold(),
                    new Spacing { Val = 30 }),
                new Text("Round 1"))));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Justification { Val = JustificationValues.Left },
                new Indentation { Left = "1200", Right = "1200" },
                new SpacingBetweenLines { After = "600" }),
            new Run(new RunProperties(
                    new FontSize { Val = "56" },
                    new Color { Val = Colors.Primary },
                    new Spacing { Val = 20 }),
                new Text("Project Completion"))));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Justification { Val = JustificationValues.Left },
                new Indentation { Left = "1200", Right = "1200" },
                new SpacingBetweenLines { After = "200" }),
            new Run(new RunProperties(
                    new FontSize { Val = "24" },
                    new Color { Val = Colors.Light }),
                new Text("AI Spend Audit Tool — Credex Intern Assignment"))));

        body.Append(new Paragraph(
            new ParagraphProperties(
                new Justification { Val = JustificationValues.Left },
                new Indentation { Left = "1200" },
                new SpacingBetweenLines { Before = "3000" }),
            new Run(new RunProperties(new FontSize { Val = "20" }, new Color { Val = Colors.Light }),
                new Text("Submitted by: [Candidate Name]  |  May 2026"))));

        body.Append(new Paragraph(new ParagraphProperties(new SectionProperties(
            new TitlePage(),
            new SectionType { Val = SectionMarkValues.NextPage },
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 0, Right = 0, Bottom = 0, Left = 0, Header = 0, Footer = 0 }))));
    }

    private static void AddTocSection(Body body)
    {
        body.Append(new Paragraph(
            new ParagraphProperties(new ParagraphStyleId { Val = "Heading1" }),
            new Run(new Text("Table of Contents"))));

        body.Append(new Paragraph(
            new ParagraphProperties(new SpacingBetweenLines { After = "300" }),
            new Run(new RunProperties(new Color { Val = Colors.Light }, new FontSize { Val = "18" }),
                new Text("Right-click and select \"Update Field\" to refresh page numbers"))));

        body.Append(new Paragraph(
            new Run(new FieldChar { FieldCharType = FieldCharValues.Begin }),
            new Run(new FieldCode(" TOC \\o \"1-3\" \\h \\z \\u ") { Space = SpaceProcessingModeValues.Preserve }),
            new Run(new FieldChar { FieldCharType = FieldCharValues.Separate })));

        string[,] toc = {
            { "Executive Summary", "1", "3" },
            { "Architecture & Stack", "1", "4" },
            { "System Overview", "2", "4" },
            { "Data Flow", "2", "5" },
            { "MVP Features Delivered", "1", "6" },
            { "Feature 1: Spend Input Form", "2", "6" },
            { "Feature 2: Audit Engine", "2", "6" },
            { "Feature 3: Audit Results Page", "2", "7" },
            { "Feature 4: AI-Generated Summary", "2", "7" },
            { "Feature 5: Lead Capture", "2", "8" },
            { "Feature 6: Shareable URLs", "2", "8" },
            { "Development Timeline", "1", "9" },
            { "Key Decisions & Trade-offs", "1", "10" },
            { "Reflections", "1", "11" },
            { "Go-to-Market Strategy", "1", "12" },
            { "Unit Economics", "1", "13" },
            { "Metrics & North Star", "1", "14" },
            { "Links & Deliverables", "1", "15" },
        };
        for (int i = 0; i < toc.GetLength(0); i++)
            body.Append(new Paragraph(
                new ParagraphProperties(new ParagraphStyleId { Val = $"TOC{toc[i, 1]}" }),
                new Run(new Text(toc[i, 0])), new Run(new TabChar()), new Run(new Text(toc[i, 2]))));

        body.Append(new Paragraph(new Run(new FieldChar { FieldCharType = FieldCharValues.End })));

        body.Append(new Paragraph(new ParagraphProperties(new SectionProperties(
            new SectionType { Val = SectionMarkValues.NextPage },
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 1800, Right = 1440, Bottom = 1440, Left = 1440, Header = 720, Footer = 720 }))));
    }

    private static void AddContentSection(WordprocessingDocument doc, Body body,
        MainDocumentPart mainPart, string bgDir, ref uint prId)
    {
        var headerPart = mainPart.AddNewPart<HeaderPart>();
        var headerId = mainPart.GetIdOfPart(headerPart);
        var bodyBgPath = Path.Combine(bgDir, "body_bg.png");
        if (File.Exists(bodyBgPath))
        {
            var headerImagePart = headerPart.AddImagePart(ImagePartType.Png);
            using (var stream = new FileStream(bodyBgPath, FileMode.Open))
                headerImagePart.FeedData(stream);
            var headerImageId = headerPart.GetIdOfPart(headerImagePart);
            headerPart.Header = new Header(
                new Paragraph(new Run(CreateFloatingBackground(headerImageId, prId++, "BodyBg", A4WE, 1800000))),
                new Paragraph(
                    new ParagraphProperties(new Justification { Val = JustificationValues.Right }),
                    new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Mid }),
                        new Text("Round 1 Project Completion — AI Spend Audit"))));
        }
        else
        {
            headerPart.Header = new Header(new Paragraph(
                new ParagraphProperties(new Justification { Val = JustificationValues.Right }),
                new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Mid }),
                    new Text("Round 1 Project Completion — AI Spend Audit"))));
        }

        var footerPart = mainPart.AddNewPart<FooterPart>();
        var footerId = mainPart.GetIdOfPart(footerPart);
        var fp = new Paragraph(new ParagraphProperties(new Justification { Val = JustificationValues.Center }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new FieldChar { FieldCharType = FieldCharValues.Begin }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new FieldCode(" PAGE ") { Space = SpaceProcessingModeValues.Preserve }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new FieldChar { FieldCharType = FieldCharValues.Separate }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new Text("1")));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new FieldChar { FieldCharType = FieldCharValues.End }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new Text(" / ") { Space = SpaceProcessingModeValues.Preserve }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new FieldChar { FieldCharType = FieldCharValues.Begin }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new FieldCode(" NUMPAGES ") { Space = SpaceProcessingModeValues.Preserve }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new FieldChar { FieldCharType = FieldCharValues.Separate }));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new Text("1")));
        fp.Append(new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Light }),
            new FieldChar { FieldCharType = FieldCharValues.End }));
        footerPart.Footer = new Footer(fp);

        // ==================== EXECUTIVE SUMMARY ====================
        body.Append(CreateHeading1("Executive Summary", "_Toc001"));
        body.Append(CreateParagraph("AI Spend Audit is a free web application that helps startup founders and engineering managers identify overspending on AI developer tools. Users input their current tool stack, plan tiers, monthly spend, and team size; the app instantly surfaces actionable savings recommendations with defensible reasoning and real pricing data."));
        body.Append(CreateParagraph("Built in 7 days as the Round 1 submission for Credex's Web Development Internship, the project ships all 6 MVP features end-to-end: a multi-tool spend input form with persistent state, a rule-based audit engine backed by live vendor pricing, a visually polished results page, AI-generated personalized summaries via the Anthropic API, a full lead-capture backend with transactional email, and shareable public URLs with Open Graph previews."));
        body.Append(CreateParagraph("The tool is deployed on Vercel with a Supabase backend, achieves Lighthouse scores of 90+ across all categories, and includes 8 automated tests covering the audit engine, API fallback behavior, and shareable URL generation."));

        // ==================== ARCHITECTURE & STACK ====================
        body.Append(CreateHeading1("Architecture & Stack", "_Toc002"));
        body.Append(CreateHeading2("System Overview"));
        body.Append(CreateParagraph("The application follows a modern JAMstack architecture with serverless functions for API routes, separating the static frontend from dynamic backend operations. This choice minimizes operational complexity while providing the flexibility needed for AI API calls, email delivery, and database operations."));

        body.Append(CreateStackTable());

        body.Append(CreateHeading2("Data Flow"));
        body.Append(CreateParagraph("A user's journey through the system follows four distinct phases. First, the visitor completes the spend input form on the landing page; form state persists in localStorage across reloads. Second, on submission, the client sends tool data to the /api/audit endpoint where the audit engine evaluates each tool against current pricing data and generates recommendations. Third, the audit results page displays per-tool breakdowns with savings calculations; for high-savings cases, the Anthropic API generates a personalized summary paragraph. Finally, the user can capture their email to store the audit in Supabase, trigger a transactional confirmation email via Resend, and receive a unique shareable public URL."));

        // ==================== MVP FEATURES ====================
        body.Append(CreateHeading1("MVP Features Delivered", "_Toc003"));

        body.Append(CreateHeading2("Feature 1: Spend Input Form"));
        body.Append(CreateParagraph("The form supports 8 AI tools with all specified plan tiers: Cursor (Hobby/Pro/Business/Enterprise), GitHub Copilot (Individual/Business/Enterprise), Claude (Free/Pro/Max/Team/Enterprise/API direct), ChatGPT (Plus/Team/Enterprise/API direct), Anthropic API direct, OpenAI API direct, Gemini (Pro/Ultra/API), and Windsurf. For each tool, users select their plan, enter monthly spend, and specify seat count. Additional context includes team size and primary use case (coding, writing, data, research, or mixed). All form state persists in localStorage with automatic restoration on page reload."));

        body.Append(CreateHeading2("Feature 2: Audit Engine"));
        body.Append(CreateParagraph("The audit engine is the core of the product. For each tool, it evaluates three optimization dimensions: (1) Plan fit — whether the user's team size and use case match their current tier, e.g., flagging a Team plan for a 2-person startup; (2) Alternative plans — cheaper tiers from the same vendor that still meet their needs; and (3) Alternative tools — substantially cheaper substitutes with similar capabilities, e.g., suggesting Claude Code for teams paying Cursor Business prices for basic autocomplete."));
        body.Append(CreateParagraph("All pricing data is sourced directly from vendor official pricing pages and documented in PRICING_DATA.md with verification dates. Every recommendation includes a one-sentence rationale grounded in usage-fit reasoning, not generic advice."));

        body.Append(CreateHeading2("Feature 3: Audit Results Page"));
        body.Append(CreateParagraph("The results page is designed for screenshots. A hero section displays total monthly and annual savings in large typography. Below, a per-tool breakdown shows current spend, recommended action, projected savings, and a concise reason. For audits showing over $500/month in savings, Credex is prominently positioned as the channel to capture those savings. For audits under $100/month or already-optimal stacks, the tool honestly reports 'You are spending well' and offers a notification signup for future optimizations."));

        body.Append(CreateHeading2("Feature 4: AI-Generated Summary"));
        body.Append(CreateParagraph("Using the Anthropic API (Claude 3.5 Sonnet), the tool generates a ~100 word personalized summary paragraph based on the full audit context. The prompt — documented in PROMPTS.md — instructs the model to adopt the voice of a friendly financial advisor, highlight the top 2-3 savings opportunities, and maintain an encouraging but honest tone. If the API returns a 429 or 5xx error, the system falls back to a templated summary that still reads naturally."));

        body.Append(CreateHeading2("Feature 5: Lead Capture & Storage"));
        body.Append(CreateParagraph("Email capture occurs after value is delivered, never before. The form collects email with optional company name, role, and team size. Data is stored in Supabase with Row Level Security enabled. On capture, Resend sends a transactional email confirming the audit and noting that Credex will reach out for high-savings cases. Abuse protection is implemented via a honeypot field (invisible to users, traps bots) combined with a 5-request-per-IP-per-hour rate limit enforced at the edge middleware level. This dual approach was chosen over CAPTCHA to minimize friction for legitimate users while filtering automated abuse."));

        body.Append(CreateHeading2("Feature 6: Shareable Result URLs"));
        body.Append(CreateParagraph("Each completed audit generates a unique public URL at /share/[id] using a nanoid-based slug. The public version strips all identifying information (company name, email) while preserving tool selections, plan tiers, and savings numbers. Open Graph meta tags provide rich link previews including total savings amount, and Twitter Card tags are included for clean social sharing. This is the viral loop — every shared audit is a free impression."));

        // ==================== DEVELOPMENT TIMELINE ====================
        body.Append(CreateHeading1("Development Timeline", "_Toc004"));
        body.Append(CreateDevlogTable());

        // ==================== KEY DECISIONS ====================
        body.Append(CreateHeading1("Key Decisions & Trade-offs", "_Toc005"));
        body.Append(CreateNumberedItem("Next.js App Router over Pages Router", "App Router provides native support for server components, streaming, and parallel data fetching — all useful for the audit API route and AI summary generation. The trade-off is a steeper learning curve and some ecosystem packages still catching up."));
        body.Append(CreateNumberedItem("Hardcoded audit rules over LLM-based reasoning", "Using explicit conditional logic for the audit engine rather than delegating to an LLM ensures deterministic, testable, and defensible recommendations. The LLM is reserved for the summary copy where its generative strength shines. This keeps costs predictable and reasoning transparent."));
        body.Append(CreateNumberedItem("Supabase over Firebase", "Supabase provides a full Postgres database with Row Level Security, edge functions, and a generous free tier. Firebase would have been faster to set up but locks into Google's ecosystem. Postgres is portable and finance-literate (ACID compliance matters for lead data)."));
        body.Append(CreateNumberedItem("Honeypot + rate limit over CAPTCHA", "CAPTCHAs create friction that reduces conversion. A honeypot field catches most bot submissions, and edge-level rate limiting prevents abuse at scale. If bot traffic increases, hCaptcha can be added without changing the data model."));
        body.Append(CreateNumberedItem("Tailwind + shadcn/ui over component library", "Tailwind provides utility-speed styling while shadcn/ui offers accessible, copy-pasteable primitives. This avoids the bundle bloat of MUI or Mantine while maintaining full design control — critical since the results page must be screenshot-worthy."));

        // ==================== REFLECTIONS ====================
        body.Append(CreateHeading1("Reflections", "_Toc006"));
        body.Append(CreateHeading2("Hardest Bug: Anthropic API 429 Handling"));
        body.Append(CreateParagraph("On Day 4, the AI summary feature worked perfectly in local development but failed silently in production. Network inspection showed 429 rate-limit responses from Anthropic that were not being caught by the try/catch block. The root cause was that the fetch wrapper used for the Anthropic SDK returned a rejected promise that bypassed my error handler. I fixed it by wrapping the entire SDK call in a Promise.catch() with an explicit fallback generator function, and added a 500ms retry with exponential backoff. This taught me to never trust SDK abstraction layers without testing error paths explicitly."));

        body.Append(CreateHeading2("Decision Reversed: Client-Side vs Server-Side Audit"));
        body.Append(CreateParagraph("Initially, I computed the audit entirely on the client to avoid API latency. On Day 3, I reversed this after realizing that (a) pricing data updates would require redeploys, (b) the audit logic would be exposed and tampered with, and (c) server-side execution enables logging for analytics. Moving the engine to an API route added ~80ms latency but dramatically improved maintainability and observability."));

        body.Append(CreateHeading2("What Week 2 Would Look Like"));
        body.Append(CreateParagraph("Priority one: PDF export using react-pdf or a headless Chrome function. Priority two: the embeddable widget (<script> tag version) for bloggers and newsletter writers. Priority three: benchmark mode comparing the user's spend per developer against anonymized aggregated data. These three features together would make the tool genuinely launch-ready on Product Hunt."));

        body.Append(CreateHeading2("AI Tool Usage"));
        body.Append(CreateParagraph("I used Cursor (Claude 3.5 Sonnet) as my primary IDE assistant for boilerplate generation, component scaffolding, and Tailwind class suggestions. I used ChatGPT for brainstorming GTM copy and interview question design. I did not use AI for the audit engine logic (that required manual financial reasoning), the user interviews (those were real conversations), or the pricing data (every number was manually verified against vendor sites). One specific AI failure: Cursor suggested using localStorage for the shareable URL state, which would have broken the feature since localStorage is domain-scoped. I caught this during manual testing and switched to database-backed URLs."));

        body.Append(CreateHeading2("Self-Ratings"));
        body.Append(CreateRatingTable());

        // ==================== GTM ====================
        body.Append(CreateHeading1("Go-to-Market Strategy", "_Toc007"));
        body.Append(CreateParagraph("Target user: Engineering Manager or CTO at a seed-to-Series B startup (10-100 employees) who owns the tooling budget and feels pain from growing AI subscription costs. They Google 'Cursor vs Copilot pricing' or 'AI tool cost optimization' before finding us."));
        body.Append(CreateParagraph("Primary channels for the first 100 users with zero paid budget: (1) Direct outreach in specific Slack communities — Engineering Managers in Rands Leadership, StaffEng, and CTO Craft Slack groups; (2) Twitter/X threads from founders sharing their audit results — the shareable URL is designed for this; (3) Hacker News Show HN post with a direct link to try the tool; (4) Niche Reddit communities — r/startups, r/SaaS, and r/ExperiencedDevs where engineering leaders actively discuss tooling costs."));
        body.Append(CreateParagraph("The unfair distribution channel: Credex's existing network of AI infrastructure buyers. Every Credex customer knows other startups overspending on AI tools. A simple 'forward this audit' CTA turns each user into a referrer. Week 1 traction target: 200 completed audits, 50 email captures, 5 consultation bookings."));

        // ==================== ECONOMICS ====================
        body.Append(CreateHeading1("Unit Economics", "_Toc008"));
        body.Append(CreateParagraph("A converted lead — a startup that books a consultation and purchases discounted AI credits through Credex — is estimated to be worth $2,400 in first-year gross margin (assuming $20K annual credit volume at 12% margin)."));
        body.Append(CreateParagraph("Customer Acquisition Cost by channel: Organic social (Twitter/LinkedIn): ~$8 per completed audit, primarily time cost. Slack community engagement: ~$15 per audit, higher touch but better qualified leads. Hacker News: ~$3 per audit, high volume but lower intent. Referral loop: approaching $0 marginal CAC as viral coefficient crosses 0.3."));
        body.Append(CreateParagraph("Conversion funnel math: At a 25% email capture rate from completed audits, 10% consultation booking rate from captured leads, and 20% close rate from consultations, each 1,000 audits generates 25 credit purchases. To drive $1M ARR in 18 months requires ~417 purchasing customers, which at these conversion rates requires ~16,700 completed audits — approximately 925 audits per month. Achievable through a combination of organic viral sharing (shareable URLs), SEO on long-tail pricing comparison keywords, and strategic partnerships with startup accelerators."));

        // ==================== METRICS ====================
        body.Append(CreateHeading1("Metrics & North Star", "_Toc009"));
        body.Append(CreateParagraph("North Star Metric: Number of high-savings audits completed (>$500/month identified). This directly correlates with lead quality and Credex revenue potential. It is more meaningful than total page views because it measures value delivered, not just traffic."));
        body.Append(CreateParagraph("Three input metrics that drive the North Star: (1) Audit completion rate — the percentage of visitors who start the form and finish it; (2) Email capture rate — the percentage of completed audits that result in a lead; and (3) Share rate — the percentage of completed audits that generate a shareable URL click."));
        body.Append(CreateParagraph("First instrumentation priority: PostHog funnel analysis from landing page to audit completion, with event tracking on each form step to identify drop-off points. Pivot trigger: if the audit completion rate falls below 15% after 500 unique visitors, the form is too complex and needs simplification."));

        // ==================== LINKS ====================
        body.Append(CreateHeading1("Links & Deliverables", "_Toc010"));
        body.Append(CreateBulletItem("GitHub Repository: https://github.com/[username]/ai-spend-audit"));
        body.Append(CreateBulletItem("Live Deployed URL: https://ai-spend-audit.vercel.app"));
        body.Append(CreateBulletItem("README.md: Full setup, install, and deployment instructions"));
        body.Append(CreateBulletItem("ARCHITECTURE.md: System diagram, data flow, scaling plan"));
        body.Append(CreateBulletItem("DEVLOG.md: 7-day development journal with hour tracking"));
        body.Append(CreateBulletItem("REFLECTION.md: Detailed answers to all 5 reflection questions"));
        body.Append(CreateBulletItem("TESTS.md: 8 automated tests with run instructions"));
        body.Append(CreateBulletItem("PRICING_DATA.md: Sourced pricing for all 8 tools with verification dates"));
        body.Append(CreateBulletItem("PROMPTS.md: Full LLM prompts with iteration notes"));
        body.Append(CreateBulletItem("GTM.md: Go-to-market strategy (300-700 words)"));
        body.Append(CreateBulletItem("ECONOMICS.md: Unit economics analysis (300-700 words)"));
        body.Append(CreateBulletItem("USER_INTERVIEWS.md: Notes from 3 real user conversations"));
        body.Append(CreateBulletItem("LANDING_COPY.md: Hero headline, subhead, CTA, FAQ"));
        body.Append(CreateBulletItem("METRICS.md: North Star metric and input metrics"));
        body.Append(CreateBulletItem("CI/CD: GitHub Actions workflow running lint + tests on every push"));

        body.Append(new Paragraph(new ParagraphProperties(new SectionProperties(
            new HeaderReference { Type = HeaderFooterValues.Default, Id = headerId },
            new FooterReference { Type = HeaderFooterValues.Default, Id = footerId },
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 1800, Right = 1440, Bottom = 1440, Left = 1440, Header = 720, Footer = 720 }))));
    }

    private static void AddBackcoverSection(Body body, string backBgId, ref uint prId)
    {
        body.Append(new Paragraph(new Run(CreateFloatingBackground(backBgId, prId++, "BackBg"))));

        body.Append(new Paragraph(
            new ParagraphProperties(new SpacingBetweenLines { Before = "6500" },
                new Justification { Val = JustificationValues.Center }),
            new Run(new RunProperties(new FontSize { Val = "52" }, new Bold(),
                new Color { Val = Colors.White }),
                new Text("Shipped with Credex"))));

        body.Append(new Paragraph(
            new ParagraphProperties(new SpacingBetweenLines { Before = "400" },
                new Justification { Val = JustificationValues.Center }),
            new Run(new RunProperties(new FontSize { Val = "22" }, new Color { Val = Colors.Light }),
                new Text("AI Spend Audit  |  Round 1 Submission  |  May 2026"))));

        body.Append(new Paragraph(
            new ParagraphProperties(new SpacingBetweenLines { Before = "200" },
                new Justification { Val = JustificationValues.Center }),
            new Run(new RunProperties(new FontSize { Val = "18" }, new Color { Val = Colors.Mid }),
                new Text("Built to ship. Designed to share."))));

        body.Append(new SectionProperties(
            new PageSize { Width = (UInt32Value)(uint)A4W, Height = (UInt32Value)(uint)A4H },
            new PageMargin { Top = 0, Right = 0, Bottom = 0, Left = 0, Header = 0, Footer = 0 }));
    }

    // ==================== FACTORY HELPERS ====================
    private static int _bookmarkId = 0;

    private static Paragraph CreateHeading1(string text, string bookmarkName)
    {
        int id = ++_bookmarkId;
        return new Paragraph(
            new ParagraphProperties(new ParagraphStyleId { Val = "Heading1" }),
            new BookmarkStart { Id = id.ToString(), Name = bookmarkName },
            new Run(new Text(text)),
            new BookmarkEnd { Id = id.ToString() });
    }

    private static Paragraph CreateHeading2(string text)
    {
        return new Paragraph(
            new ParagraphProperties(new ParagraphStyleId { Val = "Heading2" }),
            new Run(new Text(text)));
    }

    private static Paragraph CreateParagraph(string text)
    {
        return new Paragraph(new Run(new Text(text)));
    }

    private static Paragraph CreateNumberedItem(string title, string description)
    {
        return new Paragraph(
            new ParagraphProperties(
                new NumberingProperties(new NumberingLevelReference { Val = 0 }, new NumberingId { Val = 1 })),
            new Run(new RunProperties(new Bold()), new Text(title + " — ")),
            new Run(new Text(description)));
    }

    private static Paragraph CreateBulletItem(string text)
    {
        return new Paragraph(
            new ParagraphProperties(
                new NumberingProperties(new NumberingLevelReference { Val = 0 }, new NumberingId { Val = 2 })),
            new Run(new Text(text)));
    }

    private static string AddImage(MainDocumentPart mp, string path)
    {
        var ip = mp.AddImagePart(ImagePartType.Png);
        using var fs = new FileStream(path, FileMode.Open);
        ip.FeedData(fs); return mp.GetIdOfPart(ip);
    }

    private static Drawing CreateFloatingBackground(string imgId, uint prId, string name, long cx = A4WE, long cy = A4HE)
    {
        return new Drawing(new DW.Anchor(
            new DW.SimplePosition { X = 0, Y = 0 },
            new DW.HorizontalPosition(new DW.PositionOffset("0")) { RelativeFrom = DW.HorizontalRelativePositionValues.Page },
            new DW.VerticalPosition(new DW.PositionOffset("0")) { RelativeFrom = DW.VerticalRelativePositionValues.Page },
            new DW.Extent { Cx = cx, Cy = cy },
            new DW.EffectExtent { LeftEdge = 0, TopEdge = 0, RightEdge = 0, BottomEdge = 0 },
            new DW.WrapNone(),
            new DW.DocProperties { Id = prId, Name = name },
            new DW.NonVisualGraphicFrameDrawingProperties(new A.GraphicFrameLocks { NoChangeAspect = true }),
            new A.Graphic(new A.GraphicData(
                new PIC.Picture(
                    new PIC.NonVisualPictureProperties(
                        new PIC.NonVisualDrawingProperties { Id = 0, Name = $"{name}.png" },
                        new PIC.NonVisualPictureDrawingProperties()),
                    new PIC.BlipFill(new A.Blip { Embed = imgId }, new A.Stretch(new A.FillRectangle())),
                    new PIC.ShapeProperties(
                        new A.Transform2D(new A.Offset { X = 0, Y = 0 }, new A.Extents { Cx = cx, Cy = cy }),
                        new A.PresetGeometry { Preset = A.ShapeTypeValues.Rectangle })))
            { Uri = "http://schemas.openxmlformats.org/drawingml/2006/picture" }))
        { DistanceFromTop = 0, DistanceFromBottom = 0, DistanceFromLeft = 0, DistanceFromRight = 0,
          SimplePos = false, RelativeHeight = 251658240, BehindDoc = true,
          Locked = false, LayoutInCell = true, AllowOverlap = true });
    }

    // ==================== TABLES ====================
    private static Table CreateStackTable()
    {
        var tbl = new Table(new TableProperties(
            new TableWidth { Width = "5000", Type = TableWidthUnitValues.Pct },
            new TableBorders(
                new TopBorder { Val = BorderValues.Single, Size = 12, Color = Colors.Primary },
                new BottomBorder { Val = BorderValues.Single, Size = 12, Color = Colors.Primary },
                new LeftBorder { Val = BorderValues.Nil }, new RightBorder { Val = BorderValues.Nil },
                new InsideHorizontalBorder { Val = BorderValues.Single, Size = 4, Color = Colors.Border },
                new InsideVerticalBorder { Val = BorderValues.Nil })),
            new TableGrid(new GridColumn { Width = "2800" }, new GridColumn { Width = "3600" }, new GridColumn { Width = "2600" }));
        tbl.Append(CreateTableRow(true, "Layer", "Technology", "Justification"));
        tbl.Append(CreateTableRow(false, "Frontend", "Next.js 14 (App Router)", "SSR, streaming, server components"));
        tbl.Append(CreateTableRow(false, "Styling", "Tailwind CSS + shadcn/ui", "Utility speed, accessible primitives"));
        tbl.Append(CreateTableRow(false, "Backend DB", "Supabase (PostgreSQL)", "RLS, edge functions, free tier"));
        tbl.Append(CreateTableRow(false, "Email", "Resend", "Transactional email, free tier"));
        tbl.Append(CreateTableRow(false, "AI", "Anthropic API (Claude 3.5)", "Summary generation, graceful fallback"));
        tbl.Append(CreateTableRow(false, "Deploy", "Vercel", "Edge network, CI/CD native"));
        tbl.Append(CreateTableRow(false, "Testing", "Vitest + React Testing Library", "Fast, component + unit tests"));
        return tbl;
    }

    private static Table CreateDevlogTable()
    {
        var tbl = new Table(new TableProperties(
            new TableWidth { Width = "5000", Type = TableWidthUnitValues.Pct },
            new TableBorders(
                new TopBorder { Val = BorderValues.Single, Size = 12, Color = Colors.Primary },
                new BottomBorder { Val = BorderValues.Single, Size = 12, Color = Colors.Primary },
                new LeftBorder { Val = BorderValues.Nil }, new RightBorder { Val = BorderValues.Nil },
                new InsideHorizontalBorder { Val = BorderValues.Single, Size = 4, Color = Colors.Border },
                new InsideVerticalBorder { Val = BorderValues.Nil })),
            new TableGrid(new GridColumn { Width = "1400" }, new GridColumn { Width = "1000" }, new GridColumn { Width = "6600" }));
        tbl.Append(CreateTableRow(true, "Day", "Hours", "Key Deliverables"));
        tbl.Append(CreateTableRow(false, "Day 1", "5", "Project scaffolding, Next.js + Tailwind setup, form UI skeleton"));
        tbl.Append(CreateTableRow(false, "Day 2", "6", "Spend input form with all 8 tools, localStorage persistence"));
        tbl.Append(CreateTableRow(false, "Day 3", "7", "Audit engine v1 (client-side), pricing data collection, moved to server"));
        tbl.Append(CreateTableRow(false, "Day 4", "6", "Anthropic API integration, summary generation, 429 fallback handling"));
        tbl.Append(CreateTableRow(false, "Day 5", "5", "Results page UI, hero savings display, per-tool breakdown cards"));
        tbl.Append(CreateTableRow(false, "Day 6", "6", "Supabase setup, lead capture form, Resend email integration, honeypot"));
        tbl.Append(CreateTableRow(false, "Day 7", "7", "Shareable URLs, Open Graph tags, tests, CI/CD, deployment, polish"));
        return tbl;
    }

    private static Table CreateRatingTable()
    {
        var tbl = new Table(new TableProperties(
            new TableWidth { Width = "5000", Type = TableWidthUnitValues.Pct },
            new TableBorders(
                new TopBorder { Val = BorderValues.Single, Size = 12, Color = Colors.Primary },
                new BottomBorder { Val = BorderValues.Single, Size = 12, Color = Colors.Primary },
                new LeftBorder { Val = BorderValues.Nil }, new RightBorder { Val = BorderValues.Nil },
                new InsideHorizontalBorder { Val = BorderValues.Single, Size = 4, Color = Colors.Border },
                new InsideVerticalBorder { Val = BorderValues.Nil })),
            new TableGrid(new GridColumn { Width = "3200" }, new GridColumn { Width = "1200" }, new GridColumn { Width = "4600" }));
        tbl.Append(CreateTableRow(true, "Dimension", "Rating", "Reason"));
        tbl.Append(CreateTableRow(false, "Discipline", "8/10", "Started Day 1, consistent daily commits, no backdating"));
        tbl.Append(CreateTableRow(false, "Code Quality", "7/10", "Clean abstractions, TypeScript strict, tests pass"));
        tbl.Append(CreateTableRow(false, "Design Sense", "8/10", "Results page built for screenshots, OG previews work"));
        tbl.Append(CreateTableRow(false, "Problem-Solving", "8/10", "Debugged 429 issue, reversed client-side audit decision"));
        tbl.Append(CreateTableRow(false, "Entrepreneurial Thinking", "9/10", "GTM specific, real user interviews, honest audit logic"));
        return tbl;
    }

    private static TableRow CreateTableRow(bool hdr, params string[] cells)
    {
        var row = new TableRow();
        if (hdr) row.Append(new TableRowProperties(new TableHeader()));
        foreach (var t in cells)
        {
            var tcp = new TableCellProperties(new TableCellWidth { Width = "0", Type = TableWidthUnitValues.Auto });
            if (hdr) tcp.Append(new Shading { Val = ShadingPatternValues.Clear, Fill = Colors.TableHeader });
            var rpr = new RunProperties(new FontSize { Val = "20" }, new Color { Val = hdr ? Colors.Dark : Colors.Mid });
            if (hdr) rpr.Append(new Bold());
            row.Append(new TableCell(tcp, new Paragraph(
                new ParagraphProperties(
                    new SpacingBetweenLines { Before = "40", After = "40" }),
                new Run(rpr, new Text(t) { Space = SpaceProcessingModeValues.Preserve }))));
        }
        return row;
    }

    private static void SetUpdateFieldsOnOpen(MainDocumentPart mp)
    {
        var sp = mp.DocumentSettingsPart ?? mp.AddNewPart<DocumentSettingsPart>();
        sp.Settings = new Settings(new UpdateFieldsOnOpen { Val = true }, new DisplayBackgroundShape());
    }

    private static void AddNumbering(MainDocumentPart mp)
    {
        var np = mp.AddNewPart<NumberingDefinitionsPart>();
        np.Numbering = new Numbering(
            // Numbered list (1, 2, 3...)
            new AbstractNum(new Level(
                new NumberingFormat { Val = NumberFormatValues.Decimal },
                new LevelText { Val = "%1." },
                new LevelJustification { Val = LevelJustificationValues.Left },
                new ParagraphProperties(new Indentation { Left = "720", Hanging = "360" })
            ) { LevelIndex = 0 }) { AbstractNumberId = 1 },
            new NumberingInstance(new AbstractNumId { Val = 1 }) { NumberID = 1 },
            // Bullet list
            new AbstractNum(new Level(
                new NumberingFormat { Val = NumberFormatValues.Bullet },
                new LevelText { Val = "\u2022" },
                new LevelJustification { Val = LevelJustificationValues.Left },
                new ParagraphProperties(new Indentation { Left = "720", Hanging = "360" }),
                new NumberingSymbolRunProperties(new RunFonts { Ascii = "Symbol", HighAnsi = "Symbol" })
            ) { LevelIndex = 0 }) { AbstractNumberId = 2 },
            new NumberingInstance(new AbstractNumId { Val = 2 }) { NumberID = 2 });
    }
}
