**Version:** 1.1 (Revised)
**Date:** June 2025
**Author:** Product & Engineering Team
**Client:** Travel Agency (Confidential)
**Status:** Revised Draft — Incorporates Client Feedback on Suggestion Acceptance
**Change Log:** Added Sample Excel Download, Dry Run Preview, Multi-Language Support, QR Code Module, Excel Validator Tool, Invoice Revision System, White-Label Capability, Enhanced Audit & Financial Analytics, Backup & Restore, Financial Year Numbering, API Cost Estimator. Removed Email Delivery, Digital Signature, PWA, and Customer Portal from scope.

---

---

## **1. EXECUTIVE SUMMARY**

InvoiceForge is a locally deployable, AI-enhanced web application designed for bulk invoice generation with advanced financial auditing capabilities. The platform ingests data from a single Excel source sheet, leverages Google Gemini AI to auto-generate intelligent descriptions, and produces professionally formatted invoices at scale. The system features a comprehensive audit engine that generates enhanced duplicate Excel reports with calculated financial columns including margins, profits, and cost breakdowns. Built primarily for a travel agency client, the system supports pre-made and fully customizable invoice templates across multiple industries, QR-code-enabled invoice verification, multi-language invoice output, and white-label branding. The application prioritizes data privacy by running entirely on the client's local server infrastructure, with an initial cloud-hosted demo instance for testing and validation purposes.

---

## **2. PROBLEM STATEMENT**

The client operates a travel agency and currently faces the following challenges:

* **Manual Invoice Creation:** Each invoice is created individually, consuming significant staff hours.
* **Inconsistent Formatting:** Without a standardized system, invoices vary in layout, description quality, and branding.
* **No Bulk Processing:** When handling large groups (tour groups, corporate bookings, event tickets), there is no way to generate hundreds of invoices simultaneously from a single data source.
* **Data Privacy Concerns:** The client refuses to use cloud-only SaaS invoice tools because sensitive customer financial and personal data must remain on their own servers.
* **Description Writing Burden:** Staff manually writes invoice line-item descriptions for each booking type (movie tickets, tours, hotel stays, show bookings), which is repetitive and error-prone.
* **No Financial Audit Trail:** After generating invoices, there is no automated system to track margins, profits, generation status, or produce financial summary reports tied back to the original data source.
* **No Standardized Data Format:** Staff frequently upload incorrectly formatted Excel files, causing errors and rework.
* **International Customers:** Being a travel agency, invoices sometimes need labels in different languages for international clients, which is currently done manually.

---

## **3. PRODUCT VISION**

> *"One Excel sheet in, hundreds of perfect invoices out — audited, AI-described, QR-verified, and hosted entirely on your own terms."*

---

## **4. TARGET USERS**

| User Persona                                | Description                                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Agency Admin**                      | The travel agency owner or office manager who uploads Excel sheets, configures templates, and triggers bulk invoice generation. Primary user. |
| **Accountant / Finance Staff**        | Reviews generated invoices, uses the enhanced audit Excel for financial reporting, tracks margins and profits.                                |
| **IT Administrator (Client-side)**    | Responsible for deploying and maintaining the application on the client's local server.                                                       |
| **Future Clients (Other Industries)** | The system is white-label ready, extensible to event management, hospitality, retail, freelancing through template presets and rebranding.    |

---

## **5. SCOPE & BOUNDARIES**

### 5.1 In Scope (Version 1.1)

* Excel file upload and parsing as the single data source
* **[NEW]** Sample Excel template downloads per industry category
* **[NEW]** Excel file validator tool (pre-upload format checking)
* Ability to swap/change the source Excel file at any time
* AI-powered description generation via Google Gemini API
* **[NEW]** Gemini API cost estimator before batch processing
* Pre-made invoice templates for multiple industries/categories
* Fully customizable invoice template builder/editor
* **[NEW]** Multi-language support for invoice labels and content
* **[NEW]** QR code generation on invoices with verification data
* Bulk invoice generation (all rows or filtered rows from Excel)
* **[NEW]** Dry-run preview before committing to full generation
* **[NEW]** Invoice revision and amendment tracking
* Multiple invoice size and ratio options (A4, A5, Letter, Custom)
* PDF export (individual and bulk as ZIP)
* **[NEW]** Enhanced audit system with duplicate Excel generation, financial columns (margin, profit, cost breakdown, generation status)
* **[NEW]** Backup and restore system for all application data
* **[NEW]** Financial year-based invoice numbering with auto-reset
* **[NEW]** White-label capability (rebrandable for different clients)
* Modern, Apple-inspired user interface with dark mode
* Local/self-hosted deployment capability
* Initial deployment on a free cloud backend for demo/testing

### 5.2 Out of Scope (Version 1.1)

* Payment gateway integration
* Multi-currency auto-conversion (manual currency field only)
* Email delivery of invoices to customers
* Digital signature / stamp on invoices
* Mobile native app (responsive web only)
* Progressive Web App (PWA)
* Customer-facing portal for invoice viewing
* Multi-user role-based access control (single admin login only in v1)
* Accounting software integrations (QuickBooks, Tally, etc.)

---

## **6. DETAILED FUNCTIONAL REQUIREMENTS**

---

### **6.1 MODULE 1: Excel Source Sheet Management**

**FR-1.1: Single Source Upload**

* The system shall accept a single Excel file (.xlsx, .xls, .csv) as the data source for invoice generation.
* Upon upload, the system shall parse all rows and columns and display a preview table within the UI.

**FR-1.2: Column Auto-Detection & Mapping**

* The system shall attempt to auto-detect and map Excel column headers to invoice fields (first name, last name, cost, description, category, company name, etc.).
* If auto-detection fails or is incorrect, the user shall be able to manually map columns via a drag-and-drop or dropdown interface.

**FR-1.3: Source Sheet Swap**

* The user shall be able to replace the current source sheet with a new Excel file at any time.
* Upon replacement, the system shall prompt: *"This will replace the current data source. Previously generated invoices will remain saved. Continue?"*
* The previous source file mapping configuration shall be remembered and auto-applied if column headers match.

**FR-1.4: Data Validation on Upload**

* The system shall validate the uploaded data for:
  * Missing required fields (first name, last name, amount)
  * Invalid data types (text in cost column, negative amounts)
  * Duplicate rows (flag but do not block)
* Validation results shall be displayed as a summary report with row-level error indicators.

**FR-1.5: In-App Data Editing**

* After upload, the user shall be able to edit individual cell values directly within the preview table (inline editing).
* Edits are applied to the in-memory data only; the original Excel file is not modified.

**FR-1.6: Data Filtering & Selection**

* The user shall be able to filter rows by any column value (e.g., show only "Movie" bookings).
* The user shall be able to select/deselect specific rows for invoice generation using checkboxes.
* A "Select All" and "Deselect All" toggle shall be provided.

**FR-1.7: [NEW] Sample Excel Template Downloads**

* The Data Source page shall include a prominent "Download Sample Excel" section.
* The system shall provide pre-built sample Excel files for each supported industry category:

| Sample File                         | Industry      | Columns Included                                                                                                      |
| ----------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `sample_travel_agency.xlsx`       | Travel        | first_name, last_name, destination, travel_date, return_date, ticket_cost, class, booking_ref, category, company_name |
| `sample_movie_entertainment.xlsx` | Entertainment | first_name, last_name, movie_name, show_date, showtime, seat_number, venue, ticket_cost, category                     |
| `sample_hotel_booking.xlsx`       | Hospitality   | first_name, last_name, hotel_name, check_in, check_out, room_type, nightly_rate, total_cost, category                 |
| `sample_tour_package.xlsx`        | Tour Operator | first_name, last_name, package_name, start_date, end_date, pax_count, cost_per_person, total_cost, category           |
| `sample_retail.xlsx`              | Retail        | first_name, last_name, item_name, quantity, unit_price, discount, total_cost, category                                |
| `sample_freelancer.xlsx`          | Freelance     | client_first_name, client_last_name, service_description, hours, hourly_rate, total_cost, project_name, category      |
| `sample_generic.xlsx`             | Generic       | first_name, last_name, description, amount, tax, total, category, notes                                               |

* Each sample file shall contain 5-10 realistic example rows with properly formatted data.
* Each sample file shall include a "README" sheet (second tab) explaining each column, required vs. optional, and data format expectations.
* Sample files shall be downloadable as individual files or as a single ZIP bundle.
* The download section shall be visually integrated with a card-based layout showing each sample with its industry icon, column count, and a "Download" button.

**FR-1.8: [NEW] Excel Template Validator Tool**

* A standalone validation page/tool accessible from the sidebar navigation:  **"Validate Excel"** .
* The user can drag-and-drop or browse to upload an Excel file specifically for validation (without importing it as a data source).
* The validator shall check:

| Validation Check              | Severity | Description                                                                       |
| ----------------------------- | -------- | --------------------------------------------------------------------------------- |
| File format                   | Error    | Must be .xlsx, .xls, or .csv                                                      |
| File size                     | Warning  | Flag if > 50MB                                                                    |
| Sheet count                   | Info     | Report number of sheets (only first sheet used)                                   |
| Header row presence           | Error    | First row must contain column headers                                             |
| Required columns              | Error    | Must contain at minimum: a name field and an amount field                         |
| Data type consistency         | Warning  | All values in a column should be the same type (e.g., all numbers in cost column) |
| Empty rows                    | Warning  | Flag rows that are entirely empty                                                 |
| Merged cells                  | Error    | Merged cells are not supported; must be unmerged                                  |
| Special characters in headers | Warning  | Flag headers with special characters that may cause mapping issues                |
| Date format consistency       | Warning  | Dates should follow a consistent format within a column                           |
| Duplicate headers             | Error    | Column headers must be unique                                                     |
| Row count                     | Info     | Total data rows found                                                             |
| Column count                  | Info     | Total columns found                                                               |

* **Validation Report Output:**
  * A visual report card showing pass/fail/warning for each check.
  * Color-coded: Green (pass), Yellow (warning), Red (error).
  * An overall score or status: "Ready to Import", "Import with Warnings", "Cannot Import — Fix Errors".
  * Specific error details with row/column references.
  * A "Fix Suggestions" section for each error with human-readable instructions.
* **Quick Fix Actions:**
  * "Remove Empty Rows" — auto-clean empty rows
  * "Trim Whitespace" — remove leading/trailing spaces from all cells
  * After fixes, the user can re-validate or directly import the cleaned file.
* The validator shall NOT import the file into the system. It is a standalone checking tool. A "Import This File" button shall be available after successful validation to redirect to the Data Source upload flow with the file pre-loaded.

---

### **6.2 MODULE 2: Invoice Template System**

**FR-2.1: Pre-Made Industry Templates**
The system shall ship with a minimum of 8 pre-designed invoice templates:

| Template Name                  | Industry / Use Case    | Key Characteristics                                                  |
| ------------------------------ | ---------------------- | -------------------------------------------------------------------- |
| **Travel Standard**      | Travel Agency          | Booking reference, traveler name, destination, dates, fare breakdown |
| **Travel Premium**       | Luxury Travel          | Elegant design, larger logo area, premium color palette              |
| **Movie / Event Ticket** | Entertainment          | Show/movie name, seat details, venue, showtime, ticket cost          |
| **Hotel Booking**        | Hospitality            | Check-in/out dates, room type, nightly rate, total                   |
| **Tour Package**         | Tour Operators         | Package name, itinerary summary, inclusions, total cost              |
| **Freelancer**           | Freelance / Consulting | Hourly rate, hours worked, service description, subtotal/tax/total   |
| **Retail**               | Retail / E-commerce    | Item list, quantity, unit price, discount, total                     |
| **Generic Minimal**      | Any                    | Clean minimal layout, fully generic fields                           |

**FR-2.2: Template Preview**

* Each template shall have a live preview thumbnail in a gallery view.
* Clicking a template opens a full-size preview with sample data populated.

**FR-2.3: Template Customization Engine**

* The user shall be able to customize any pre-made template or create a new template from scratch using a visual editor.
* Customizable elements include:
  * **Company Logo:** Upload and position (top-left, top-center, top-right)
  * **Company Information Block:** Name, address, phone, email, website, tax ID / GST number
  * **Color Scheme:** Primary color, secondary color, accent color, text color (color picker)
  * **Typography:** Font family selection (minimum 10 web-safe + Google Fonts), font sizes for header/body/footer
  * **Field Arrangement:** Drag-and-drop positioning of invoice fields on the canvas
  * **Field Visibility:** Toggle fields on/off (e.g., hide "discount" if not needed)
  * **Custom Fields:** Add unlimited custom fields with custom labels
  * **Header / Footer Text:** Editable free-text areas for terms, thank-you messages, legal disclaimers
  * **Border & Line Styles:** Table borders, section dividers, line thickness, dashed/solid
  * **Watermark:** Optional text or image watermark (e.g., "PAID", "DRAFT", company logo faint)
  * **[NEW] QR Code Placement:** Toggle on/off, position selection (bottom-left, bottom-right, top-right), size (small, medium, large)
  * **[NEW] Language Selection:** Dropdown to select invoice label language per template

**FR-2.4: Dynamic Format Switching by Category**

* The system shall support a "Category" column in the Excel source sheet.
* Based on the category value (e.g., "Movie", "Hotel", "Tour"), the system shall automatically select and apply the corresponding template.
* The user shall configure a **Category-to-Template Mapping** table:
  * Category value → Assigned template
  * Default template for unmapped categories
* This enables a single Excel sheet with mixed booking types to produce correctly formatted invoices for each type automatically.

**FR-2.5: Template Save & Management**

* Custom templates shall be saved with a user-defined name.
* The user shall be able to duplicate, rename, edit, and delete custom templates.
* A "Reset to Default" option shall restore a pre-made template to its original state.

**FR-2.6: [NEW] Multi-Language Invoice Labels**

* Invoice field labels (the words on the invoice itself, not the UI) shall be translatable.
* The system shall support a minimum of 12 languages for invoice labels:

| Language             | Example Labels                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| English              | Invoice, Date, Due Date, Bill To, Amount, Subtotal, Tax, Total                                                                                          |
| Hindi                | चालान, दिनांक, देय तिथि, प्राप्तकर्ता, राशि, उपयोग, कर, कुल                                                 |
| Arabic               | فاتورة, تاريخ, تاريخ الاستحقاق, فاتورة إلى, المبلغ, المجموع الفرعي, الضريبة, المجموع |
| French               | Facture, Date, Date d'échéance, Facturer à, Montant, Sous-total, Taxe, Total                                                                         |
| Spanish              | Factura, Fecha, Fecha de vencimiento, Facturar a, Importe, Subtotal, Impuesto, Total                                                                    |
| German               | Rechnung, Datum, Fälligkeitsdatum, Rechnungsempfänger, Betrag, Zwischensumme, Steuer, Gesamt                                                          |
| Japanese             | 請求書, 日付, 支払期日, 請求先, 金額, 小計, 税, 合計                                                                                                    |
| Chinese (Simplified) | 发票, 日期, 到期日, 收票人, 金额, 小计, 税, 总计                                                                                                        |
| Portuguese           | Fatura, Data, Data de vencimento, Cobrar de, Valor, Subtotal, Imposto, Total                                                                            |
| Korean               | 청구서, 날짜, 만기일, 수신인, 금액, 소계, 세금, 합계                                                                                                    |
| Russian              | Счёт, Дата, Срок оплаты, Плательщик, Сумма, Подитог, Налог, Итого                                     |
| Tamil                | விலைப்பட்டியல், தேதி, நிலுவை தேதி, பில் பெறுபவர், தொகை, துணைத்தொகை, வரி, மொத்தம்        |

* Language selection shall be available:
  * Per template (default language saved with template)
  * Per generation batch (override the template language for a specific run)
  * Per row/invoice (if the Excel source has a "language" column)
* **Custom Language Packs:** The user shall be able to create a custom language pack by providing translations for all label fields. This enables support for any language not in the preset list.
* The invoice body content (descriptions, customer names) are NOT translated — only the structural labels are changed.

---

### **6.3 MODULE 3: AI-Powered Description Generation (Gemini Integration)**

**FR-3.1: API Key Configuration**

* The system shall provide a settings page where the user inputs their Google Gemini API key.
* The API key shall be stored securely (encrypted at rest) in the local database.
* A "Test Connection" button shall verify the API key is valid and the Gemini API is reachable.
* The system shall display the API usage/quota status if available.

**FR-3.2: AI Description Generation Logic**

* When triggered, the AI module shall read the relevant fields from each Excel row (e.g., first name, last name, booking type, show/movie name, destination, dates, cost).
* It shall construct a structured prompt and send it to the Gemini API.
* The AI shall generate a professional, contextual invoice line-item description.

**Example Prompt Construction:**

<pre><div class="not-prose my-0 flex w-full flex-col overflow-clip border border-border text-text-primary rounded-lg not-prose relative" data-code-block="true" bis_skin_checked="1"><div class="border-border flex items-center justify-between border-b px-4 py-2" bis_skin_checked="1"><div class="flex items-center gap-2" bis_skin_checked="1"><svg width="14" stroke-width="1.5" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-text-secondary"><path d="M9.00001 21L8.00001 21C6.89544 21 6.00001 20.1057 6.00001 19.0011C6.00001 17.4501 6.00001 15.3443 6 14C6 13 4.5 12 4.5 12C4.5 12 6.00001 11 6.00001 10C6.00001 8.827 6.00001 6.62207 6.00001 4.99914C6.00001 3.89457 6.89544 3 8.00001 3L9.00001 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 21L16 21C17.1046 21 18 20.1057 18 19.0011C18 17.4501 18 15.3443 18 14C18 13 19.5 12 19.5 12C19.5 12 18 11 18 10C18 8.827 18 6.62207 18 4.99914C18 3.89457 17.1046 3 16 3L15 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="text-text-secondary text-sm font-medium">text</span></div><button class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 focus-visible:ring-offset-surface-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 text-sm text-interactive-active hover:text-interactive-normal active:text-text-tertiary font-normal relative rounded-lg p-[6px]" type="button" data-state="closed" data-slot="tooltip-trigger"><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-interactive-positive absolute inset-0 m-auto rotate-90 opacity-0 transition-all duration-300"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="absolute inset-0 m-auto opacity-100 transition-opacity duration-300"><path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div><div class="code-block_container__lbMX4" bis_skin_checked="1"><pre class="shiki github-dark shiki-code-block" tabindex="0"><code class="whitespace-pre-wrap break-words"><span class="line"><span>You are an invoice description writer for a travel agency. Generate a professional, concise invoice line-item description (2-3 sentences max) for the following booking:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- Customer: {first_name} {last_name}</span></span>
<span class="line"><span>- Booking Type: {category} (e.g., Movie Ticket)</span></span>
<span class="line"><span>- Details: {movie_name / show_name / destination}</span></span>
<span class="line"><span>- Date: {booking_date}</span></span>
<span class="line"><span>- Amount: {cost}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>The description should be formal, suitable for a financial document, and clearly state what the customer is being billed for. Keep it consistent in tone across all invoices.</span></span></code></pre></div></div></pre>

**Example Output:**

> *"Invoice for Mr. Rajesh Kumar — One (1) premium movie ticket for 'Interstellar IMAX Experience' at PVR Cinemas, Phoenix Mall, on 15th June 2025, 7:30 PM show. Total amount: ₹850.00."*

**FR-3.3: Consistency Mode**

* The system shall enforce a "Consistency Mode" where:
  * The first generated description sets the tone, structure, and format.
  * All subsequent descriptions follow the exact same sentence structure, only swapping variable data (name, show, date, cost).
  * This is achieved by including the first generated description as a "style reference" in subsequent API calls.

**FR-3.4: Batch AI Processing**

* The user shall be able to trigger AI description generation for:
  * A single selected row (preview/test)
  * All selected rows (bulk generation)
* A progress indicator shall show batch processing status (e.g., "Generating 47/200 descriptions...").
* Rate limiting shall be handled gracefully with automatic retry and queuing.

**FR-3.5: AI Description Review & Edit**

* After generation, all AI descriptions shall be displayed in a review table.
* The user shall be able to:
  * Accept a description as-is
  * Edit a description manually
  * Regenerate a single description (re-call AI for that row)
  * Regenerate all descriptions with a modified prompt

**FR-3.6: Prompt Customization**

* Advanced users shall be able to edit the AI prompt template from the settings page.
* Variables (placeholders) shall be insertable via a dropdown or tag system ({first_name}, {last_name}, {category}, {cost}, etc.).

**FR-3.7: Offline / No-AI Fallback**

* If no Gemini API key is configured or the API is unreachable, the system shall fall back to a simple template-based description:
  * *"{category} booking for {first_name} {last_name}. Amount: {cost}."*
* The user shall be notified that AI features are unavailable.

**FR-3.8: [NEW] Gemini API Cost Estimator**

* Before triggering any batch AI description generation, the system shall display a **Cost Estimation Panel** showing:

| Metric                                    | Calculation                                                        | Display                                        |
| ----------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| **Total Rows Selected**             | Count of selected rows                                             | e.g., "247 invoices"                           |
| **Estimated Input Tokens per Row**  | Average prompt size (~150-300 tokens)                              | e.g., "~200 tokens/row"                        |
| **Estimated Output Tokens per Row** | Average response size (~50-150 tokens)                             | e.g., "~100 tokens/row"                        |
| **Total Estimated Tokens**          | (input + output) × row count                                      | e.g., "~74,100 tokens"                         |
| **Estimated API Cost**              | Based on Gemini pricing tiers (auto-detected from model selection) | e.g., "~$0.037 USD"                            |
| **Free Tier Remaining**             | If using free tier, show remaining daily/monthly quota             | e.g., "1,423 / 1,500 requests remaining today" |
| **Estimated Processing Time**       | Based on rate limits and row count                                 | e.g., "~4 minutes 12 seconds"                  |

* The estimator shall support model selection:
  * Gemini 1.5 Flash (cheaper, faster)
  * Gemini 1.5 Pro (more capable, costlier)
  * Gemini 2.0 Flash (latest, balanced)
* A clear warning shall appear if:
  * Estimated cost exceeds $1.00 USD
  * Estimated usage exceeds free tier quota
  * Estimated processing time exceeds 10 minutes
* The user must explicitly confirm: **"I understand the estimated cost is ~${amount}. Proceed with AI generation."** before the batch starts.
* After generation completes, the system shall display actual tokens used and actual cost alongside the estimates for comparison.
* A running total of API costs shall be tracked in the Settings page under "AI Usage History" with daily/weekly/monthly breakdowns.

---

### **6.4 MODULE 4: Invoice Generation Engine**

**FR-4.1: Single Invoice Generation**

* The user shall be able to generate an invoice for a single selected row from the data table.
* The generated invoice shall open in a full-screen preview within the application.

**FR-4.2: Bulk Invoice Generation**

* The user shall be able to generate invoices for all selected rows (or all rows) in a single action.
* The system shall process invoices sequentially and display a progress bar.
* Upon completion, the user shall be presented with:
  * A gallery/grid view of all generated invoice thumbnails
  * A summary count (e.g., "197 invoices generated successfully, 3 errors")

**FR-4.3: [ENHANCED] Invoice Numbering with Financial Year Support**

* The system shall auto-generate sequential invoice numbers.
* The numbering format shall be configurable:
  * Prefix (e.g., "INV-", "TRV-", "2025-")
  * Starting number (e.g., 1001)
  * Zero-padding (e.g., INV-0001, INV-00001)
* **[NEW] Financial Year Integration:**
  * The user shall configure their financial year start month (default: April for India, January for calendar year, or any custom month).
  * Invoice numbering shall automatically include the financial year: e.g., `INV-2025-26-0001` (for April 2025 to March 2026).
  * At the start of each new financial year, the sequential counter shall **auto-reset** to the configured starting number.
  * The system shall display a notification when a financial year rollover is approaching (30 days before).
  * Historical invoice numbers from previous financial years are preserved and searchable.
  * The numbering format shall be configurable:
    * `{PREFIX}-{FY}-{NUMBER}` → `INV-2025-26-0001`
    * `{PREFIX}-{YEAR}-{NUMBER}` → `INV-2025-0001`
    * `{PREFIX}-{NUMBER}` → `INV-0001` (no year)
    * Custom pattern
* The user shall be able to override individual invoice numbers.

**FR-4.4: Invoice Date Handling**

* Default invoice date: Current system date
* The user shall be able to set a custom date for all invoices or use a date column from the Excel source.
* Due date calculation: Configurable (e.g., Net 15, Net 30, Net 60, or custom date).

**FR-4.5: Tax & Discount Calculations**

* The system shall support:
  * Tax rate (percentage-based, configurable per template or globally)
  * Multiple tax lines (e.g., CGST + SGST for Indian GST, or VAT)
  * Discount (percentage or fixed amount, per line item or on total)
  * Auto-calculation: Subtotal → Discount → Tax → Grand Total
* Tax and discount fields shall be optional (toggle on/off).

**FR-4.6: Multi-Line Item Support**

* If the Excel data contains multiple rows for the same customer (same first name + last name or a customer ID), the system shall offer an option to consolidate them into a single invoice with multiple line items.

**FR-4.7: [NEW] Invoice Preview / Dry Run**

* Before committing to bulk generation, the system shall provide a **Dry Run Preview** feature.
* When the user clicks "Preview Before Generating" (available alongside the main "Generate" button), the system shall:
  * Generate a small sample batch of preview invoices (not saved to the database):
    * **First row** from the selected data
    * **Last row** from the selected data
    * **3 random middle rows** from the selected data
    * Total: 5 preview invoices (or fewer if total selected rows < 5)
  * Display the 5 previews in a horizontally scrollable carousel with full-size rendering.
  * Each preview shall show:
    * The rendered invoice exactly as it would appear in final output
    * The source row number and key data (name, amount) overlaid as a reference tag
    * A "Looks Good" (thumbs up) and "Needs Changes" (thumbs down) quick-feedback button
  * Below the carousel, show a summary checklist:
    * ✅ Template applied correctly
    * ✅ Invoice numbers sequential
    * ✅ AI descriptions populated (if AI was enabled)
    * ✅ QR codes present (if enabled)
    * ✅ Tax calculations correct
    * ✅ Language labels correct
  * Two action buttons:
    * **"Proceed with Full Generation"** — commits to generating all selected invoices
    * **"Go Back & Adjust"** — returns to the configuration step
* Dry run previews shall NOT be saved to the database or filesystem. They are rendered in-memory only and discarded after the user navigates away.
* If the user identifies issues in the preview, they can go back and adjust template, mappings, AI prompt, or data before committing.

**FR-4.8: [NEW] QR Code Generation on Invoices**

* Each generated invoice shall optionally include a QR code containing structured verification data.
* **QR Code Content (Encoded Data):**

<pre><div class="not-prose my-0 flex w-full flex-col overflow-clip border border-border text-text-primary rounded-lg not-prose relative" data-code-block="true" bis_skin_checked="1"><div class="border-border flex items-center justify-between border-b px-4 py-2" bis_skin_checked="1"><div class="flex items-center gap-2" bis_skin_checked="1"><svg width="14" stroke-width="1.5" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-text-secondary"><path d="M9.00001 21L8.00001 21C6.89544 21 6.00001 20.1057 6.00001 19.0011C6.00001 17.4501 6.00001 15.3443 6 14C6 13 4.5 12 4.5 12C4.5 12 6.00001 11 6.00001 10C6.00001 8.827 6.00001 6.62207 6.00001 4.99914C6.00001 3.89457 6.89544 3 8.00001 3L9.00001 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 21L16 21C17.1046 21 18 20.1057 18 19.0011C18 17.4501 18 15.3443 18 14C18 13 19.5 12 19.5 12C19.5 12 18 11 18 10C18 8.827 18 6.62207 18 4.99914C18 3.89457 17.1046 3 16 3L15 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="text-text-secondary text-sm font-medium">JSON</span></div><button class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 focus-visible:ring-offset-surface-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 text-sm text-interactive-active hover:text-interactive-normal active:text-text-tertiary font-normal relative rounded-lg p-[6px]" type="button" data-state="closed" data-slot="tooltip-trigger"><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-interactive-positive absolute inset-0 m-auto rotate-90 opacity-0 transition-all duration-300"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="absolute inset-0 m-auto opacity-100 transition-opacity duration-300"><path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div><div class="code-block_container__lbMX4" bis_skin_checked="1"><pre class="shiki github-dark shiki-code-block" tabindex="0"><code class="whitespace-pre-wrap break-words"><span class="line"><span>{</span></span>
<span class="line"><span>  "app"</span><span>: </span><span>"InvoiceForge"</span><span>,</span></span>
<span class="line"><span>  "invoice_number"</span><span>: </span><span>"INV-2025-26-0047"</span><span>,</span></span>
<span class="line"><span>  "date"</span><span>: </span><span>"2025-06-15"</span><span>,</span></span>
<span class="line"><span>  "customer"</span><span>: </span><span>"Rajesh Kumar"</span><span>,</span></span>
<span class="line"><span>  "amount"</span><span>: </span><span>850.00</span><span>,</span></span>
<span class="line"><span>  "currency"</span><span>: </span><span>"INR"</span><span>,</span></span>
<span class="line"><span>  "category"</span><span>: </span><span>"Movie Ticket"</span><span>,</span></span>
<span class="line"><span>  "generated_at"</span><span>: </span><span>"2025-06-15T14:32:00Z"</span><span>,</span></span>
<span class="line"><span>  "verification_hash"</span><span>: </span><span>"sha256:a1b2c3d4e5..."</span></span>
<span class="line"><span>}</span></span></code></pre></div></div></pre>

* **Verification Hash:** A SHA-256 hash of the invoice data combined with a secret key (configured in settings). This allows anyone scanning the QR code to verify the invoice hasn't been tampered with.
* **QR Code Verification Page:**
  * When the QR code is scanned (opens a URL like `http://localhost:3000/verify/{hash}`), the system shall display a verification page showing:
    * ✅ "This invoice is verified" or ❌ "This invoice could not be verified"
    * Invoice summary details (number, date, customer, amount)
    * Generation timestamp
  * For the cloud demo, the verification URL shall point to the cloud instance.
  * For local deployment, it points to the local server (accessible within the client's network).
* **QR Code Customization:**
  * Toggle: On/Off per template
  * Position: Bottom-left, bottom-right, top-right (configurable in template editor)
  * Size: Small (1.5cm), Medium (2.5cm), Large (3.5cm)
  * Style: Standard black, colored (match template primary color), with/without logo overlay
  * Error correction level: Low, Medium, High (higher = more scannable but larger)
* **Database Storage:** Each generated QR code's hash and associated invoice data shall be stored in the local database for verification lookups. This is handled by the existing SQLite/application database — no external database service required for QR functionality.

**FR-4.9: [NEW] Invoice Revision & Amendment System**

* After generating invoices, the user shall be able to revise any individual invoice.
* **Revision Workflow:**
  1. User opens a generated invoice from the Invoice Gallery.
  2. Clicks "Edit / Revise" button.
  3. An edit panel opens allowing modification of:
     * Any data field (customer name, amount, description, etc.)
     * Template selection (switch to a different template)
     * AI description (regenerate or manually edit)
     * QR code (regenerated automatically with updated data)
  4. Upon saving, the system creates a **new version** of the invoice:
     * Original version is preserved and marked as "Superseded."
     * New version is marked as the "Current" version.
     * Revision number is incremented: Rev 0 (original) → Rev 1 → Rev 2, etc.
     * The invoice number remains the same, but the revision is appended: `INV-2025-26-0047 (Rev 1)`
     * The revision date is recorded separately from the original invoice date.
* **Revision History:**
  * Each invoice shall have a "Version History" panel showing all revisions.
  * The user can view any previous version side-by-side with the current version.
  * A visual diff highlight showing what changed between versions (changed fields highlighted in yellow).
  * The user can "Restore" any previous version, which creates a new revision that matches the old one.
* **Revision Reason:**
  * When creating a revision, the user shall be prompted to enter an optional "Reason for Revision" (free text).
  * Reasons are logged in the audit trail.
* **Revised Invoice Indicator:**
  * Revised invoices shall display a small "REVISED" badge on the invoice itself (configurable — can be turned off).
  * In the Invoice Gallery, revised invoices show a revision icon and count (e.g., "Rev 2").
* **Bulk Revision:**
  * If a data error affects multiple invoices (e.g., wrong tax rate applied), the user shall be able to select multiple invoices and apply a bulk revision (e.g., change tax rate from 18% to 12% for all selected).

---

### **6.5 MODULE 5: Invoice Size & Format Options**

**FR-5.1: Predefined Paper Sizes**

| Size Name      | Dimensions          | Common Use                  |
| -------------- | ------------------- | --------------------------- |
| A4             | 210 × 297 mm       | Standard international      |
| A5             | 148 × 210 mm       | Half-page / compact invoice |
| US Letter      | 8.5 × 11 in        | Standard US                 |
| US Legal       | 8.5 × 14 in        | Legal documents             |
| Receipt (80mm) | 80 × variable mm   | Thermal receipt printers    |
| Custom         | User-defined W × H | Any custom requirement      |

**FR-5.2: Orientation**

* Portrait (default)
* Landscape
* Auto (based on template design)

**FR-5.3: Margin Control**

* Top, Bottom, Left, Right margins individually adjustable (in mm or inches).
* Preset margin profiles: Normal, Narrow, Wide.

**FR-5.4: Export Formats**

| Format                 | Details                                                        |
| ---------------------- | -------------------------------------------------------------- |
| **PDF (Single)** | One PDF file per invoice                                       |
| **PDF (Merged)** | All invoices in a single multi-page PDF                        |
| **PDF (ZIP)**    | Individual PDF files bundled in a ZIP archive                  |
| **PNG / JPG**    | Image export for each invoice (configurable DPI: 72, 150, 300) |
| **Print Direct** | Send directly to a connected printer from the browser          |

**FR-5.5: File Naming Convention**

* Configurable naming pattern for exported files:
  * `{invoice_number}.pdf`
  * `{first_name}_{last_name}_{invoice_number}.pdf`
  * `{category}_{invoice_number}.pdf`
  * Custom pattern using field variables

---

### **6.6 MODULE 6: [NEW] Enhanced Audit & Financial Analytics System**

This module is a core differentiator of InvoiceForge. It transforms the original Excel source data into a comprehensive financial audit document by generating an enhanced duplicate Excel file with additional calculated columns and summary sheets.

**FR-6.1: Audit Excel Generation (Duplicate with Enhanced Columns)**

* After invoice generation (or on-demand at any time), the system shall generate an **Audit Excel File** — a duplicate of the original source Excel with the following enhancements:

**Original Columns (Preserved Exactly):**
All columns from the source Excel are carried over unchanged.

**New Columns Added Automatically:**

| Column Name                | Data Type  | Description                                                         | Calculation Logic                                                              |
| -------------------------- | ---------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `invoice_number`         | Text       | The invoice number assigned to this row                             | From invoice generation engine                                                 |
| `invoice_status`         | Text       | Generation status                                                   | "Generated", "Error", "Skipped", "Revised (Rev X)"                             |
| `invoice_generated_date` | Date       | When the invoice was generated                                      | Timestamp from generation                                                      |
| `invoice_file_path`      | Text       | Local file path to the generated PDF                                | System-generated path                                                          |
| `subtotal`               | Currency   | Cost before tax and discount                                        | Directly from source amount or calculated from qty × unit_price               |
| `discount_amount`        | Currency   | Discount applied                                                    | Based on configured discount rate                                              |
| `tax_rate_applied`       | Percentage | Tax rate that was applied                                           | From template/global settings                                                  |
| `tax_amount`             | Currency   | Tax amount calculated                                               | subtotal × tax_rate                                                           |
| `total_amount`           | Currency   | Final invoice total                                                 | subtotal - discount + tax                                                      |
| `cost_price`             | Currency   | The actual cost to the agency (if provided in source or configured) | From source column or manual entry                                             |
| `margin_amount`          | Currency   | Profit margin per invoice                                           | total_amount - cost_price                                                      |
| `margin_percentage`      | Percentage | Profit margin as a percentage                                       | (margin_amount / total_amount) × 100                                          |
| `profit_category`        | Text       | Profitability classification                                        | "High" (>30%), "Medium" (15-30%), "Low" (5-15%), "Minimal" (<5%), "Loss" (<0%) |
| `ai_description_used`    | Text       | The AI-generated description placed on the invoice                  | From AI module                                                                 |
| `qr_verification_hash`   | Text       | The QR code verification hash                                       | From QR module                                                                 |
| `template_used`          | Text       | Which template was applied                                          | Template name                                                                  |
| `language_used`          | Text       | Which language was used for labels                                  | Language code                                                                  |
| `revision_count`         | Number     | How many times this invoice was revised                             | 0, 1, 2, etc.                                                                  |
| `latest_revision_date`   | Date       | Date of most recent revision (if any)                               | Timestamp or blank                                                             |
| `notes`                  | Text       | Any system-generated notes (warnings, errors)                       | Auto-populated                                                                 |

**FR-6.2: Cost Price Configuration**

* The system shall support cost price data in two ways:
  1. **From Excel Source:** If the source Excel contains a column mappable to "cost price" (e.g., "purchase_price", "base_cost", "agency_cost"), the system auto-uses it.
  2. **Manual / Global Configuration:** If no cost price column exists, the user can:
     * Set a global cost percentage (e.g., "Our cost is 70% of the ticket price") — the system calculates cost_price as 70% of the invoice amount.
     * Set a fixed cost per category (e.g., Movie = ₹300 cost, Tour = ₹5000 cost).
     * Set cost per row manually in the data preview table (adding a virtual "cost_price" column).
  3. **No Cost Data:** If no cost price is available and not configured, the margin columns shall display "N/A — Cost data not provided."

**FR-6.3: Audit Excel Summary Sheets**
The Audit Excel shall contain multiple sheets:

**Sheet 1: "Invoice Data" (Main Sheet)**

* All original columns + all new audit columns as described above.
* Formatted as a proper Excel table with filters enabled on every column.
* Conditional formatting:
  * Green fill for "Generated" status
  * Red fill for "Error" status
  * Yellow fill for "Revised" status
  * Red text for negative margins (loss)
  * Bold for total_amount column

**Sheet 2: "Financial Summary"**

* A dashboard-style summary sheet with the following calculated sections:

<pre><div class="not-prose my-0 flex w-full flex-col overflow-clip border border-border text-text-primary rounded-lg not-prose relative" data-code-block="true" bis_skin_checked="1"><div class="border-border flex items-center justify-between border-b px-4 py-2" bis_skin_checked="1"><div class="flex items-center gap-2" bis_skin_checked="1"><svg width="14" stroke-width="1.5" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-text-secondary"><path d="M9.00001 21L8.00001 21C6.89544 21 6.00001 20.1057 6.00001 19.0011C6.00001 17.4501 6.00001 15.3443 6 14C6 13 4.5 12 4.5 12C4.5 12 6.00001 11 6.00001 10C6.00001 8.827 6.00001 6.62207 6.00001 4.99914C6.00001 3.89457 6.89544 3 8.00001 3L9.00001 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 21L16 21C17.1046 21 18 20.1057 18 19.0011C18 17.4501 18 15.3443 18 14C18 13 19.5 12 19.5 12C19.5 12 18 11 18 10C18 8.827 18 6.62207 18 4.99914C18 3.89457 17.1046 3 16 3L15 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="text-text-secondary text-sm font-medium">text</span></div><button class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 focus-visible:ring-offset-surface-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 text-sm text-interactive-active hover:text-interactive-normal active:text-text-tertiary font-normal relative rounded-lg p-[6px]" type="button" data-state="closed" data-slot="tooltip-trigger"><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-interactive-positive absolute inset-0 m-auto rotate-90 opacity-0 transition-all duration-300"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="absolute inset-0 m-auto opacity-100 transition-opacity duration-300"><path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div><div class="code-block_container__lbMX4" bis_skin_checked="1"><pre class="shiki github-dark shiki-code-block" tabindex="0"><code class="whitespace-pre-wrap break-words"><span class="line"><span>═══════════════════════════════════════════</span></span>
<span class="line"><span>           FINANCIAL SUMMARY REPORT</span></span>
<span class="line"><span>     Generated by InvoiceForge on {date}</span></span>
<span class="line"><span>═══════════════════════════════════════════</span></span>
<span class="line"><span></span></span>
<span class="line"><span>OVERVIEW</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>Total Invoices Generated:          247</span></span>
<span class="line"><span>Total Invoices with Errors:          3</span></span>
<span class="line"><span>Total Invoices Revised:              5</span></span>
<span class="line"><span>Total Invoices Skipped:              0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>REVENUE</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>Gross Revenue (Sum of all totals):     ₹12,45,800.00</span></span>
<span class="line"><span>Total Discounts Given:                 ₹45,200.00</span></span>
<span class="line"><span>Total Tax Collected:                   ₹1,89,540.00</span></span>
<span class="line"><span>Net Revenue (after discounts):         ₹12,00,600.00</span></span>
<span class="line"><span></span></span>
<span class="line"><span>PROFITABILITY (if cost data available)</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>Total Cost Price:                      ₹8,40,420.00</span></span>
<span class="line"><span>Total Profit (Margin):                 ₹3,60,180.00</span></span>
<span class="line"><span>Overall Margin Percentage:             30.0%</span></span>
<span class="line"><span>Highest Single Invoice Profit:         ₹15,200.00 (INV-2025-26-0089)</span></span>
<span class="line"><span>Lowest Single Invoice Profit:          -₹800.00 (INV-2025-26-0132) ⚠️ LOSS</span></span>
<span class="line"><span>Average Profit per Invoice:            ₹1,458.62</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CATEGORY BREAKDOWN</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>Movie Tickets:    87 invoices  | Revenue: ₹2,34,500  | Margin: 25.3%</span></span>
<span class="line"><span>Hotel Bookings:   45 invoices  | Revenue: ₹4,50,000  | Margin: 32.1%</span></span>
<span class="line"><span>Tour Packages:    62 invoices  | Revenue: ₹3,72,000  | Margin: 35.7%</span></span>
<span class="line"><span>Flight Tickets:   53 invoices  | Revenue: ₹1,89,300  | Margin: 22.4%</span></span>
<span class="line"><span></span></span>
<span class="line"><span>TOP 10 HIGHEST VALUE INVOICES</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>1. INV-2025-26-0089 | Rajesh Kumar    | ₹52,000 | Tour Package</span></span>
<span class="line"><span>2. INV-2025-26-0156 | Priya Sharma    | ₹48,500 | Hotel Booking</span></span>
<span class="line"><span>... (continues)</span></span></code></pre></div></div></pre>

**Sheet 3: "Category Analysis"**

* Pivot-table-style breakdown by category.
* Columns: Category, Invoice Count, Total Revenue, Total Cost, Total Profit, Avg Margin %, Min Amount, Max Amount, Avg Amount.

**Sheet 4: "Error & Warning Log"**

* Row-level log of all validation errors, generation errors, and warnings.
* Columns: Row Number, Customer Name, Error Type, Error Message, Resolution Status.

**Sheet 5: "Revision History"**

* List of all revised invoices with: Invoice Number, Original Date, Revision Date, Revision Number, What Changed, Reason for Revision.

**FR-6.4: Audit Excel Download**

* The Audit Excel shall be downloadable from:
  * The "Generate" page (after generation completes, a "Download Audit Report" button appears)
  * The "History" page (each batch has an "Audit Report" download link)
  * The Dashboard (if the latest batch is displayed)
* File naming: `InvoiceForge_Audit_{batch_id}_{date}.xlsx`

**FR-6.5: On-Screen Audit Dashboard**

* In addition to the downloadable Excel, the application shall display a **visual audit dashboard** within the UI:
  * Revenue chart (bar chart by category)
  * Profit margin gauge (overall %)
  * Invoice status breakdown (pie chart: Generated, Errors, Revised, Skipped)
  * Profitability distribution (histogram of margin percentages)
  * Top 5 and Bottom 5 invoices by profit
* Dashboard data updates automatically after each generation batch.

**FR-6.6: Audit Data Integrity**

* The Audit Excel shall include a hidden "Metadata" sheet containing:
  * Generation timestamp
  * Source file name and hash (to verify which Excel it was generated from)
  * InvoiceForge version
  * Template(s) used
  * AI model used (if applicable)
  * This prevents confusion about which data produced which audit.

---

### **6.7 MODULE 7: User Interface & Navigation**

**FR-7.1: Design Philosophy**

* Apple-inspired design language: Clean whites, generous whitespace, subtle shadows, smooth animations, SF Pro-like typography (Inter or system fonts), rounded corners, frosted glass effects where appropriate.
* Minimal visual clutter. Every element must have a clear purpose.
* Micro-interactions on hover, click, and transitions for a polished feel.

**FR-7.2: Application Layout**

<pre><div class="not-prose my-0 flex w-full flex-col overflow-clip border border-border text-text-primary rounded-lg not-prose relative" data-code-block="true" bis_skin_checked="1"><div class="border-border flex items-center justify-between border-b px-4 py-2" bis_skin_checked="1"><div class="flex items-center gap-2" bis_skin_checked="1"><svg width="14" stroke-width="1.5" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-text-secondary"><path d="M9.00001 21L8.00001 21C6.89544 21 6.00001 20.1057 6.00001 19.0011C6.00001 17.4501 6.00001 15.3443 6 14C6 13 4.5 12 4.5 12C4.5 12 6.00001 11 6.00001 10C6.00001 8.827 6.00001 6.62207 6.00001 4.99914C6.00001 3.89457 6.89544 3 8.00001 3L9.00001 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 21L16 21C17.1046 21 18 20.1057 18 19.0011C18 17.4501 18 15.3443 18 14C18 13 19.5 12 19.5 12C19.5 12 18 11 18 10C18 8.827 18 6.62207 18 4.99914C18 3.89457 17.1046 3 16 3L15 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="text-text-secondary text-sm font-medium">text</span></div><button class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 focus-visible:ring-offset-surface-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 text-sm text-interactive-active hover:text-interactive-normal active:text-text-tertiary font-normal relative rounded-lg p-[6px]" type="button" data-state="closed" data-slot="tooltip-trigger"><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-interactive-positive absolute inset-0 m-auto rotate-90 opacity-0 transition-all duration-300"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="absolute inset-0 m-auto opacity-100 transition-opacity duration-300"><path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div><div class="code-block_container__lbMX4" bis_skin_checked="1"><pre class="shiki github-dark shiki-code-block" tabindex="0"><code class="whitespace-pre-wrap break-words"><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Top Bar: Logo  |  Search  |  Notifications  |  Dark Mode  | │</span></span>
<span class="line"><span>│           Settings  |  User                                  │</span></span>
<span class="line"><span>├──────────────┬───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│              │                                               │</span></span>
<span class="line"><span>│   Sidebar    │             Main Content Area                 │</span></span>
<span class="line"><span>│   Navigation │                                               │</span></span>
<span class="line"><span>│              │                                               │</span></span>
<span class="line"><span>│  ● Dashboard │                                               │</span></span>
<span class="line"><span>│  ● Data      │                                               │</span></span>
<span class="line"><span>│    Source     │                                               │</span></span>
<span class="line"><span>│  ● Validate  │                                               │</span></span>
<span class="line"><span>│    Excel     │                                               │</span></span>
<span class="line"><span>│  ● Templates │                                               │</span></span>
<span class="line"><span>│  ● Generate  │                                               │</span></span>
<span class="line"><span>│  ● Invoice   │                                               │</span></span>
<span class="line"><span>│    Gallery   │                                               │</span></span>
<span class="line"><span>│  ● Audit &   │                                               │</span></span>
<span class="line"><span>│    Reports   │                                               │</span></span>
<span class="line"><span>│  ● History   │                                               │</span></span>
<span class="line"><span>│  ● Backup    │                                               │</span></span>
<span class="line"><span>│  ● Settings  │                                               │</span></span>
<span class="line"><span>│              │                                               │</span></span>
<span class="line"><span>├──────────────┴───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  Status Bar: Connection  |  AI Status  |  FY: 2025-26  | v1.1│</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div></div></pre>

**FR-7.3: Navigation Pages**

| Page                      | Purpose                                     | Key Elements                                                                                                                                          |
| ------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**       | Overview & quick actions                    | Stats cards (total invoices, revenue, profit margin, AI status), recent activity feed, quick-action buttons, revenue chart, audit summary mini-widget |
| **Data Source**     | Excel upload & data management              | Drag-and-drop upload, sample Excel downloads, data preview table, column mapping, validation report, filter/search, inline editing                    |
| **Validate Excel**  | **[NEW]** Standalone file validation  | Upload zone for validation-only, validation report card, fix suggestions, "Import This File" shortcut                                                 |
| **Templates**       | Browse, preview, customize                  | Template gallery with category filter tabs, "Create New" button, template editor with live preview, language selection, QR toggle                     |
| **Generate**        | Configure & execute generation              | Step-by-step wizard (Data → Template → Settings → AI → Preview → Generate), dry-run preview carousel, AI cost estimator, progress bar            |
| **Invoice Gallery** | View & manage generated invoices            | Grid/list view of invoice thumbnails, revision badges, click to preview, batch export, search/filter, revision history per invoice                    |
| **Audit & Reports** | **[NEW]** Financial audit dashboard   | Visual charts (revenue, margins, categories), audit Excel download, profitability analysis, error summary                                             |
| **History**         | Log of all generation batches               | Timestamped batch list, invoice counts, audit download links, re-download generated files                                                             |
| **Backup**          | **[NEW]** Backup & restore management | Backup schedule, manual backup trigger, restore from backup, backup file list                                                                         |
| **Settings**        | Application configuration                   | Gemini API key & usage, company info, default tax, financial year config, white-label branding, language packs, export preferences, theme             |

**FR-7.4: Dark Mode**

* Full dark mode support togglable from top bar or settings.
* System preference auto-detection.

**FR-7.5: Responsive Design**

* Fully responsive for screen widths from 1024px to 2560px.
* Tablet (768px-1024px): collapsed sidebar with hamburger menu.
* Mobile (<768px): out of scope for v1 but layout should not break.

**FR-7.6: Keyboard Shortcuts**

| Shortcut     | Action                      |
| ------------ | --------------------------- |
| Ctrl/Cmd + U | Upload Excel                |
| Ctrl/Cmd + G | Generate invoices           |
| Ctrl/Cmd + E | Export all                  |
| Ctrl/Cmd + S | Save template               |
| Ctrl/Cmd + K | Open command palette/search |
| Ctrl/Cmd + D | Toggle dark mode            |
| Ctrl/Cmd + P | Preview / Dry run           |
| Ctrl/Cmd + B | Create backup               |
| Esc          | Close modal/overlay         |

**FR-7.7: Command Palette**

* A Spotlight/Alfred-style command palette activated by Ctrl/Cmd + K.
* Allows searching for pages, actions, recent files, invoices by number/name, and settings by typing.
* Recent commands shown as suggestions.

**FR-7.8: [NEW] White-Label Branding Configuration**

* The Settings page shall include a "Branding" section allowing full white-label customization:

| Setting                         | Description                                                             | Default                      |
| ------------------------------- | ----------------------------------------------------------------------- | ---------------------------- |
| **Application Name**      | The name shown in the top bar, browser tab, and login page              | "InvoiceForge"               |
| **Application Logo**      | Upload a custom logo (SVG, PNG) displayed in the top bar and login page | InvoiceForge default logo    |
| **Favicon**               | Upload a custom favicon (ICO, PNG)                                      | InvoiceForge default favicon |
| **Primary Brand Color**   | The accent color used throughout the UI (buttons, links, active states) | Blue (#3B82F6)               |
| **Login Page Background** | Upload a custom background image or set a gradient for the login page   | Default gradient             |
| **Footer Text**           | Custom text shown in the status bar or login footer                     | "Powered by InvoiceForge"    |
| **Welcome Message**       | Custom text shown on the dashboard                                      | "Welcome back!"              |

* All branding changes take effect immediately upon saving (no restart required).
* A "Reset to Default" button restores InvoiceForge's original branding.
* This enables the product to be deployed for multiple clients with each instance looking like a bespoke product.

---

### **6.8 MODULE 8: [NEW] Backup & Restore System**

**FR-8.1: What Gets Backed Up**
A complete backup shall include:

| Component                      | Description                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Database**             | Full SQLite database file (all invoices, templates, settings, history, audit data)               |
| **Uploaded Excel Files** | All source Excel files in `/data/uploads/`                                                     |
| **Generated Invoices**   | All PDF/image files in `/data/invoices/`                                                       |
| **Custom Templates**     | Template configuration data (already in database) + any uploaded template assets (logos, images) |
| **Audit Reports**        | Generated audit Excel files                                                                      |
| **Application Settings** | Including API keys (encrypted), branding assets, language packs                                  |

**FR-8.2: Manual Backup**

* A "Create Backup Now" button on the Backup page.
* The system creates a timestamped compressed archive: `InvoiceForge_Backup_2025-06-15_143200.tar.gz`
* The backup file is saved to a configurable backup directory (default: `/data/backups/`).
* The user can download the backup file directly from the browser.

**FR-8.3: Scheduled Automatic Backups**

* The user shall configure automatic backups:
  * Frequency: Daily, Weekly, Monthly, or Custom (cron expression for advanced users)
  * Time of day: Configurable (default: 2:00 AM)
  * Retention: Number of backups to keep (default: 7 — older backups auto-deleted)
  * Backup directory: Configurable path (can be a network drive or mounted external storage)
* Backup status shall be shown on the Dashboard and Backup page: "Last backup: 2 hours ago — 245 MB"

**FR-8.4: Restore from Backup**

* The Backup page shall list all available backup files (from the backup directory) with:
  * Timestamp
  * File size
  * Version of InvoiceForge that created it
  * Quick summary (X invoices, Y templates, Z source files)
* The user can select a backup and click "Restore."
* **Restore confirmation:** A modal shall warn: *"Restoring will replace ALL current data with the backup data. This action cannot be undone. Current data will be backed up automatically before restoration. Type 'RESTORE' to confirm."*
* The system creates an automatic backup of current data before restoring.
* Restore progress shall be shown with a progress bar.
* After restore, the application reloads with the restored data.

**FR-8.5: Backup Integrity Verification**

* Each backup file shall include a checksum (SHA-256).
* Before restoration, the system verifies the backup file integrity.
* If verification fails, the restore is blocked with an error: *"Backup file appears corrupted. Checksum mismatch."*

---

### **6.9 MODULE 9: Data Privacy & Local Deployment**

**FR-9.1: Self-Hosted Architecture**

* The entire application (frontend + backend + database) shall be deployable on a single machine or local server.
* No external service dependencies except the optional Gemini API call (which the user explicitly enables).
* All uploaded Excel files, generated invoices, templates, and configurations shall be stored locally on the server's filesystem and/or local database.

**FR-9.2: No Telemetry**

* The application shall not send any usage data, analytics, or telemetry to any external server.
* No third-party tracking scripts.

**FR-9.3: Data Storage**

* Excel files: Stored in a configurable local directory (e.g., `/data/uploads/`)
* Generated invoices: Stored in a configurable local directory (e.g., `/data/invoices/`)
* Audit reports: Stored in `/data/audits/`
* Backups: Stored in `/data/backups/`
* Database: SQLite (default, zero-configuration) or PostgreSQL (optional, for larger deployments)
* Configuration: Stored in database + `.env` file for sensitive values

**FR-9.4: Deployment Options**

| Method                   | Description                                                | Use Case                       |
| ------------------------ | ---------------------------------------------------------- | ------------------------------ |
| **Docker Compose** | Single `docker-compose up` command to start all services | Recommended for local servers  |
| **Manual Setup**   | Install Node.js + backend + DB separately                  | Advanced users / custom setups |
| **Cloud Demo**     | Deploy to free tier services for client demo               | Initial testing only           |

**FR-9.5: Cloud Demo Deployment (Initial Testing)**

* For the initial client demonstration, the application shall be deployed on free-tier cloud services:
  * **Frontend:** Vercel or Netlify (free tier)
  * **Backend:** Render, Railway, or Fly.io (free tier)
  * **Database:** SQLite (embedded with the backend) or a cloud database alternative (see Technical Architecture section for recommended services)
* The cloud demo shall have identical functionality to the local deployment.
* A clear disclaimer shall be shown: *"This is a demo instance. For production use, deploy on your own server."*

---

## **7. NON-FUNCTIONAL REQUIREMENTS**

### 7.1 Performance

| Metric                                       | Target                               |
| -------------------------------------------- | ------------------------------------ |
| Excel file upload (10,000 rows)              | < 5 seconds to parse and display     |
| Excel file validation (standalone validator) | < 3 seconds for 10,000 rows          |
| Single invoice generation                    | < 1 second                           |
| Bulk generation (500 invoices)               | < 60 seconds (excluding AI calls)    |
| Excel file upload (10,000 rows) | < 5 seconds to parse and display |
| Excel file validation (standalone validator) | < 3 seconds for 10,000 rows |
| Single invoice generation | < 1 second |
| Bulk generation (500 invoices) | < 60 seconds (excluding AI calls) |
| AI description generation per row | < 3 seconds (depends on API latency) |
| QR code generation per invoice | < 100 milliseconds |
| Dry-run preview (5 invoices) | < 3 seconds |
| Page load time | < 2 seconds on localhost |
| PDF export (single) | < 2 seconds |
| PDF export (500 merged) | < 30 seconds |
| Audit Excel generation (500 rows) | < 10 seconds |
| Backup creation (1 GB data) | < 60 seconds |
| Backup restoration | < 120 seconds |

### 7.2 Scalability

* The system shall handle Excel files with up to 50,000 rows without degradation.
* The system shall handle up to 10,000 invoices in a single generation batch.
* The audit system shall handle financial calculations for up to 50,000 rows.

### 7.3 Security

* API keys stored encrypted (AES-256) in the database.
* Basic authentication (username + password) for the web interface.
* Optional: HTTPS configuration guide for local deployment.
* Session timeout after 30 minutes of inactivity.
* No default passwords; user must set password on first launch.
* Backup files optionally password-protected.
* QR verification hashes use HMAC-SHA256 with a configurable secret key.

### 7.4 Reliability

* The system shall gracefully handle:
  * Malformed Excel files (with clear error messages via the Validator)
  * Gemini API failures (fallback to template descriptions)
  * Browser disconnection during generation (resume or restart capability)
  * Disk space warnings (alert when storage is below threshold)
  * Backup failures (retry + notification)

### 7.5 Compatibility

* **Browsers:** Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
* **OS (Server):** Ubuntu 20.04+, Windows 10/11, macOS 12+
* **OS (Client Browser):** Any modern OS with a supported browser
* **Excel Formats:** .xlsx (Office 2007+), .xls (legacy), .csv (UTF-8)
* **Audit Excel Output:** .xlsx (compatible with Excel 2016+, Google Sheets, LibreOffice Calc)

---

## **8. TECHNICAL ARCHITECTURE**

| **Firebase (Firestore)**      | Document DB           | Generous free tier                          | ❌ Not directly                | ❌ Cloud only               | Works in India, but document model is less ideal for this use case.                                                                      |

**Recommended Strategy:**

* **For Local Deployment (Production):** SQLite via Prisma — zero configuration, no external dependencies, data stays local. This is already in our architecture and does NOT change.
* **For Cloud Demo:** **Turso** (most compatible since it's SQLite-based, matching our local setup) OR **Neon** (if PostgreSQL is preferred for the demo).
* **For a Self-Hosted BaaS Experience:** **PocketBase** — if the client later wants auth, realtime, and file storage as a managed layer on their own server.

### 8.5 [NEW] About AI Agent Backend Integration

The backend shall incorporate AI agent orchestration capabilities using:

| Technology                        | Purpose                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Vercel AI SDK**           | Streamlined integration with Gemini and other LLMs, supports streaming, tool calling, and structured outputs |
| **LangChain.js** (optional) | For more complex AI workflows — chaining prompts, memory, retrieval augmented generation                    |

These enable the Gemini integration to go beyond simple prompt→response and support:

* **Consistency Mode Agent:** An AI agent that maintains conversation context across batch processing, ensuring description consistency without re-sending the full style reference each time.
* **Smart Column Mapping Agent:** An AI agent that reads the Excel headers and intelligently suggests column mappings based on context (e.g., recognizing "Traveller Name" maps to "first_name + last_name").
* **Audit Insight Agent:** An AI agent that analyzes the audit data and generates natural-language insights (e.g., "Movie ticket bookings have a 15% lower margin than tour packages. Consider renegotiating supplier rates for entertainment bookings.").

---

## **9. USER FLOW DIAGRAMS**

### 9.1 Primary Flow: Bulk Invoice Generation (Updated)

<pre><div class="not-prose my-0 flex w-full flex-col overflow-clip border border-border text-text-primary rounded-lg not-prose relative" data-code-block="true" bis_skin_checked="1"><div class="border-border flex items-center justify-between border-b px-4 py-2" bis_skin_checked="1"><div class="flex items-center gap-2" bis_skin_checked="1"><svg width="14" stroke-width="1.5" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-text-secondary"><path d="M9.00001 21L8.00001 21C6.89544 21 6.00001 20.1057 6.00001 19.0011C6.00001 17.4501 6.00001 15.3443 6 14C6 13 4.5 12 4.5 12C4.5 12 6.00001 11 6.00001 10C6.00001 8.827 6.00001 6.62207 6.00001 4.99914C6.00001 3.89457 6.89544 3 8.00001 3L9.00001 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 21L16 21C17.1046 21 18 20.1057 18 19.0011C18 17.4501 18 15.3443 18 14C18 13 19.5 12 19.5 12C19.5 12 18 11 18 10C18 8.827 18 6.62207 18 4.99914C18 3.89457 17.1046 3 16 3L15 3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="text-text-secondary text-sm font-medium">text</span></div><button class="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 focus-visible:ring-offset-surface-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 text-sm text-interactive-active hover:text-interactive-normal active:text-text-tertiary font-normal relative rounded-lg p-[6px]" type="button" data-state="closed" data-slot="tooltip-trigger"><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="text-interactive-positive absolute inset-0 m-auto rotate-90 opacity-0 transition-all duration-300"><path d="M5 13L9 17L19 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg><svg width="16" height="16" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" class="absolute inset-0 m-auto opacity-100 transition-opacity duration-300"><path d="M19.4 20H9.6C9.26863 20 9 19.7314 9 19.4V9.6C9 9.26863 9.26863 9 9.6 9H19.4C19.7314 9 20 9.26863 20 9.6V19.4C20 19.7314 19.7314 20 19.4 20Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15 9V4.6C15 4.26863 14.7314 4 14.4 4H4.6C4.26863 4 4 4.26863 4 4.6V14.4C4 14.7314 4.26863 15 4.6 15H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div><div class="code-block_container__lbMX4" bis_skin_checked="1"><pre class="shiki github-dark shiki-code-block" tabindex="0"><code class="whitespace-pre-wrap break-words"><span class="line"><span>START</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[1. User logs in]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[2. Dashboard — Click "Upload Excel" or navigate to Data Source]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ├── [Optional: Download Sample Excel first]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ├── [Optional: Navigate to "Validate Excel" to check file first]</span></span>
<span class="line"><span>  │       │</span></span>
<span class="line"><span>  │       ▼</span></span>
<span class="line"><span>  │   [Upload file for validation only]</span></span>
<span class="line"><span>  │       │</span></span>
<span class="line"><span>  │       ▼</span></span>
<span class="line"><span>  │   [View validation report — fix errors if any]</span></span>
<span class="line"><span>  │       │</span></span>
<span class="line"><span>  │       ▼</span></span>
<span class="line"><span>  │   [Click "Import This File" to proceed]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[3. Drag & drop or browse to upload .xlsx file]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[4. System parses file → displays preview table]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[5. System auto-maps columns (AI-assisted) → user verifies/adjusts]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[6. Data validation runs → errors shown → user fixes or skips]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[7. User navigates to "Generate" page]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[8. Step 1: Confirm data source summary]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[9. Step 2: Select template (or auto-map by category)]</span></span>
<span class="line"><span>  │        └── Configure language, QR code settings</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[10. Step 3: Configure settings]</span></span>
<span class="line"><span>  │        ├── Invoice numbering (with financial year)</span></span>
<span class="line"><span>  │        ├── Tax / discount</span></span>
<span class="line"><span>  │        ├── Paper size / orientation</span></span>
<span class="line"><span>  │        ├── Export format</span></span>
<span class="line"><span>  │        └── Cost price (for audit margin calculations)</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[11. Step 4: AI Descriptions]</span></span>
<span class="line"><span>  │        ├── View API cost estimate</span></span>
<span class="line"><span>  │        ├── Confirm or skip AI</span></span>
<span class="line"><span>  │        ├── If ON → Generate descriptions</span></span>
<span class="line"><span>  │        └── Review / edit descriptions</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[12. Step 5: Dry-Run Preview]  ← NEW</span></span>
<span class="line"><span>  │        ├── View 5 sample invoices</span></span>
<span class="line"><span>  │        ├── Verify template, QR codes, numbering, descriptions</span></span>
<span class="line"><span>  │        └── "Proceed" or "Go Back & Adjust"</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[13. Step 6: Generate All Invoices]</span></span>
<span class="line"><span>  │        └── Progress bar with ETA</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[14. Generation Complete]</span></span>
<span class="line"><span>  │        ├── Invoice Gallery → preview thumbnails</span></span>
<span class="line"><span>  │        ├── Audit Dashboard → financial summary</span></span>
<span class="line"><span>  │        └── Download Audit Excel</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[15. Export: Single PDF / Merged PDF / ZIP / Print]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>[16. Optional: Revise individual invoices if needed]</span></span>
<span class="line"><span>  │</span></span>
<span class="line"><span>  ▼</span></span>
<span class="line"><span>END</span></span></code></pre></div></div></pre>

---

## **10. MILESTONES & TIMELINE**

| Phase             | Milestone                   | Duration   | Deliverables                                                                                                                                                                                                     |
| ----------------- | --------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1** | Foundation & Setup          | Week 1-2   | Project scaffolding, Docker setup, database schema (with all new tables), auth system, basic UI shell with sidebar navigation, white-label branding settings                                                     |
| **Phase 2** | Data Source Module          | Week 3-4   | Excel upload, parsing, preview table, column mapping, validation, inline editing, source swap,**sample Excel downloads** , **standalone Excel validator tool**                                       |
| **Phase 3** | Template System             | Week 5-7   | 8 pre-made templates, template gallery, visual template editor, category-to-template mapping,**multi-language label system** (12 languages + custom packs), **QR code placement in template editor** |
| **Phase 4** | Invoice Generation Core     | Week 8-9   | Single & bulk generation, PDF/image export,**financial year numbering system** , tax/discount, paper sizes, file naming,  **QR code generation engine** , **dry-run preview system**           |
| **Phase 5** | AI Integration              | Week 10-11 | Gemini API integration, prompt engine, consistency mode, batch processing, description review UI,**API cost estimator** , AI-assisted column mapping                                                       |
| **Phase 6** | Audit & Financial Analytics | Week 12-13 | **Complete audit module** : enhanced Excel generation with financial columns, summary sheets, category analysis, error logs, revision tracking. On-screen audit dashboard with charts.                     |
| **Phase 7** | Revision, Backup & Polish   | Week 14-15 | **Invoice revision system** (versioning, diff, bulk revision). **Backup & restore** (manual + scheduled). Dashboard finalization, dark mode, animations, keyboard shortcuts, command palette.        |
| **Phase 8** | Testing & Demo Deploy       | Week 16-17 | Unit tests, integration tests, Excel validator edge cases, AI consistency tests, audit calculation accuracy tests, UAT, deploy to free cloud service (with Turso/Neon DB) for client demo                        |
| **Phase 9** | Local Deployment & Handoff  | Week 18    | Docker deployment on client server, documentation, admin guide, user training, handoff                                                                                                                           |

**Total Estimated Timeline: 18 weeks (approximately 4.5 months)**

*Note: Timeline increased by 3 weeks from v1.0 due to the addition of the Audit module, Revision system, Backup system, QR codes, Multi-language support, Validator tool, and Dry-run preview.*

---

## **11. RISKS & MITIGATION**

| Risk                                                             | Likelihood | Impact | Mitigation                                                                                              |
| ---------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------- |
| Gemini API rate limiting on free tier                            | High       | Medium | Cost estimator warns users, aggressive caching, allow paid API key, non-AI fallback                     |
| Complex Excel files with merged cells, formulas, multiple sheets | Medium     | High   | Standalone Validator tool catches issues early, sample templates guide users, clear error messages      |
| PDF rendering inconsistencies across browsers                    | Medium     | Medium | Server-side rendering (Puppeteer) for PDFs, not client-side                                             |
| Free cloud demo services shutting down or rate limiting          | Medium     | Low    | Backup deployment on alternative services, Docker setup always ready                                    |
| Audit margin calculations incorrect if cost data is poor         | Medium     | High   | Multiple cost input methods (column, percentage, manual), clear "N/A" when no data, validation warnings |
| Client requests features beyond PRD scope mid-development        | High       | Medium | Formal change request process, clearly documented scope                                                 |
| Large file performance (50K+ rows)                               | Low        | High   | Virtual scrolling, pagination, chunked processing, web workers                                          |
| Backup files consuming excessive disk space                      | Medium     | Low    | Configurable retention policy, compression, size warnings                                               |
| QR verification URLs not accessible outside local network        | Medium     | Medium | For local deployments, QR encodes full data (no URL needed); URL verification is supplementary          |
| Financial year rollover bugs                                     | Low        | High   | Extensive unit tests for date boundary cases, manual override always available                          |

---

## **12. SUCCESS METRICS**

| Metric                                                        | Target                     |
| ------------------------------------------------------------- | -------------------------- |
| Time to generate 100 invoices (end-to-end from upload)        | < 5 minutes including AI   |
| Invoice accuracy (no data mismatch between Excel and invoice) | 100%                       |
| Audit Excel financial calculations accuracy                   | 100%                       |
| Client satisfaction with UI/UX (demo feedback)                | ≥ 4/5 rating              |
| Successful local deployment time                              | < 30 minutes with Docker   |
| Template customization: time to modify a template             | < 5 minutes for a new user |
| Excel validation: time to validate a 10K-row file             | < 3 seconds                |
| Dry-run preview rendering time                                | < 3 seconds for 5 previews |
| Backup creation time (1 GB)                                   | < 60 seconds               |
| System uptime on local server                                 | 99.9%                      |

---

## **13. ACCEPTANCE CRITERIA (Version 1.1 Release)**

* [ ] User can download sample Excel templates for all 7 industry categories.
* [ ] Excel Validator tool correctly identifies and reports all validation check types (merged cells, empty rows, type mismatches, etc.).
* [ ] User can upload an Excel file and see parsed data in a preview table.
* [ ] User can swap the Excel source file without losing previously generated invoices.
* [ ] Column auto-detection correctly maps at least 80% of standard headers.
* [ ] All 8 pre-made templates render correctly with sample data.
* [ ] User can customize any template (colors, fonts, logo, fields, QR, language) and save it.
* [ ] Category-to-template auto-mapping works for mixed-category Excel files.
* [ ] Multi-language labels render correctly for all 12 preset languages.
* [ ] QR codes generate on invoices when enabled, and scanning verifies the invoice data.
* [ ] Gemini AI generates consistent, professional descriptions for all booking types.
* [ ] AI descriptions follow the same structural pattern across a batch (consistency mode).
* [ ] API cost estimator displays accurate estimates before batch AI generation.
* [ ] Dry-run preview renders 5 sample invoices accurately before bulk generation.
* [ ] Bulk generation of 500 invoices completes without errors.
* [ ] Invoice revision system creates new versions, preserves originals, and tracks changes.
* [ ] PDF exports are print-ready and visually match the on-screen preview.
* [ ] All 6 paper sizes render correctly.
* [ ] Audit Excel generates with all specified columns, financial calculations, and summary sheets.
* [ ] Margin and profit calculations are accurate when cost data is provided.
* [ ] Audit Excel category breakdown and financial summary match the on-screen audit dashboard.
* [ ] Backup creates a complete, verifiable archive of all application data.
* [ ] Restore successfully replaces current data with backup data.
* [ ] Scheduled backups execute on time and manage retention correctly.
* [ ] Financial year numbering auto-includes the FY label and resets at year boundaries.
* [ ] White-label branding (name, logo, colors, favicon) applies correctly across all pages.
* [ ] Application runs fully on localhost via Docker Compose with a single command.
* [ ] No data leaves the local server except explicit Gemini API calls.
* [ ] Dark mode is fully functional across all pages including audit dashboard.
* [ ] Command palette and keyboard shortcuts work.
* [ ] Cloud demo instance is accessible for client testing.

---

## **14. GLOSSARY**

| Term                           | Definition                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Source Sheet**         | The single Excel file uploaded by the user containing all invoice data rows                      |
| **Template**             | A predefined or custom invoice layout/design that defines how data is arranged visually          |
| **Category**             | A classification of the booking type (Movie, Hotel, Tour, etc.) used for auto-template selection |
| **Consistency Mode**     | AI feature ensuring all generated descriptions follow the same sentence structure and tone       |
| **Column Mapping**       | The process of linking Excel column headers to invoice data fields                               |
| **Batch Generation**     | Creating multiple invoices simultaneously from the source data                                   |
| **Dry Run**              | A preview generation of sample invoices to verify correctness before full batch generation       |
| **Audit Excel**          | An enhanced duplicate of the source Excel with additional financial columns and summary sheets   |
| **Margin**               | The difference between the invoice total and the cost price (profit per invoice)                 |
| **Financial Year (FY)**  | The accounting year period (e.g., April 2025 - March 2026 = FY 2025-26)                          |
| **Revision**             | An amended version of a previously generated invoice, with change tracking                       |
| **QR Verification Hash** | A cryptographic hash embedded in the QR code to verify invoice authenticity                      |
| **White-Label**          | The ability to rebrand the application with custom name, logo, and colors                        |
| **Command Palette**      | A keyboard-activated search/action interface (similar to macOS Spotlight)                        |
| **Language Pack**        | A set of translations for invoice field labels in a specific language                            |
| **Validator**            | A standalone tool that checks Excel file format and data quality before import                   |
