
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon,
  trend
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <div className="flex items-center">
            <p className="text-xs text-muted-foreground">{description}</p>
            {trend && (
              <span 
                className={`ml-2 text-xs ${
                  trend.positive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
