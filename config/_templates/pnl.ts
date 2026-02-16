export const pnl = {
    name: '💰 Profit & Loss Statement',
    type: 'report' as const,
    description: 'Standard P&L statement for financial reporting',
    content: `PROFIT & LOSS STATEMENT
Period: {{period}}
Company: {{companyName}}

REVENUE
--------------------------------------------
Sales Revenue:          {{salesRevenue}}
Service Revenue:        {{serviceRevenue}}
Other Income:          {{otherIncome}}
TOTAL REVENUE:         {{totalRevenue}}

COST OF GOODS SOLD (COGS)
--------------------------------------------
Materials:             {{materialsCost}}
Labor:                 {{laborCost}}
Shipping:              {{shippingCost}}
TOTAL COGS:            {{totalCOGS}}

GROSS PROFIT:          {{grossProfit}}

OPERATING EXPENSES
--------------------------------------------
Rent/Utilities:        {{rentUtilities}}
Salaries/Wages:        {{salaries}}
Marketing:             {{marketing}}
Software/Tools:        {{software}}
Insurance:             {{insurance}}
TOTAL EXPENSES:        {{totalExpenses}}

NET INCOME:            {{netIncome}}`
}
