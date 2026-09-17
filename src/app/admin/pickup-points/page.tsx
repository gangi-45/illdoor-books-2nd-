import type { Metadata } from 'next';
import { getPickupPoints } from '@/lib/services/pickup';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Phone, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pickup Points | Admin Console',
};

export default async function AdminPickupPointsPage() {
  const pickupPoints = await getPickupPoints();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campus Pickup Points</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Designated counters for physical textbook drop-off and pickup exchange.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pickupPoints.map((point) => (
          <Card key={point.id} className="bg-card border shadow-xs">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{point.name}</h3>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {point.location_description}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-brand/10 text-brand shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>

              <div className="border-t pt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand" />
                  Hours: {point.opening_time?.slice(0, 5) || '09:00'} - {point.closing_time?.slice(0, 5) || '17:00'}
                </span>
                {point.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-brand" />
                    Phone: {point.phone}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
