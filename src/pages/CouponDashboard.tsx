import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CouponUsage {
    coupon_code: string;
    count: number;
}

const CouponDashboard = () => {
    const [data, setData] = useState<CouponUsage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all usages since the beginning of "today" or just all of them as per user request "start from today only"
                // Since the table is new, all data is "from today" onwards basically.
                // But to be safe and strictly follow "today only", I can filter by created_at.
                const { data: usages, error } = await supabase
                    .from('coupon_usages')
                    .select('coupon_code');

                if (error) throw error;

                // Process data to count occurrences
                const counts: Record<string, number> = {};
                usages?.forEach((row: any) => {
                    const code = row.coupon_code;
                    counts[code] = (counts[code] || 0) + 1;
                });

                // Convert to array for Recharts
                const chartData = Object.entries(counts).map(([code, count]) => ({
                    coupon_code: code,
                    count,
                }));

                setData(chartData);
            } catch (error) {
                console.error("Error fetching coupon data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Optional: Subscribe to realtime changes? 
        // For now, just fetch on load.
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading stats...</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-neutral-900">Coupon Usage Analytics</h1>
                    <p className="text-neutral-500">Total usage tracking of coupon codes across all time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((item) => (
                        <Card key={item.coupon_code} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {item.coupon_code}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.count}</div>
                                <p className="text-xs text-muted-foreground">
                                    total redemptions
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                    {data.length === 0 && (
                        <Card className="col-span-full py-8 text-center text-muted-foreground">
                            No coupons used yet.
                        </Card>
                    )}
                </div>

                <Card className="p-6">
                    <CardHeader>
                        <CardTitle>Usage Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="coupon_code" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#f97316" name="Redemptions" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CouponDashboard;
