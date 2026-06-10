import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeviceChart({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length ? data.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-accent"
                style={{ width: `${Math.max(4, (item.value / total) * 100)}%` }}
              />
            </div>
          </div>
        )) : (
          <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">No device data yet</div>
        )}
      </CardContent>
    </Card>
  );
}
