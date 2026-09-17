import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, FileText, CheckCircle2 } from "lucide-react";

export default function AICalculatorResults({ calc }) {
  if (!calc || !calc.lines) return null;

  return (
    <Card className="my-3 bg-card border border-border rounded-2xl shadow-md overflow-hidden text-left">
      <CardHeader className="bg-muted/50 pb-3 pt-4 px-4 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 text-[#F5A623] dark:text-[#D4AF37]">
            <Calculator size={18} />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Transfer Expense Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {calc.society} - {calc.phase} ({calc.size_marla} Marla {calc.property_type})
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 text-[#F5A623] dark:text-[#D4AF37]">
            {calc.taxpayer_status} ({calc.payer})
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-3 rounded-xl border border-border">
          <div>
            <span className="text-muted-foreground block">DC Valuation</span>
            <span className="font-bold text-foreground">Rs. {Number(calc.dc_value || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">FBR Valuation</span>
            <span className="font-bold text-foreground">Rs. {Number(calc.fbr_value || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs divide-y divide-border/60">
          {calc.lines.map((line, idx) => (
            <div key={idx} className="flex justify-between pt-2 first:pt-0">
              <span className="text-muted-foreground">{line.label}</span>
              <span className="font-semibold text-foreground">Rs. {Number(line.amount || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex justify-between items-center bg-[#F5A623]/5 dark:bg-[#D4AF37]/5 p-3 rounded-xl">
          <span className="text-sm font-bold text-foreground">Grand Total Estimate</span>
          <span className="text-base font-extrabold text-[#F5A623] dark:text-[#D4AF37]">
            Rs. {Number(calc.grand_total || 0).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
