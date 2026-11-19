/* WorkFlowora — 14 Real Domain-Specific Calculators, Global Tax Comparator & Feature Request Board */
(function () {
  "use strict";

  function fm(val, overrideCurr) {
    return window.WF_STATE ? window.WF_STATE.formatMoney(val, overrideCurr) : "$" + Number(val || 0).toFixed(2);
  }

  function pct(val, digits) {
    var d = typeof digits === "number" ? digits : 1;
    return (isFinite(val) ? val : 0).toFixed(d) + "%";
  }

  function numVal(id, fallback) {
    var el = document.getElementById(id);
    if (!el) return fallback || 0;
    var v = parseFloat(el.value);
    return isFinite(v) ? v : (fallback || 0);
  }

  function strVal(id, fallback) {
    var el = document.getElementById(id);
    return el ? el.value : (fallback || "");
  }

  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ==================== 14 DISTINCT CALCULATORS ====================
  var CALCULATORS = {
    "loan-emi": {
      title: "Loan EMI & Amortization Calculator",
      subtitle: "Standard reducing-balance formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)",
      guideUrl: "/loan-emi-calculation-guide.html",
      guideLabel: "Read Loan EMI Formula Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-group"><label for="emi-principal">Loan Principal Amount</label><input type="number" id="emi-principal" value="250000" min="100" step="1000"></div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="emi-rate">Annual Interest Rate (%)</label><input type="number" id="emi-rate" value="6.75" min="0" max="50" step="0.05"></div>' +
                '<div class="field-group"><label for="emi-years">Loan Tenure (Years)</label><input type="number" id="emi-years" value="20" min="1" max="40" step="1"></div>' +
              '</div>' +
              '<div class="field-group"><label for="emi-extra">Optional Extra Monthly Principal Payment</label><input type="number" id="emi-extra" value="0" min="0" step="50"><span class="field-hint">See how extra principal cuts total interest and tenure.</span></div>' +
            '</div>' +
            '<div class="calc-results" id="emi-out"></div>' +
          '</div>';
      },
      compute: function () {
        var P = Math.max(0, numVal("emi-principal", 250000));
        var annualRate = Math.max(0, numVal("emi-rate", 6.75));
        var years = Math.max(1, Math.min(50, numVal("emi-years", 20)));
        var extra = Math.max(0, numVal("emi-extra", 0));
        var n = Math.round(years * 12);
        var r = annualRate / 12 / 100;

        var emi = r === 0 ? (P / n) : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        var totalPay = emi * n;
        var totalInt = Math.max(0, totalPay - P);

        // Simulate actual payoff with extra payment + yearly table (first 5 years)
        var bal = P;
        var monthsActual = 0;
        var interestActual = 0;
        var yearlyRows = [];
        var yrInt = 0, yrPrin = 0;
        while (bal > 0.01 && monthsActual < 720) {
          monthsActual++;
          var mInt = bal * r;
          var mPrin = Math.min(bal, (emi - mInt) + extra);
          if (mPrin <= 0) break;
          bal = Math.max(0, bal - mPrin);
          interestActual += mInt;
          yrInt += mInt;
          yrPrin += mPrin;
          if (monthsActual % 12 === 0 || bal <= 0.01) {
            if (yearlyRows.length < 5) {
              yearlyRows.push({ yr: Math.ceil(monthsActual / 12), prin: yrPrin, intr: yrInt, endBal: bal });
            }
            yrInt = 0;
            yrPrin = 0;
          }
        }

        var prinPct = totalPay > 0 ? (P / (P + interestActual)) * 100 : 100;
        var intPct = 100 - prinPct;
        var savedInt = Math.max(0, totalInt - interestActual);
        var monthsSaved = Math.max(0, n - monthsActual);

        var rowsHtml = yearlyRows.map(function (row) {
          return '<tr><td>Year ' + row.yr + '</td><td class="num">' + fm(row.prin) + '</td><td class="num">' + fm(row.intr) + '</td><td class="num">' + fm(row.endBal) + '</td></tr>';
        }).join("");

        document.getElementById("emi-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Monthly EMI</div><div class="res-value">' + fm(emi) + '</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Total Interest</div><div class="m-val">' + fm(interestActual) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Total Payment</div><div class="m-val">' + fm(P + interestActual) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Interest Saved (Extra)</div><div class="m-val">' + fm(savedInt) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Payoff Duration</div><div class="m-val">' + (monthsActual / 12).toFixed(1) + ' yrs (' + monthsSaved + ' mo saved)</div></div>' +
          '</div>' +
          '<div class="ratio-bar"><div class="ratio-seg-a" style="width:' + prinPct.toFixed(1) + '%"></div><div class="ratio-seg-b" style="width:' + intPct.toFixed(1) + '%"></div></div>' +
          '<div class="field-hint">Principal ' + pct(prinPct) + ' vs. Interest ' + pct(intPct) + '</div>' +
          '<div class="mini-table-wrap"><table class="mini-table"><thead><tr><th>Period</th><th class="num">Principal</th><th class="num">Interest</th><th class="num">Ending Balance</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>';
      }
    },

    "compound-interest": {
      title: "Compound Interest & Effective APY Calculator",
      subtitle: "Compounds lump sum plus recurring monthly contributions with exact APY conversion",
      guideUrl: "/apr-vs-apy-interest-rate-difference-guide.html",
      guideLabel: "Read APR vs. APY Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="ci-principal">Initial Principal</label><input type="number" id="ci-principal" value="10000" min="0" step="500"></div>' +
                '<div class="field-group"><label for="ci-monthly">Monthly Contribution</label><input type="number" id="ci-monthly" value="500" min="0" step="50"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="ci-rate">Nominal Annual Rate (APR %)</label><input type="number" id="ci-rate" value="8" min="0" max="50" step="0.1"></div>' +
                '<div class="field-group"><label for="ci-years">Time Horizon (Years)</label><input type="number" id="ci-years" value="15" min="1" max="60" step="1"></div>' +
              '</div>' +
              '<div class="field-group"><label for="ci-freq">Compounding Frequency</label><select id="ci-freq"><option value="12" selected>Monthly (12/yr)</option><option value="365">Daily (365/yr)</option><option value="4">Quarterly (4/yr)</option><option value="2">Semi-Annually (2/yr)</option><option value="1">Annually (1/yr)</option></select></div>' +
            '</div>' +
            '<div class="calc-results" id="ci-out"></div>' +
          '</div>';
      },
      compute: function () {
        var P = Math.max(0, numVal("ci-principal", 10000));
        var pmt = Math.max(0, numVal("ci-monthly", 500));
        var r = Math.max(0, numVal("ci-rate", 8)) / 100;
        var t = Math.max(1, Math.min(60, numVal("ci-years", 15)));
        var m = Math.max(1, numVal("ci-freq", 12));

        var apy = (Math.pow(1 + r / m, m) - 1) * 100;
        var monthlyEff = Math.pow(1 + r / m, m / 12) - 1;
        var months = Math.round(t * 12);

        var fvPrincipal = P * Math.pow(1 + r / m, m * t);
        var fvContrib = monthlyEff === 0 ? pmt * months : pmt * ((Math.pow(1 + monthlyEff, months) - 1) / monthlyEff);
        var totalVal = fvPrincipal + fvContrib;
        var totalContrib = P + pmt * months;
        var totalGain = Math.max(0, totalVal - totalContrib);
        var contribPct = totalVal > 0 ? (totalContrib / totalVal) * 100 : 100;

        document.getElementById("ci-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Projected Future Value</div><div class="res-value">' + fm(totalVal) + '</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Total Contributions</div><div class="m-val">' + fm(totalContrib) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Compound Interest Earned</div><div class="m-val">' + fm(totalGain) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Effective Annual Yield (APY)</div><div class="m-val">' + pct(apy, 2) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Growth Multiple</div><div class="m-val">' + (totalContrib > 0 ? (totalVal / totalContrib).toFixed(2) : "0.00") + 'x</div></div>' +
          '</div>' +
          '<div class="ratio-bar"><div class="ratio-seg-a" style="width:' + contribPct.toFixed(1) + '%"></div><div class="ratio-seg-c" style="width:' + (100 - contribPct).toFixed(1) + '%"></div></div>' +
          '<div class="field-hint">Contributions ' + pct(contribPct) + ' vs. Interest Earned ' + pct(100 - contribPct) + '</div>';
      }
    },

    "profit-roas": {
      title: "Profit Margin & Break-Even ROAS Calculator",
      subtitle: "Contribution margin after COGS, fulfillment, payment fees, and target ad profit",
      guideUrl: "/break-even-roas-formula-calculator-guide.html",
      guideLabel: "Read Break-Even ROAS Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="roas-price">Selling Price (AOV)</label><input type="number" id="roas-price" value="80" min="0.01" step="1"></div>' +
                '<div class="field-group"><label for="roas-cogs">Product Cost (COGS)</label><input type="number" id="roas-cogs" value="22" min="0" step="1"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="roas-ship">Shipping &amp; Packaging</label><input type="number" id="roas-ship" value="7.50" min="0" step="0.5"></div>' +
                '<div class="field-group"><label for="roas-fee">Payment Fee (%)</label><input type="number" id="roas-fee" value="2.9" min="0" max="30" step="0.1"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="roas-fixed">Fixed Fee per Order</label><input type="number" id="roas-fixed" value="0.30" min="0" step="0.05"></div>' +
                '<div class="field-group"><label for="roas-target-margin">Desired Net Profit Margin (%)</label><input type="number" id="roas-target-margin" value="20" min="0" max="80" step="1"></div>' +
              '</div>' +
            '</div>' +
            '<div class="calc-results" id="roas-out"></div>' +
          '</div>';
      },
      compute: function () {
        var price = Math.max(0.01, numVal("roas-price", 80));
        var cogs = Math.max(0, numVal("roas-cogs", 22));
        var ship = Math.max(0, numVal("roas-ship", 7.5));
        var feePct = Math.max(0, numVal("roas-fee", 2.9));
        var fixedFee = Math.max(0, numVal("roas-fixed", 0.3));
        var targetNetPct = Math.max(0, numVal("roas-target-margin", 20));

        var paymentCost = price * (feePct / 100) + fixedFee;
        var unitCosts = cogs + ship + paymentCost;
        var contribution = price - unitCosts;
        var marginPct = (contribution / price) * 100;
        var beRoas = contribution > 0 ? price / contribution : Infinity;
        var maxCpa = Math.max(0, contribution);
        var adBudgetPctForTarget = marginPct - targetNetPct;
        var targetRoas = adBudgetPctForTarget > 0 ? (100 / adBudgetPctForTarget) : Infinity;

        var badge = contribution <= 0
          ? '<span class="status-badge status-bad">Negative Unit Margin — Raise Price or Cut Costs</span>'
          : (beRoas <= 2.0
              ? '<span class="status-badge status-good">Strong Paid-Ad Headroom (Break-Even ROAS &le; 2.0x)</span>'
              : '<span class="status-badge status-warn">Tight Margin — Optimize AOV or Bundles</span>');

        document.getElementById("roas-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Break-Even ROAS</div><div class="res-value">' + (isFinite(beRoas) ? beRoas.toFixed(2) + "x" : "N/A") + '</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Contribution Profit / Order</div><div class="m-val">' + fm(contribution) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Pre-Ad Profit Margin</div><div class="m-val">' + pct(marginPct) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Break-Even CPA (Max Ad Spend)</div><div class="m-val">' + fm(maxCpa) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Target ROAS (' + targetNetPct + '% Net)</div><div class="m-val">' + (isFinite(targetRoas) ? targetRoas.toFixed(2) + "x" : "Unachievable") + '</div></div>' +
          '</div>' + badge;
      }
    },

    "freelance-rate": {
      title: "Freelance Hourly & Day Rate Calculator",
      subtitle: "Accounts for non-billable time, overhead expenses, vacation weeks, and tax buffer",
      guideUrl: "/late-payment-fee-interest-invoice-terms-guide.html",
      guideLabel: "Read Invoice & Billing Terms Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="fr-income">Target Annual Net Income</label><input type="number" id="fr-income" value="85000" min="1000" step="1000"></div>' +
                '<div class="field-group"><label for="fr-expenses">Annual Business Expenses</label><input type="number" id="fr-expenses" value="9600" min="0" step="500"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="fr-tax">Tax Reserve Buffer (%)</label><input type="number" id="fr-tax" value="28" min="0" max="60" step="1"></div>' +
                '<div class="field-group"><label for="fr-weeks-off">Unpaid Vacation &amp; Sick Weeks</label><input type="number" id="fr-weeks-off" value="5" min="0" max="25" step="1"></div>' +
              '</div>' +
              '<div class="field-group"><label for="fr-billable">Billable Hours per Working Week</label><input type="number" id="fr-billable" value="25" min="5" max="60" step="1"><span class="field-hint">Most solo consultants average 22–28 billable hrs/wk after admin &amp; sales.</span></div>' +
            '</div>' +
            '<div class="calc-results" id="fr-out"></div>' +
          '</div>';
      },
      compute: function () {
        var netTarget = Math.max(0, numVal("fr-income", 85000));
        var expenses = Math.max(0, numVal("fr-expenses", 9600));
        var taxPct = Math.max(0, Math.min(70, numVal("fr-tax", 28))) / 100;
        var weeksOff = Math.max(0, Math.min(40, numVal("fr-weeks-off", 5)));
        var billablePerWk = Math.max(1, numVal("fr-billable", 25));

        var workingWeeks = Math.max(1, 52 - weeksOff);
        var annualHours = workingWeeks * billablePerWk;
        var preTaxNeeded = netTarget / (1 - taxPct);
        var grossRevenue = preTaxNeeded + expenses;
        var hourlyRate = grossRevenue / annualHours;
        var dayRate = hourlyRate * 8;
        var monthlyRev = grossRevenue / 12;

        document.getElementById("fr-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Minimum Billable Hourly Rate</div><div class="res-value">' + fm(hourlyRate) + '/hr</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Full-Day Rate (8 hrs)</div><div class="m-val">' + fm(dayRate) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Required Annual Gross</div><div class="m-val">' + fm(grossRevenue) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Monthly Billing Target</div><div class="m-val">' + fm(monthlyRev) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Billable Hours / Year</div><div class="m-val">' + annualHours.toLocaleString("en-US") + ' hrs</div></div>' +
          '</div>';
      }
    },

    "invoice-generator": {
      title: "Printable PDF Invoice Generator",
      subtitle: "Build itemized client invoices with tax, discount, late-fee terms, and instant PDF print",
      guideUrl: "/late-payment-fee-interest-invoice-terms-guide.html",
      guideLabel: "Read Late-Fee & Net-30 Terms Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="inv-from">Your Business / Name</label><input type="text" id="inv-from" value="WorkFlowora Studio LLC"></div>' +
                '<div class="field-group"><label for="inv-email">Your Email</label><input type="email" id="inv-email" value="billing@yourdomain.com"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="inv-client">Bill To (Client Name)</label><input type="text" id="inv-client" value="Acme Digital Inc."></div>' +
                '<div class="field-group"><label for="inv-num">Invoice Number</label><input type="text" id="inv-num" value="INV-2026-014"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="inv-date">Issue Date</label><input type="date" id="inv-date" value="2026-11-19"></div>' +
                '<div class="field-group"><label for="inv-due">Due Date (Net-15)</label><input type="date" id="inv-due" value="2026-12-04"></div>' +
              '</div>' +
              '<div class="field-group"><label>Line Items</label>' +
                '<table class="inv-items-table"><thead><tr><th>Description</th><th style="width:72px">Qty</th><th style="width:95px">Rate</th><th style="width:36px"></th></tr></thead>' +
                '<tbody id="inv-rows">' +
                  '<tr><td><input type="text" class="inv-desc" value="UX Architecture &amp; Wireframes"></td><td><input type="number" class="inv-qty" value="12" min="0" step="0.5"></td><td><input type="number" class="inv-rate" value="110" min="0" step="1"></td><td><button type="button" class="btn btn-secondary btn-sm inv-del" title="Remove">×</button></td></tr>' +
                  '<tr><td><input type="text" class="inv-desc" value="Frontend Performance Audit"></td><td><input type="number" class="inv-qty" value="1" min="0" step="1"></td><td><input type="number" class="inv-rate" value="650" min="0" step="1"></td><td><button type="button" class="btn btn-secondary btn-sm inv-del" title="Remove">×</button></td></tr>' +
                '</tbody></table>' +
                '<button type="button" id="inv-add-row" class="btn btn-secondary btn-sm">+ Add Line Item</button>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="inv-tax">Tax Rate (%)</label><input type="number" id="inv-tax" value="0" min="0" max="50" step="0.5"></div>' +
                '<div class="field-group"><label for="inv-disc">Discount (%)</label><input type="number" id="inv-disc" value="0" min="0" max="100" step="0.5"></div>' +
              '</div>' +
              '<div class="field-group"><label for="inv-notes">Payment Terms &amp; Late Fee Clause</label><input type="text" id="inv-notes" value="Net-15. Overdue balances accrue 1.5% monthly late fee after due date."></div>' +
              '<div><button type="button" id="inv-print-btn" class="btn btn-primary">Print / Save as PDF</button></div>' +
            '</div>' +
            '<div class="calc-results"><div class="invoice-preview-box" id="inv-preview"></div></div>' +
          '</div>';
      },
      bindExtra: function (recompute) {
        var addBtn = document.getElementById("inv-add-row");
        var tbody = document.getElementById("inv-rows");
        if (addBtn && tbody) {
          addBtn.addEventListener("click", function () {
            var tr = document.createElement("tr");
            tr.innerHTML = '<td><input type="text" class="inv-desc" value="Consulting Services"></td><td><input type="number" class="inv-qty" value="1" min="0" step="0.5"></td><td><input type="number" class="inv-rate" value="100" min="0" step="1"></td><td><button type="button" class="btn btn-secondary btn-sm inv-del" title="Remove">×</button></td>';
            tbody.appendChild(tr);
            recompute();
          });
          tbody.addEventListener("click", function (e) {
            if (e.target && e.target.classList.contains("inv-del")) {
              if (tbody.querySelectorAll("tr").length > 1) {
                e.target.closest("tr").remove();
                recompute();
              }
            }
          });
        }
        var printBtn = document.getElementById("inv-print-btn");
        if (printBtn) {
          printBtn.addEventListener("click", function () {
            var area = document.getElementById("wf-print-invoice-area");
            if (!area) {
              area = document.createElement("div");
              area.id = "wf-print-invoice-area";
              document.body.appendChild(area);
            }
            area.innerHTML = document.getElementById("inv-preview").innerHTML;
            document.body.classList.add("printing-invoice");
            window.print();
            setTimeout(function () {
              document.body.classList.remove("printing-invoice");
            }, 300);
          });
        }
      },
      compute: function () {
        var rows = document.querySelectorAll("#inv-rows tr");
        var subtotal = 0;
        var lineHtml = "";
        rows.forEach(function (tr) {
          var desc = tr.querySelector(".inv-desc").value || "Item";
          var qty = Math.max(0, parseFloat(tr.querySelector(".inv-qty").value) || 0);
          var rate = Math.max(0, parseFloat(tr.querySelector(".inv-rate").value) || 0);
          var amt = qty * rate;
          subtotal += amt;
          lineHtml += '<tr><td>' + escHtml(desc) + '</td><td class="num">' + qty + '</td><td class="num">' + fm(rate) + '</td><td class="num">' + fm(amt) + '</td></tr>';
        });
        var discPct = Math.max(0, Math.min(100, numVal("inv-disc", 0)));
        var taxPct = Math.max(0, numVal("inv-tax", 0));
        var discount = subtotal * (discPct / 100);
        var taxable = subtotal - discount;
        var tax = taxable * (taxPct / 100);
        var grand = taxable + tax;

        document.getElementById("inv-preview").innerHTML =
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;border-bottom:2px solid #0f172a;padding-bottom:10px;">' +
            '<div><h4>INVOICE</h4><div style="font-weight:700">' + escHtml(strVal("inv-from")) + '</div><div style="color:#475569;font-size:0.82rem">' + escHtml(strVal("inv-email")) + '</div></div>' +
            '<div style="text-align:right;font-size:0.84rem"><div><strong>#</strong> ' + escHtml(strVal("inv-num")) + '</div><div><strong>Date:</strong> ' + escHtml(strVal("inv-date")) + '</div><div><strong>Due:</strong> ' + escHtml(strVal("inv-due")) + '</div></div>' +
          '</div>' +
          '<div style="margin-bottom:12px;font-size:0.86rem"><strong>Bill To:</strong> ' + escHtml(strVal("inv-client")) + '</div>' +
          '<table class="mini-table" style="color:#0f172a"><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>' + lineHtml + '</tbody></table>' +
          '<div style="margin-top:12px;text-align:right;font-size:0.88rem">' +
            '<div>Subtotal: <strong>' + fm(subtotal) + '</strong></div>' +
            (discount > 0 ? '<div>Discount (' + discPct + '%): -' + fm(discount) + '</div>' : '') +
            (tax > 0 ? '<div>Tax (' + taxPct + '%): ' + fm(tax) + '</div>' : '') +
            '<div style="font-size:1.15rem;margin-top:6px;padding-top:6px;border-top:1px solid #cbd5e1">Total Due: <strong>' + fm(grand) + '</strong></div>' +
          '</div>' +
          '<div style="margin-top:14px;font-size:0.78rem;color:#475569;border-top:1px dashed #cbd5e1;padding-top:8px">' + escHtml(strVal("inv-notes")) + '</div>';
      }
    },

    "word-wpm": {
      title: "Word Counter, Reading & Speaking Time (WPM) Calculator",
      subtitle: "Real-time word, sentence, character, silent reading (238 WPM), and presentation pacing (130 WPM)",
      guideUrl: "/reading-speed-wpm-speaking-time-guide.html",
      guideLabel: "Read Reading vs. Speaking WPM Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-group"><label for="wpm-text">Paste Your Script, Speech, or Article</label><textarea id="wpm-text" rows="7">Good morning everyone. Today we are reviewing our quarterly cash runway, customer acquisition efficiency, and how tightening onboarding cut churn by twenty-two percent. Let us walk through the three numbers that matter most for Q4 execution.</textarea></div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="wpm-read-speed">Silent Reading Speed (WPM)</label><input type="number" id="wpm-read-speed" value="238" min="80" max="600" step="5"></div>' +
                '<div class="field-group"><label for="wpm-speak-speed">Speaking Pace (WPM)</label><input type="number" id="wpm-speak-speed" value="130" min="70" max="260" step="5"></div>' +
              '</div>' +
            '</div>' +
            '<div class="calc-results" id="wpm-out"></div>' +
          '</div>';
      },
      compute: function () {
        var text = strVal("wpm-text", "");
        var trimmed = text.trim();
        var words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
        var charsWith = text.length;
        var charsNoSpace = text.replace(/\s+/g, "").length;
        var sentences = trimmed ? trimmed.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; }).length : 0;
        var paragraphs = trimmed ? trimmed.split(/\n+/).filter(function (p) { return p.trim().length > 0; }).length : 0;

        var readWpm = Math.max(60, numVal("wpm-read-speed", 238));
        var speakWpm = Math.max(60, numVal("wpm-speak-speed", 130));

        function fmtSec(totalSec) {
          var s = Math.round(totalSec);
          var m = Math.floor(s / 60);
          var rem = s % 60;
          return m + "m " + (rem < 10 ? "0" : "") + rem + "s";
        }

        var readSec = (words / readWpm) * 60;
        var speakSec = (words / speakWpm) * 60;
        var avgWordLen = words > 0 ? (charsNoSpace / words).toFixed(1) : "0.0";

        document.getElementById("wpm-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Estimated Speaking Time (' + speakWpm + ' WPM)</div><div class="res-value">' + fmtSec(speakSec) + '</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Silent Reading Time (' + readWpm + ' WPM)</div><div class="m-val">' + fmtSec(readSec) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Word Count</div><div class="m-val">' + words.toLocaleString("en-US") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Characters (incl. spaces)</div><div class="m-val">' + charsWith.toLocaleString("en-US") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Sentences / Paragraphs</div><div class="m-val">' + sentences + ' / ' + paragraphs + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Characters (no spaces)</div><div class="m-val">' + charsNoSpace.toLocaleString("en-US") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Avg Word Length</div><div class="m-val">' + avgWordLen + ' chars</div></div>' +
          '</div>';
      }
    },

    "bmi-tdee": {
      title: "BMI & Mifflin-St Jeor TDEE Calorie Calculator",
      subtitle: "Calculates Body Mass Index, Basal Metabolic Rate (BMR), and daily maintenance/cut/bulk calories",
      guideUrl: "/50-30-20-budget-rule-monthly-salary-guide.html",
      guideLabel: "Explore Personal Planning Guides",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="bt-sex">Biological Sex</label><select id="bt-sex"><option value="male">Male</option><option value="female">Female</option></select></div>' +
                '<div class="field-group"><label for="bt-age">Age (Years)</label><input type="number" id="bt-age" value="30" min="15" max="100"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="bt-weight">Weight (kg)</label><input type="number" id="bt-weight" value="74" min="30" max="250" step="0.5"></div>' +
                '<div class="field-group"><label for="bt-height">Height (cm)</label><input type="number" id="bt-height" value="176" min="120" max="230" step="1"></div>' +
              '</div>' +
              '<div class="field-group"><label for="bt-act">Weekly Activity Level</label><select id="bt-act"><option value="1.2">Sedentary (desk job, little exercise)</option><option value="1.375">Lightly Active (1–3 days/wk)</option><option value="1.55" selected>Moderately Active (3–5 days/wk)</option><option value="1.725">Very Active (6–7 days/wk)</option><option value="1.9">Athlete / Physical Labor</option></select></div>' +
            '</div>' +
            '<div class="calc-results" id="bt-out"></div>' +
          '</div>';
      },
      compute: function () {
        var sex = strVal("bt-sex", "male");
        var age = Math.max(15, numVal("bt-age", 30));
        var w = Math.max(25, numVal("bt-weight", 74));
        var h = Math.max(100, numVal("bt-height", 176));
        var act = numVal("bt-act", 1.55);

        var hm = h / 100;
        var bmi = w / (hm * hm);
        var bmr = (10 * w) + (6.25 * h) - (5 * age) + (sex === "male" ? 5 : -161);
        var tdee = bmr * act;

        var cat = bmi < 18.5 ? "Underweight" : (bmi < 25 ? "Normal Weight" : (bmi < 30 ? "Overweight" : "Obese"));
        var cls = bmi >= 18.5 && bmi < 25 ? "status-good" : (bmi < 30 ? "status-warn" : "status-bad");

        document.getElementById("bt-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Daily Maintenance Calories (TDEE)</div><div class="res-value">' + Math.round(tdee).toLocaleString("en-US") + ' kcal</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Body Mass Index (BMI)</div><div class="m-val">' + bmi.toFixed(1) + ' (' + cat + ')</div></div>' +
            '<div class="res-metric"><div class="m-label">Basal Metabolic Rate (BMR)</div><div class="m-val">' + Math.round(bmr).toLocaleString("en-US") + ' kcal</div></div>' +
            '<div class="res-metric"><div class="m-label">Fat Loss Target (-500 kcal)</div><div class="m-val">' + Math.max(1200, Math.round(tdee - 500)).toLocaleString("en-US") + ' kcal</div></div>' +
            '<div class="res-metric"><div class="m-label">Lean Surplus (+300 kcal)</div><div class="m-val">' + Math.round(tdee + 300).toLocaleString("en-US") + ' kcal</div></div>' +
          '</div>' +
          '<span class="status-badge ' + cls + '">WHO BMI Category: ' + cat + '</span>';
      }
    },

    "saas-ltv-cac": {
      title: "SaaS LTV:CAC & Payback Period Calculator",
      subtitle: "Gross-margin adjusted Customer Lifetime Value, LTV:CAC efficiency ratio, and CAC payback months",
      guideUrl: "/customer-acquisition-cost-cac-ltv-guide.html",
      guideLabel: "Read SaaS LTV:CAC Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="saas-arpu">Monthly ARPU (Revenue / User)</label><input type="number" id="saas-arpu" value="99" min="1" step="5"></div>' +
                '<div class="field-group"><label for="saas-gm">Gross Margin (%)</label><input type="number" id="saas-gm" value="80" min="1" max="100" step="1"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="saas-churn">Monthly Logo Churn Rate (%)</label><input type="number" id="saas-churn" value="3.5" min="0.1" max="50" step="0.1"></div>' +
                '<div class="field-group"><label for="saas-cac">Customer Acquisition Cost (CAC)</label><input type="number" id="saas-cac" value="550" min="1" step="25"></div>' +
              '</div>' +
            '</div>' +
            '<div class="calc-results" id="saas-out"></div>' +
          '</div>';
      },
      compute: function () {
        var arpu = Math.max(0.01, numVal("saas-arpu", 99));
        var gm = Math.max(1, Math.min(100, numVal("saas-gm", 80))) / 100;
        var churn = Math.max(0.05, numVal("saas-churn", 3.5)) / 100;
        var cac = Math.max(0.01, numVal("saas-cac", 550));

        var lifetimeMonths = 1 / churn;
        var monthlyGp = arpu * gm;
        var ltv = monthlyGp * lifetimeMonths;
        var ratio = ltv / cac;
        var payback = cac / monthlyGp;

        var badge = ratio >= 3 && payback <= 12
          ? '<span class="status-badge status-good">Healthy SaaS Unit Economics (LTV:CAC &ge; 3:1 &amp; Payback &le; 12 mo)</span>'
          : (ratio >= 2
              ? '<span class="status-badge status-warn">Borderline — Lower Churn or Optimize Acquisition Cost</span>'
              : '<span class="status-badge status-bad">Unsustainable — LTV:CAC Below 2:1</span>');

        document.getElementById("saas-out").innerHTML =
          '<div class="result-primary"><div class="res-label">LTV : CAC Ratio</div><div class="res-value">' + ratio.toFixed(2) + ' : 1</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Gross-Margin LTV</div><div class="m-val">' + fm(ltv) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">CAC Payback Period</div><div class="m-val">' + payback.toFixed(1) + ' months</div></div>' +
            '<div class="res-metric"><div class="m-label">Avg Customer Lifespan</div><div class="m-val">' + lifetimeMonths.toFixed(1) + ' months</div></div>' +
            '<div class="res-metric"><div class="m-label">Monthly Gross Profit / User</div><div class="m-val">' + fm(monthlyGp) + '</div></div>' +
          '</div>' + badge;
      }
    },

    "dti-ratio": {
      title: "Debt-to-Income (DTI 28/36) Mortgage Calculator",
      subtitle: "Evaluates Front-End Housing Ratio (28% benchmark) and Back-End Total Debt Ratio (36% / 43% QM rule)",
      guideUrl: "/debt-to-income-ratio-dti-mortgage-approval-guide.html",
      guideLabel: "Read DTI 28/36 Underwriting Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-group"><label for="dti-income">Gross Monthly Household Income (Pre-Tax)</label><input type="number" id="dti-income" value="8500" min="100" step="100"></div>' +
              '<div class="field-group"><label for="dti-housing">Monthly Housing Payment (PITI + HOA)</label><input type="number" id="dti-housing" value="2150" min="0" step="50"></div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="dti-auto">Auto Loan Payments</label><input type="number" id="dti-auto" value="420" min="0" step="20"></div>' +
                '<div class="field-group"><label for="dti-student">Student Loans</label><input type="number" id="dti-student" value="250" min="0" step="20"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="dti-cc">Credit Card Minimums</label><input type="number" id="dti-cc" value="130" min="0" step="10"></div>' +
                '<div class="field-group"><label for="dti-other">Other Monthly Obligations</label><input type="number" id="dti-other" value="0" min="0" step="20"></div>' +
              '</div>' +
            '</div>' +
            '<div class="calc-results" id="dti-out"></div>' +
          '</div>';
      },
      compute: function () {
        var inc = Math.max(1, numVal("dti-income", 8500));
        var house = Math.max(0, numVal("dti-housing", 2150));
        var otherDebt = Math.max(0, numVal("dti-auto", 420)) + Math.max(0, numVal("dti-student", 250)) + Math.max(0, numVal("dti-cc", 130)) + Math.max(0, numVal("dti-other", 0));
        var totalDebt = house + otherDebt;

        var frontDti = (house / inc) * 100;
        var backDti = (totalDebt / inc) * 100;
        var max36Cap = Math.max(0, inc * 0.36 - totalDebt);

        var badge = (frontDti <= 28 && backDti <= 36)
          ? '<span class="status-badge status-good">Meets Conventional 28/36 Mortgage Benchmark</span>'
          : (backDti <= 43
              ? '<span class="status-badge status-warn">Above 36% Ideal — Within 43% Qualified Mortgage Cap</span>'
              : '<span class="status-badge status-bad">High Risk (&gt;43% Back-End DTI) — Pay Down Debt Before Applying</span>');

        document.getElementById("dti-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Back-End (Total) DTI Ratio</div><div class="res-value">' + pct(backDti) + '</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Front-End (Housing) DTI</div><div class="m-val">' + pct(frontDti) + ' (Target &le;28%)</div></div>' +
            '<div class="res-metric"><div class="m-label">Total Monthly Debt</div><div class="m-val">' + fm(totalDebt) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Remaining Capacity (36% Rule)</div><div class="m-val">' + fm(max36Cap) + '/mo</div></div>' +
            '<div class="res-metric"><div class="m-label">Non-Housing Monthly Debt</div><div class="m-val">' + fm(otherDebt) + '</div></div>' +
          '</div>' + badge;
      }
    },

    "cc-payoff": {
      title: "Credit Card Payoff vs. Minimum Payment Trap",
      subtitle: "Compares a fixed monthly payoff plan against a 2% declining minimum payment schedule",
      guideUrl: "/credit-card-minimum-payment-interest-trap-guide.html",
      guideLabel: "Read Credit Card Minimum Payment Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-group"><label for="cc-bal">Current Card Balance</label><input type="number" id="cc-bal" value="6500" min="50" step="100"></div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="cc-apr">Credit Card APR (%)</label><input type="number" id="cc-apr" value="24.99" min="0" max="60" step="0.1"></div>' +
                '<div class="field-group"><label for="cc-pmt">Your Planned Monthly Payment</label><input type="number" id="cc-pmt" value="260" min="10" step="10"></div>' +
              '</div>' +
              '<div class="field-group"><label for="cc-min-pct">Minimum Payment Rule (% of balance, $25 floor)</label><input type="number" id="cc-min-pct" value="2" min="1" max="10" step="0.5"></div>' +
            '</div>' +
            '<div class="calc-results" id="cc-out"></div>' +
          '</div>';
      },
      compute: function () {
        var bal0 = Math.max(0, numVal("cc-bal", 6500));
        var apr = Math.max(0, numVal("cc-apr", 24.99));
        var pmt = Math.max(1, numVal("cc-pmt", 260));
        var minPct = Math.max(1, numVal("cc-min-pct", 2)) / 100;
        var r = apr / 12 / 100;

        // Fixed payment simulation
        var b = bal0, mFixed = 0, intFixed = 0, cannotPay = false;
        if (pmt <= bal0 * r && r > 0) {
          cannotPay = true;
        } else {
          while (b > 0.01 && mFixed < 600) {
            mFixed++;
            var intr = b * r;
            var pay = Math.min(b + intr, pmt);
            intFixed += intr;
            b = b + intr - pay;
          }
        }

        // Minimum payment trap simulation (max(minPct * b, $25) or b+intr)
        var bm = bal0, mMin = 0, intMin = 0;
        while (bm > 0.01 && mMin < 600) {
          mMin++;
          var mi = bm * r;
          var mp = Math.max(25, bm * minPct);
          if (mp <= mi + 0.01) {
            mp = mi + Math.max(1, bm * 0.01);
          }
          mp = Math.min(bm + mi, mp);
          intMin += mi;
          bm = bm + mi - mp;
        }

        if (cannotPay) {
          document.getElementById("cc-out").innerHTML =
            '<div class="result-primary"><div class="res-label">Warning</div><div class="res-value">Never Paid Off</div></div>' +
            '<span class="status-badge status-bad">Your payment (' + fm(pmt) + ') is less than or equal to Month-1 interest (' + fm(bal0 * r) + '). Increase payment above ' + fm(bal0 * r + 10) + '.</span>';
          return;
        }

        var saved = Math.max(0, intMin - intFixed);
        document.getElementById("cc-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Debt-Free In</div><div class="res-value">' + mFixed + ' months (' + (mFixed / 12).toFixed(1) + ' yrs)</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Total Interest (Fixed Plan)</div><div class="m-val">' + fm(intFixed) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Total Paid (Fixed Plan)</div><div class="m-val">' + fm(bal0 + intFixed) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Min-Payment Trap Duration</div><div class="m-val">' + (mMin >= 600 ? "50+ yrs" : mMin + " mo (" + (mMin / 12).toFixed(1) + " yrs)") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Interest Saved vs. Minimums</div><div class="m-val">' + fm(saved) + '</div></div>' +
          '</div>' +
          '<span class="status-badge status-good">Paying ' + fm(pmt) + '/mo saves ' + fm(saved) + ' in compounding interest.</span>';
      }
    },

    "budget-503020": {
      title: "Salary 50/30/20 Monthly Budget Calculator",
      subtitle: "Splits monthly take-home pay into Needs, Wants, and Savings/Debt with customizable ratios",
      guideUrl: "/50-30-20-budget-rule-monthly-salary-guide.html",
      guideLabel: "Read 50/30/20 Budget Rule Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-group"><label for="bg-net">Monthly Take-Home (Net) Salary</label><input type="number" id="bg-net" value="5200" min="100" step="100"></div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="bg-needs">Needs Share (%)</label><input type="number" id="bg-needs" value="50" min="0" max="100" step="5"></div>' +
                '<div class="field-group"><label for="bg-wants">Wants Share (%)</label><input type="number" id="bg-wants" value="30" min="0" max="100" step="5"></div>' +
              '</div>' +
              '<div class="field-group"><label for="bg-save">Savings &amp; Debt Payoff Share (%)</label><input type="number" id="bg-save" value="20" min="0" max="100" step="5"><span class="field-hint">Tip: In high-rent cities, try 60 / 20 / 20.</span></div>' +
            '</div>' +
            '<div class="calc-results" id="bg-out"></div>' +
          '</div>';
      },
      compute: function () {
        var net = Math.max(0, numVal("bg-net", 5200));
        var pNeeds = Math.max(0, numVal("bg-needs", 50));
        var pWants = Math.max(0, numVal("bg-wants", 30));
        var pSave = Math.max(0, numVal("bg-save", 20));
        var sum = pNeeds + pWants + pSave || 100;

        var needs = net * (pNeeds / sum);
        var wants = net * (pWants / sum);
        var save = net * (pSave / sum);
        var annualSave = save * 12;
        var emergencyMonths = save > 0 ? (needs * 6) / save : 0;

        document.getElementById("bg-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Annualized Savings &amp; Debt Power</div><div class="res-value">' + fm(annualSave) + '/yr</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Needs (' + pct((pNeeds / sum) * 100, 0) + ')</div><div class="m-val">' + fm(needs) + '/mo</div></div>' +
            '<div class="res-metric"><div class="m-label">Wants (' + pct((pWants / sum) * 100, 0) + ')</div><div class="m-val">' + fm(wants) + '/mo</div></div>' +
            '<div class="res-metric"><div class="m-label">Savings &amp; Debt (' + pct((pSave / sum) * 100, 0) + ')</div><div class="m-val">' + fm(save) + '/mo</div></div>' +
            '<div class="res-metric"><div class="m-label">6-Month Emergency Fund Goal</div><div class="m-val">' + fm(needs * 6) + ' (' + emergencyMonths.toFixed(0) + ' mo)</div></div>' +
          '</div>' +
          '<div class="ratio-bar"><div class="ratio-seg-a" style="width:' + ((pNeeds / sum) * 100).toFixed(1) + '%"></div><div class="ratio-seg-b" style="width:' + ((pWants / sum) * 100).toFixed(1) + '%"></div><div class="ratio-seg-c" style="width:' + ((pSave / sum) * 100).toFixed(1) + '%"></div></div>' +
          (Math.abs(pNeeds + pWants + pSave - 100) > 0.1 ? '<span class="status-badge status-warn">Percentages normalized to 100% (currently sum to ' + (pNeeds + pWants + pSave) + '%).</span>' : '');
      }
    },

    "us-1099-tax": {
      title: "US 1099 Self-Employment & Quarterly Tax Calculator (2026)",
      subtitle: "Applies 92.35% SE taxable base, 15.3% Social Security/Medicare, 50% SE deduction & 2026 federal brackets",
      guideUrl: "/us-self-employment-1099-quarterly-tax-guide-2026.html",
      guideLabel: "Read 2026 US 1099 Tax Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="t1099-gross">Annual Gross 1099 Revenue ($ USD)</label><input type="number" id="t1099-gross" value="110000" min="0" step="1000"></div>' +
                '<div class="field-group"><label for="t1099-exp">Schedule C Business Deductions ($ USD)</label><input type="number" id="t1099-exp" value="18000" min="0" step="500"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="t1099-status">Federal Filing Status</label><select id="t1099-status"><option value="single">Single</option><option value="mfj">Married Filing Jointly</option><option value="hoh">Head of Household</option></select></div>' +
                '<div class="field-group"><label for="t1099-state">Estimated State Income Tax (%)</label><input type="number" id="t1099-state" value="5" min="0" max="15" step="0.5"></div>' +
              '</div>' +
            '</div>' +
            '<div class="calc-results" id="t1099-out"></div>' +
          '</div>';
      },
      compute: function () {
        var gross = Math.max(0, numVal("t1099-gross", 110000));
        var exp = Math.max(0, numVal("t1099-exp", 18000));
        var status = strVal("t1099-status", "single");
        var statePct = Math.max(0, numVal("t1099-state", 5)) / 100;

        var netProfit = Math.max(0, gross - exp);
        var seBase = netProfit * 0.9235;
        var ssCap2026 = 184500;
        var ssTax = Math.min(seBase, ssCap2026) * 0.124;
        var medTax = seBase * 0.029;
        var addMedThresh = status === "mfj" ? 250000 : 200000;
        var addMedTax = Math.max(0, seBase - addMedThresh) * 0.009;
        var totalSeTax = ssTax + medTax + addMedTax;
        var seDeduction = totalSeTax * 0.5;

        var stdDed = status === "mfj" ? 32200 : (status === "hoh" ? 24150 : 16100);
        var taxableFed = Math.max(0, netProfit - seDeduction - stdDed);

        // 2026 progressive federal brackets
        var brackets = status === "mfj"
          ? [[24800, 0.10], [100800, 0.12], [211400, 0.22], [403550, 0.24], [512450, 0.32], [768700, 0.35], [Infinity, 0.37]]
          : (status === "hoh"
              ? [[17700, 0.10], [67450, 0.12], [105700, 0.22], [201750, 0.24], [256200, 0.32], [640600, 0.35], [Infinity, 0.37]]
              : [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]]);

        var fedTax = 0, prev = 0;
        for (var i = 0; i < brackets.length; i++) {
          var cap = brackets[i][0], rate = brackets[i][1];
          if (taxableFed > prev) {
            fedTax += (Math.min(taxableFed, cap) - prev) * rate;
            prev = cap;
          }
        }

        var stateTax = Math.max(0, netProfit - seDeduction) * statePct;
        var totalTax = totalSeTax + fedTax + stateTax;
        var quarterly = totalTax / 4;
        var effRate = netProfit > 0 ? (totalTax / netProfit) * 100 : 0;

        document.getElementById("t1099-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Estimated Quarterly Payment (Form 1040-ES)</div><div class="res-value">' + fm(quarterly, "USD") + ' / qtr</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Net Schedule C Profit</div><div class="m-val">' + fm(netProfit, "USD") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Self-Employment Tax (15.3%)</div><div class="m-val">' + fm(totalSeTax, "USD") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Federal Income Tax</div><div class="m-val">' + fm(fedTax, "USD") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Total Tax &amp; Effective Rate</div><div class="m-val">' + fm(totalTax, "USD") + ' (' + pct(effRate) + ')</div></div>' +
          '</div>' +
          '<div class="field-hint" style="margin-top:10px">2026 Deadlines: Apr 15, Jun 15, Sep 15, 2026 &amp; Jan 15, 2027. Includes 50% SE deduction (' + fm(seDeduction, "USD") + ').</div>';
      }
    },

    "startup-runway": {
      title: "Startup Cash Runway & Default Alive Calculator",
      subtitle: "Models zero-growth runway vs. monthly MRR compounding to test Default Alive status",
      guideUrl: "/startup-cash-runway-burn-rate-default-alive-guide.html",
      guideLabel: "Read Startup Runway & Default Alive Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="sr-cash">Cash Balance on Hand</label><input type="number" id="sr-cash" value="650000" min="0" step="10000"></div>' +
                '<div class="field-group"><label for="sr-burn">Monthly Operating Expenses (Gross Burn)</label><input type="number" id="sr-burn" value="62000" min="100" step="1000"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="sr-mrr">Current Monthly Revenue (MRR)</label><input type="number" id="sr-mrr" value="24000" min="0" step="1000"></div>' +
                '<div class="field-group"><label for="sr-growth">Monthly Revenue Growth Rate (%)</label><input type="number" id="sr-growth" value="8" min="-20" max="100" step="0.5"></div>' +
              '</div>' +
            '</div>' +
            '<div class="calc-results" id="sr-out"></div>' +
          '</div>';
      },
      compute: function () {
        var cash0 = Math.max(0, numVal("sr-cash", 650000));
        var grossBurn = Math.max(1, numVal("sr-burn", 62000));
        var mrr0 = Math.max(0, numVal("sr-mrr", 24000));
        var g = numVal("sr-growth", 8) / 100;

        var netBurn = grossBurn - mrr0;
        var zeroGrowthRunway = netBurn <= 0 ? Infinity : cash0 / netBurn;

        // Month-by-month simulation
        var cash = cash0, mrr = mrr0, months = 0, defaultAlive = false, breakevenMonth = null;
        if (netBurn <= 0) {
          defaultAlive = true;
          breakevenMonth = 0;
        } else {
          for (var m = 1; m <= 120; m++) {
            mrr = mrr * (1 + g);
            var nb = grossBurn - mrr;
            if (nb <= 0 && breakevenMonth === null) {
              breakevenMonth = m;
              defaultAlive = true;
              break;
            }
            cash -= nb;
            if (cash <= 0) {
              months = m;
              break;
            }
            months = m;
          }
          if (!defaultAlive && cash > 0) defaultAlive = true;
        }

        var badge = defaultAlive
          ? '<span class="status-badge status-good">Default Alive — Reaches Break-Even in ' + (breakevenMonth === 0 ? "Already Profitable" : breakevenMonth + " months") + '</span>'
          : '<span class="status-badge status-bad">Default Dead — Cash Runs Out in ' + months + ' Months Without Fundraising or Cuts</span>';

        document.getElementById("sr-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Growth-Adjusted Runway</div><div class="res-value">' + (defaultAlive ? "Infinite (Default Alive)" : months + " months") + '</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Current Monthly Net Burn</div><div class="m-val">' + (netBurn <= 0 ? "Cash-Flow Positive" : fm(netBurn)) + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Zero-Growth Runway</div><div class="m-val">' + (isFinite(zeroGrowthRunway) ? zeroGrowthRunway.toFixed(1) + " months" : "Infinite") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Gross Burn</div><div class="m-val">' + fm(grossBurn) + '/mo</div></div>' +
            '<div class="res-metric"><div class="m-label">Burn Multiple (Net Burn / MRR)</div><div class="m-val">' + (mrr0 > 0 ? Math.max(0, netBurn / mrr0).toFixed(2) + "x" : "N/A") + '</div></div>' +
          '</div>' + badge;
      }
    },

    "fire-retirement": {
      title: "FIRE Financial Independence & Retirement Calculator",
      subtitle: "Computes your 25x FIRE Number, Safe Withdrawal income, and month-by-month years to retirement",
      guideUrl: "/apr-vs-apy-interest-rate-difference-guide.html",
      guideLabel: "Read Compounding & Yield Guide",
      render: function () {
        return '' +
          '<div class="calc-layout">' +
            '<div class="calc-inputs">' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="fire-age">Current Age</label><input type="number" id="fire-age" value="31" min="18" max="80"></div>' +
                '<div class="field-group"><label for="fire-port">Current Invested Portfolio</label><input type="number" id="fire-port" value="85000" min="0" step="5000"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="fire-exp">Annual Retirement Expenses</label><input type="number" id="fire-exp" value="48000" min="5000" step="1000"></div>' +
                '<div class="field-group"><label for="fire-save">Monthly Investment Contribution</label><input type="number" id="fire-save" value="2200" min="0" step="100"></div>' +
              '</div>' +
              '<div class="field-row">' +
                '<div class="field-group"><label for="fire-ret">Expected Real Annual Return (%)</label><input type="number" id="fire-ret" value="7" min="1" max="15" step="0.25"></div>' +
                '<div class="field-group"><label for="fire-swr">Safe Withdrawal Rate (%)</label><input type="number" id="fire-swr" value="4" min="2" max="6" step="0.1"></div>' +
              '</div>' +
            '</div>' +
            '<div class="calc-results" id="fire-out"></div>' +
          '</div>';
      },
      compute: function () {
        var age = Math.max(18, numVal("fire-age", 31));
        var port = Math.max(0, numVal("fire-port", 85000));
        var annualExp = Math.max(1000, numVal("fire-exp", 48000));
        var monthlySave = Math.max(0, numVal("fire-save", 2200));
        var ret = Math.max(0.1, numVal("fire-ret", 7)) / 100;
        var swr = Math.max(1, numVal("fire-swr", 4)) / 100;

        var fireNum = annualExp / swr;
        var mr = ret / 12;
        var bal = port, months = 0;
        while (bal < fireNum && months < 720) {
          months++;
          bal = bal * (1 + mr) + monthlySave;
        }
        var yrs = months / 12;
        var fireAge = age + yrs;
        var progress = Math.min(100, (port / fireNum) * 100);

        document.getElementById("fire-out").innerHTML =
          '<div class="result-primary"><div class="res-label">Your FIRE Target Number (' + (1 / swr).toFixed(0) + 'x Expenses)</div><div class="res-value">' + fm(fireNum) + '</div></div>' +
          '<div class="result-grid">' +
            '<div class="res-metric"><div class="m-label">Years to FIRE</div><div class="m-val">' + (months >= 720 ? "60+ yrs" : yrs.toFixed(1) + " years") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Projected FIRE Age</div><div class="m-val">' + (months >= 720 ? "90+" : fireAge.toFixed(1) + " yrs old") + '</div></div>' +
            '<div class="res-metric"><div class="m-label">Safe Monthly Passive Income</div><div class="m-val">' + fm(annualExp / 12) + '/mo</div></div>' +
            '<div class="res-metric"><div class="m-label">Current Progress</div><div class="m-val">' + pct(progress) + '</div></div>' +
          '</div>' +
          '<div class="ratio-bar"><div class="ratio-seg-c" style="width:' + progress.toFixed(1) + '%"></div></div>' +
          '<div class="field-hint">Based on real (inflation-adjusted) compounding at ' + pct(ret * 100, 2) + ' and ' + pct(swr * 100, 1) + ' SWR.</div>';
      }
    }
  };

  // ==================== GLOBAL TAX COMPARATOR ====================
  var TAX_COUNTRIES = [
    { name: "United States (Federal + FICA)", brackets: [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [Infinity, 0.32]], stdDed: 16100, socialPct: 0.0765 },
    { name: "United Kingdom", brackets: [[15800, 0.0], [63000, 0.20], [157000, 0.40], [Infinity, 0.45]], stdDed: 0, socialPct: 0.08 },
    { name: "Germany", brackets: [[13000, 0.0], [72000, 0.28], [295000, 0.42], [Infinity, 0.45]], stdDed: 1300, socialPct: 0.195 },
    { name: "France", brackets: [[12400, 0.0], [31600, 0.11], [90000, 0.30], [194000, 0.41], [Infinity, 0.45]], stdDed: 0, socialPct: 0.13 },
    { name: "Spain", brackets: [[13500, 0.19], [22000, 0.24], [38500, 0.30], [65500, 0.37], [Infinity, 0.45]], stdDed: 6000, socialPct: 0.064 },
    { name: "Japan", brackets: [[13000, 0.05], [22000, 0.10], [46000, 0.20], [60000, 0.23], [120000, 0.33], [Infinity, 0.40]], stdDed: 9500, socialPct: 0.145 },
    { name: "Brazil", brackets: [[6000, 0.0], [10000, 0.075], [14000, 0.15], [18000, 0.225], [Infinity, 0.275]], stdDed: 0, socialPct: 0.09 },
    { name: "Canada (Federal + Avg Prov)", brackets: [[40000, 0.20], [80000, 0.29], [125000, 0.36], [Infinity, 0.43]], stdDed: 11200, socialPct: 0.065 },
    { name: "Australia", brackets: [[12000, 0.0], [29500, 0.16], [88500, 0.30], [124000, 0.37], [Infinity, 0.45]], stdDed: 0, socialPct: 0.02 }
  ];

  function renderTaxComparator() {
    var tbody = document.getElementById("wf-tax-tbody");
    if (!tbody) return;
    var grossUsd = Math.max(1000, numVal("wf-tax-income", 85000));
    var curr = strVal("wf-tax-currency", "USD");
    var rate = (window.WF_STATE && window.WF_STATE.currencyMap[curr]) ? window.WF_STATE.currencyMap[curr].rate : 1;

    var rows = TAX_COUNTRIES.map(function (c) {
      var taxable = Math.max(0, grossUsd - c.stdDed);
      var incTax = 0, prev = 0;
      for (var i = 0; i < c.brackets.length; i++) {
        var cap = c.brackets[i][0], br = c.brackets[i][1];
        if (taxable > prev) {
          incTax += (Math.min(taxable, cap) - prev) * br;
          prev = cap;
        }
      }
      var social = Math.min(grossUsd, 140000) * c.socialPct;
      var totalTax = incTax + social;
      var netUsd = Math.max(0, grossUsd - totalTax);
      var eff = (totalTax / grossUsd) * 100;
      return { name: c.name, eff: eff, tax: totalTax * rate, net: netUsd * rate, monthly: (netUsd / 12) * rate };
    }).sort(function (a, b) { return a.eff - b.eff; });

    tbody.innerHTML = rows.map(function (r) {
      return '<tr>' +
        '<td><strong>' + escHtml(r.name) + '</strong></td>' +
        '<td class="num">' + pct(r.eff) + '</td>' +
        '<td><div class="tax-bar-track"><div class="tax-bar-fill" style="width:' + Math.min(100, r.eff * 1.8).toFixed(0) + '%"></div></div></td>' +
        '<td class="num">' + fm(r.tax, curr) + '</td>' +
        '<td class="num"><strong>' + fm(r.net, curr) + '</strong></td>' +
        '<td class="num">' + fm(r.monthly, curr) + '</td>' +
      '</tr>';
    }).join("");
  }

  // ==================== FEATURE REQUEST BOARD ====================
  var DEFAULT_REQUESTS = [
    { id: "r1", title: "Mortgage Refinance Break-Even Calculator", cat: "Personal Finance", desc: "Compare closing costs vs. monthly payment savings to find exact refinance break-even month.", votes: 42 },
    { id: "r2", title: "YouTube RPM & AdSense Revenue Estimator", cat: "Freelance & Tax", desc: "Model niche CPM/RPM ranges, long-form vs. Shorts split, and sponsorship uplift.", votes: 37 },
    { id: "r3", title: "SaaS Magic Number & Rule of 40 Tracker", cat: "SaaS & E-Commerce", desc: "Evaluate net new ARR against prior-quarter S&M spend plus growth + FCF margin.", votes: 29 },
    { id: "r4", title: "Amazon FBA vs. Shopify Margin Comparator", cat: "SaaS & E-Commerce", desc: "Side-by-side referral fees, FBA fulfillment tiers, storage costs, and DTC ad margins.", votes: 24 }
  ];

  function loadRequests() {
    try {
      var raw = localStorage.getItem("wf_feature_requests");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_REQUESTS.slice();
  }

  function saveRequests(list) {
    try { localStorage.setItem("wf_feature_requests", JSON.stringify(list)); } catch (e) {}
  }

  function loadVoted() {
    try {
      var raw = localStorage.getItem("wf_voted_ids");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  function renderRequests() {
    var wrap = document.getElementById("wf-request-list");
    if (!wrap) return;
    var list = loadRequests().sort(function (a, b) { return b.votes - a.votes; });
    var voted = loadVoted();
    wrap.innerHTML = list.map(function (item) {
      var isVoted = !!voted[item.id];
      return '<div class="request-item">' +
        '<div><span class="calc-tag">' + escHtml(item.cat) + '</span><h4>' + escHtml(item.title) + '</h4><p>' + escHtml(item.desc) + '</p></div>' +
        '<button type="button" class="upvote-btn' + (isVoted ? ' voted' : '') + '" data-req-id="' + escHtml(item.id) + '" aria-label="Upvote ' + escHtml(item.title) + '"><span>&#9650;</span><span>' + item.votes + '</span></button>' +
      '</div>';
    }).join("");
  }

  // ==================== WORKSPACE MOUNT & INIT ====================
  var activeCalcId = "loan-emi";

  function mountCalculator(id, scrollIntoView) {
    var calc = CALCULATORS[id] || CALCULATORS["loan-emi"];
    activeCalcId = CALCULATORS[id] ? id : "loan-emi";

    var titleEl = document.getElementById("wf-ws-title");
    var subEl = document.getElementById("wf-ws-subtitle");
    var guideEl = document.getElementById("wf-ws-guide-link");
    var bodyEl = document.getElementById("wf-ws-body");
    if (!bodyEl) return;

    titleEl.textContent = calc.title;
    subEl.textContent = calc.subtitle;
    guideEl.href = calc.guideUrl;
    guideEl.textContent = calc.guideLabel + " →";
    bodyEl.innerHTML = calc.render();

    // Highlight active card
    document.querySelectorAll(".calc-card").forEach(function (card) {
      card.classList.toggle("active-card", card.getAttribute("data-calc") === activeCalcId);
    });

    // Bind live recalculation
    var recompute = function () { calc.compute(); };
    bodyEl.addEventListener("input", recompute);
    bodyEl.addEventListener("change", recompute);
    if (typeof calc.bindExtra === "function") {
      calc.bindExtra(recompute);
    }
    calc.compute();

    if (scrollIntoView) {
      var shell = document.getElementById("calculator-workspace");
      if (shell) shell.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Only run workspace logic on homepage
    if (!document.getElementById("wf-ws-body")) return;

    // Bind pre-rendered static calculator cards
    document.querySelectorAll(".calc-card[data-calc]").forEach(function (card) {
      card.addEventListener("click", function () {
        var cid = card.getAttribute("data-calc");
        if (history.replaceState) {
          history.replaceState(null, "", "#calc-" + cid);
        }
        mountCalculator(cid, true);
      });
    });

    // Category Filter Pills
    document.querySelectorAll(".filter-pill[data-filter]").forEach(function (pill) {
      pill.addEventListener("click", function () {
        var cat = pill.getAttribute("data-filter");
        document.querySelectorAll(".filter-pill").forEach(function (p) { p.classList.remove("active"); });
        pill.classList.add("active");
        document.querySelectorAll(".calc-card").forEach(function (card) {
          var cardCat = card.getAttribute("data-cat");
          card.style.display = (cat === "all" || cardCat === cat) ? "" : "none";
        });
      });
    });

    // Deep-link hash support (#calc-loan-emi etc.)
    function checkHash(shouldScroll) {
      var h = (window.location.hash || "").replace("#calc-", "");
      if (CALCULATORS[h]) {
        mountCalculator(h, shouldScroll);
        return true;
      }
      return false;
    }

    if (!checkHash(false)) {
      mountCalculator("loan-emi", false);
    }
    window.addEventListener("hashchange", function () { checkHash(true); });

    // Recompute on currency change
    window.addEventListener("wf:currency-change", function () {
      if (CALCULATORS[activeCalcId]) CALCULATORS[activeCalcId].compute();
      var taxCurr = document.getElementById("wf-tax-currency");
      if (taxCurr && window.WF_STATE) {
        taxCurr.value = window.WF_STATE.currency;
      }
      renderTaxComparator();
    });

    // Global Tax Comparator
    var taxInc = document.getElementById("wf-tax-income");
    var taxCurr = document.getElementById("wf-tax-currency");
    if (taxInc && taxCurr) {
      taxCurr.value = window.WF_STATE ? window.WF_STATE.currency : "USD";
      taxInc.addEventListener("input", renderTaxComparator);
      taxCurr.addEventListener("change", renderTaxComparator);
      renderTaxComparator();
    }

    // Feature Request Board
    renderRequests();
    var reqList = document.getElementById("wf-request-list");
    if (reqList) {
      reqList.addEventListener("click", function (e) {
        var btn = e.target.closest(".upvote-btn");
        if (!btn) return;
        var rid = btn.getAttribute("data-req-id");
        var list = loadRequests();
        var voted = loadVoted();
        list.forEach(function (it) {
          if (it.id === rid) {
            if (voted[rid]) {
              it.votes = Math.max(0, it.votes - 1);
              delete voted[rid];
            } else {
              it.votes += 1;
              voted[rid] = true;
            }
          }
        });
        saveRequests(list);
        try { localStorage.setItem("wf_voted_ids", JSON.stringify(voted)); } catch (err) {}
        renderRequests();
      });
    }

    var reqForm = document.getElementById("wf-request-form");
    if (reqForm) {
      reqForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var title = strVal("req-name").trim();
        var cat = strVal("req-cat", "Personal Finance");
        var desc = strVal("req-desc").trim();
        if (!title || !desc) return;
        var list = loadRequests();
        list.unshift({ id: "u" + Date.now(), title: title, cat: cat, desc: desc, votes: 1 });
        saveRequests(list);
        reqForm.reset();
        renderRequests();
        var status = document.getElementById("req-status");
        if (status) {
          status.textContent = "Thank you! Your tool request has been added to the community queue.";
          status.style.display = "block";
        }
      });
    }
  });
})();
