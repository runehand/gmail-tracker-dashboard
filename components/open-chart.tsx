import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OpenChart({ data }: { data: { date: string; opens: number }[] }) {
  const max = Math.max(...data.map((item) => item.opens), 1);
  const points = data.length
    ? data.map((item, index) => {
        const x = data.length === 1 ? 300 : (index / (data.length - 1)) * 600;
        const y = 170 - (item.opens / max) * 140;
        return `${x},${y}`;
      }).join(" ")
    : "";

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Open Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          {data.length ? (
            <svg viewBox="0 0 600 190" className="h-full w-full">
              <line x1="0" y1="170" x2="600" y2="170" stroke="hsl(var(--border))" />
              <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
              {data.map((item, index) => {
                const x = data.length === 1 ? 300 : (index / (data.length - 1)) * 600;
                const y = 170 - (item.opens / max) * 140;
                return <circle key={item.date} cx={x} cy={y} r="5" fill="hsl(var(--accent))" />;
              })}
            </svg>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No opens yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
