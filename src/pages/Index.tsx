import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface PricePoint {
  time: string;
  price: number;
}

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  priceHistory: PricePoint[];
}

interface Signal {
  type: 'buy' | 'sell' | 'neutral';
  indicator: string;
  value: number;
  strength: number;
}

interface Alert {
  id: string;
  crypto: string;
  condition: string;
  price: number;
  active: boolean;
}

const generatePriceHistory = (currentPrice: number, change24h: number): PricePoint[] => {
  const points: PricePoint[] = [];
  const hours = 24;
  const startPrice = currentPrice / (1 + change24h / 100);
  
  for (let i = 0; i < hours; i++) {
    const progress = i / (hours - 1);
    const trend = startPrice + (currentPrice - startPrice) * progress;
    const noise = (Math.random() - 0.5) * (currentPrice * 0.02);
    const price = trend + noise;
    
    points.push({
      time: `${i}:00`,
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return points;
};

const mockCryptoData: CryptoData[] = [
  { 
    id: '1', 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    price: 43250.50, 
    change24h: 2.45, 
    volume: 28500000000, 
    marketCap: 847000000000,
    priceHistory: generatePriceHistory(43250.50, 2.45)
  },
  { 
    id: '2', 
    name: 'Ethereum', 
    symbol: 'ETH', 
    price: 2285.30, 
    change24h: -1.23, 
    volume: 15200000000, 
    marketCap: 275000000000,
    priceHistory: generatePriceHistory(2285.30, -1.23)
  },
  { 
    id: '3', 
    name: 'Solana', 
    symbol: 'SOL', 
    price: 98.75, 
    change24h: 5.67, 
    volume: 2800000000, 
    marketCap: 42000000000,
    priceHistory: generatePriceHistory(98.75, 5.67)
  },
  { 
    id: '4', 
    name: 'Cardano', 
    symbol: 'ADA', 
    price: 0.52, 
    change24h: -0.85, 
    volume: 320000000, 
    marketCap: 18000000000,
    priceHistory: generatePriceHistory(0.52, -0.85)
  },
  { 
    id: '5', 
    name: 'Polkadot', 
    symbol: 'DOT', 
    price: 7.34, 
    change24h: 3.21, 
    volume: 280000000, 
    marketCap: 9500000000,
    priceHistory: generatePriceHistory(7.34, 3.21)
  },
];

const mockSignals: Signal[] = [
  { type: 'buy', indicator: 'RSI (14)', value: 32, strength: 75 },
  { type: 'sell', indicator: 'MACD', value: -0.45, strength: 60 },
  { type: 'buy', indicator: 'MA (50)', value: 42800, strength: 85 },
  { type: 'neutral', indicator: 'Bollinger Bands', value: 0, strength: 45 },
];

const Index = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData>(mockCryptoData[0]);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', crypto: 'BTC', condition: 'Above', price: 45000, active: true },
    { id: '2', crypto: 'ETH', condition: 'Below', price: 2200, active: false },
  ]);
  const [newAlertPrice, setNewAlertPrice] = useState('');

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const addAlert = () => {
    if (newAlertPrice) {
      const newAlert: Alert = {
        id: Date.now().toString(),
        crypto: selectedCrypto.symbol,
        condition: 'Above',
        price: parseFloat(newAlertPrice),
        active: true,
      };
      setAlerts([...alerts, newAlert]);
      setNewAlertPrice('');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Крипто Анализ</h1>
            <p className="text-muted-foreground">Торговые сигналы и мониторинг рынка</p>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" size={32} className="text-primary" />
          </div>
        </div>

        <Tabs defaultValue="markets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <Icon name="LineChart" size={16} />
              Рынки
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <Icon name="Target" size={16} />
              Анализ
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Icon name="Bell" size={16} />
              Алерты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="space-y-4">
            <div className="grid gap-4">
              {mockCryptoData.map((crypto) => (
                <Card 
                  key={crypto.id} 
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCrypto(crypto)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="Bitcoin" size={24} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{crypto.name}</h3>
                          <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <p className="text-2xl font-bold">{formatNumber(crypto.price)}</p>
                        <Badge 
                          variant={crypto.change24h >= 0 ? "default" : "destructive"}
                          className={crypto.change24h >= 0 ? "bg-success" : ""}
                        >
                          <Icon name={crypto.change24h >= 0 ? "TrendingUp" : "TrendingDown"} size={12} className="mr-1" />
                          {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={80}>
                        <LineChart data={crypto.priceHistory}>
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke={crypto.change24h >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Объем 24ч</p>
                        <p className="text-sm font-semibold">{formatNumber(crypto.volume)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Капитализация</p>
                        <p className="text-sm font-semibold">{formatNumber(crypto.marketCap)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Activity" size={20} />
                  Торговые сигналы для {selectedCrypto.symbol}
                </CardTitle>
                <CardDescription>
                  Технические индикаторы и рекомендации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockSignals.map((signal, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          signal.type === 'buy' ? 'bg-success/10' : 
                          signal.type === 'sell' ? 'bg-destructive/10' : 'bg-muted'
                        }`}>
                          <Icon 
                            name={signal.type === 'buy' ? 'ArrowUp' : signal.type === 'sell' ? 'ArrowDown' : 'Minus'} 
                            size={20}
                            className={
                              signal.type === 'buy' ? 'text-success' : 
                              signal.type === 'sell' ? 'text-destructive' : 'text-muted-foreground'
                            }
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{signal.indicator}</p>
                          <p className="text-sm text-muted-foreground">
                            {signal.type === 'buy' ? 'Сигнал на покупку' : 
                             signal.type === 'sell' ? 'Сигнал на продажу' : 'Нейтральный'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline"
                          className={
                            signal.type === 'buy' ? 'border-success text-success' : 
                            signal.type === 'sell' ? 'border-destructive text-destructive' : ''
                          }
                        >
                          {signal.value.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Сила сигнала</span>
                        <span className="font-semibold">{signal.strength}%</span>
                      </div>
                      <Progress value={signal.strength} className="h-2" />
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-border">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Icon name="Lightbulb" size={20} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Общая рекомендация</p>
                        <p className="text-sm text-muted-foreground">
                          Большинство индикаторов указывают на возможность покупки. 
                          RSI в зоне перепроданности, MA50 показывает восходящий тренд.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bell" size={20} />
                  Ценовые алерты
                </CardTitle>
                <CardDescription>
                  Создавайте уведомления при достижении целевой цены
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`Цена для ${selectedCrypto.symbol}`}
                      value={newAlertPrice}
                      onChange={(e) => setNewAlertPrice(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addAlert} className="gap-2">
                      <Icon name="Plus" size={16} />
                      Добавить
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon name="Bell" size={20} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{alert.crypto}</p>
                              <p className="text-sm text-muted-foreground">
                                {alert.condition} {formatNumber(alert.price)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={alert.active}
                                onCheckedChange={() => toggleAlert(alert.id)}
                              />
                              <Label className="text-xs text-muted-foreground">
                                {alert.active ? 'Активен' : 'Выключен'}
                              </Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="BellOff" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Нет активных алертов</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;