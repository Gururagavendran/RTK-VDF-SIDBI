import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const unitEconomicsRows = [
  "Net Revenue",
  "COGS",
  "GM",
  "GM%",
  "Logistic expenses",
  "GM1",
  "GM1%",
  "Marketing Cost",
  "GM2",
  "GM2%",
  "Employee Cost",
  "Admin/Infra Cost",
  "Indirect Expenses",
  "EBITDA",
  "EBITDA %",
];

const generateMonthColumns = () => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const now = new Date();
  const cols: string[] = [];
  for (let i = 9; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    cols.push(`${months[d.getMonth()]}-${String(d.getFullYear()).slice(2)}`);
  }
  return cols;
};

export const monthColumns = generateMonthColumns();
export { unitEconomicsRows };

interface UnitEconomicsGridProps {
  data: Record<string, Record<string, string>>;
  onDataChange: (row: string, col: string, value: string) => void;
}

const UnitEconomicsGrid = ({
  data,
  onDataChange,
}: UnitEconomicsGridProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Unit Economics</CardTitle>
      <CardDescription>Amounts in ₹ Crore</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground min-w-[150px]">
                Particulars
              </th>
              {monthColumns.map((m) => (
                <th
                  key={m}
                  className="px-2 py-2 text-center font-medium text-muted-foreground min-w-[90px]"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unitEconomicsRows.map((row) => (
              <tr key={row} className="border-b last:border-b-0">
                <td className="px-3 py-1.5 font-medium text-foreground whitespace-nowrap">
                  {row}
                </td>
                {monthColumns.map((col) => (
                  <td key={col} className="px-1 py-1.5">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={data[row]?.[col] ?? ""}
                      onChange={(e) => onDataChange(row, col, e.target.value)}
                      placeholder="0.00"
                      className="text-center h-8 text-xs"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export default UnitEconomicsGrid;
