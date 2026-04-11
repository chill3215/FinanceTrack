import {ArrowDownRight, ArrowUpRight} from "lucide-react";

function StatCard({ label, value, change, isPositive, icon }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {change}
                </div>
            </div>
            <div>
                <span className="text-slate-500 text-sm font-medium">{label}</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{value}</h2>
            </div>
        </div>
    );
}

export default StatCard;