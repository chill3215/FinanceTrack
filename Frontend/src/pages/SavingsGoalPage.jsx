import React, { useEffect, useMemo, useState } from "react";
import {
    Target,
    PiggyBank,
    CheckCircle2,
    Plus,
    Calendar,
    TrendingUp,
    Trash2,
    Edit2,
    Save,
    X,
    ArrowRight,
    Sparkles,
    Calculator
} from "lucide-react";
import { format } from "d3-format";

const currencyFormat = format(",.2f");

function getMonthDifference(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, diff);
}

export default function SavingsGoalPage({ refreshKey }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editCurrentAmount, setEditCurrentAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, [BACKEND_URL, refreshKey]);

  function normalizeGoal(goal) {
    return {
      ...goal,
      id: goal._id || goal.id,
      targetAmount: Number(goal.targetAmount || 0),
      currentAmount: Number(goal.currentAmount || 0),
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : "",
    };
  }

  async function loadGoals() {
    setLoading(true);
    const token = localStorage.getItem("jwtToken");

    try {
      const res = await fetch(`${BACKEND_URL}/savings-goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to load savings goals", res.status);
        return;
      }

      const data = await res.json();
      setGoals(data.map(normalizeGoal));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(goal) {
    setEditingGoalId(goal.id);
    setEditCurrentAmount(goal.currentAmount?.toString() ?? "");
  }

  function cancelEdit() {
    setEditingGoalId(null);
    setEditCurrentAmount("");
  }

  async function saveCurrentGoal(goalId) {
    const parsed = Number(editCurrentAmount);
    if (Number.isNaN(parsed) || parsed < 0) return;

    const token = localStorage.getItem("jwtToken");
    try {
      const res = await fetch(`${BACKEND_URL}/savings-goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentAmount: parsed }),
      });

      if (!res.ok) {
        console.error("Failed to save goal", res.status);
        return;
      }

      const updated = normalizeGoal(await res.json());
      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? updated : goal)));
      cancelEdit();
    } catch (error) {
      console.error(error);
    }
  }

  async function addGoal(event) {
    event.preventDefault();
    const parsedTargetAmount = Number(targetAmount);
    const parsedCurrentAmount = Number(currentAmount) || 0;

    if (!goalName || !targetDate || parsedTargetAmount <= 0) return;

    const token = localStorage.getItem("jwtToken");
    try {
      const res = await fetch(`${BACKEND_URL}/savings-goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: goalName,
          targetAmount: parsedTargetAmount,
          currentAmount: parsedCurrentAmount,
          targetDate,
        }),
      });

      if (!res.ok) {
        console.error("Failed to add savings goal", res.status);
        return;
      }

      const created = normalizeGoal(await res.json());
      setGoals((prev) => [created, ...prev]);
      setGoalName("");
      setTargetAmount("");
      setTargetDate("");
      setCurrentAmount("");
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteGoal(id) {
    const token = localStorage.getItem("jwtToken");

    try {
      const res = await fetch(`${BACKEND_URL}/savings-goals/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to delete savings goal", res.status);
        return;
      }

      setGoals((prev) => prev.filter((goal) => goal.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  const grandTotal = useMemo(
    () => goals.reduce((sum, goal) => sum + Number(goal.targetAmount || 0), 0),
    [goals]
  );

  const totalSaved = useMemo(
    () => goals.reduce((sum, goal) => sum + Number(goal.currentAmount || 0), 0),
    [goals]
  );

  const completedGoals = useMemo(
    () => goals.filter((goal) => Number(goal.currentAmount) >= Number(goal.targetAmount)).length,
    [goals]
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Savings Goals</h1>
          <p className="text-slate-500 font-medium">Plan your future and track your progress in real-time.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Sparkles size={14} className="text-amber-500" />
            Financial Planning
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            label="Active Goals"
            value={goals.length.toString()}
            icon={<Target size={22} />}
            color="blue"
        />
        <StatCard 
            label="Total Target"
            value={`€${currencyFormat(grandTotal)}`}
            icon={<PiggyBank size={22} />}
            color="amber"
            subtitle={`${((totalSaved / (grandTotal || 1)) * 100).toFixed(1)}% overall progress`}
        />
        <StatCard 
            label="Milestones Hit"
            value={completedGoals.toString()}
            icon={<CheckCircle2 size={22} />}
            color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Goal Planner Form */}
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 group">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Plus size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New Goal</h2>
            </div>

            <form onSubmit={addGoal} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">What are you saving for?</label>
                <input
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden placeholder:text-slate-300"
                  placeholder="e.g. Dream House, New Car, emergency Fund"
                />
              </div>
              
              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Target Amount (€)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 font-bold">€</div>
                    <input
                        type="number"
                        min="0"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
                        placeholder="0.00"
                    />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Target Date</label>
                <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
                    />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Initial Amount (Optional)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 font-bold">€</div>
                    <input
                        type="number"
                        min="0"
                        value={currentAmount}
                        onChange={(e) => setCurrentAmount(e.target.value)}
                        className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
                        placeholder="0.00"
                    />
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-sm py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 duration-300"
                >
                  <Save size={20} />
                  Persist Savings Goal
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Monthly Plan Insight */}
        <div className="xl:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                
                <div className="relative">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                            <Calculator size={20} className="text-blue-400" />
                        </div>
                        <h2 className="text-xl font-black italic">Strategy Plan</h2>
                    </div>

                    {goals.length === 0 ? (
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Start adding goals to unlock your hyper-automated savings strategy breakdown.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {goals.map((goal) => {
                                const months = getMonthDifference(new Date(), goal.targetDate);
                                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                                const monthly = remaining / months;
                                const isCompleted = remaining === 0;

                                return (
                                    <div key={goal.id} className="pb-6 border-b border-white/5 last:border-0 last:pb-0 group">
                                        <p className="font-black text-sm text-blue-100 uppercase tracking-wider mb-2 group-hover:text-blue-400 transition-colors">{goal.name}</p>
                                        {isCompleted ? (
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                                <CheckCircle2 size={14} />
                                                Goal Achieved!
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl font-black">€{currencyFormat(monthly)}</div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">/ month</div>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-500 mt-2 font-bold italic">
                                            {isCompleted ? "Fully funded" : `Calculated for ${months} months remaining`}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Goals Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden">
        <div className="px-8 py-7 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
            <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Milestones</h3>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider italic">Historical tracking of your financial ambitions.</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase px-3 py-1.5 bg-white rounded-xl border border-slate-200">
                    {goals.length} ACTIVE
                </span>
            </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                  <TrendingUp size={32} className="text-slate-300 animate-pulse" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Loading your savings goals…</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                  <TrendingUp size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-400 text-sm font-black uppercase tracking-widest">No ambitions detected.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="px-8 py-6">Objective</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right">Target</th>
                  <th className="px-8 py-6 text-right">Amassed</th>
                  <th className="px-8 py-6 text-right">Deficit</th>
                  <th className="px-8 py-6 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-900">
                {goals.map((goal) => {
                  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
                  const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
                  const isCompleted = remaining === 0;

                  return (
                    <tr key={goal.id} className="group hover:bg-slate-50/70 transition-all cursor-pointer">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="font-black text-sm tracking-tight mb-1">{goal.name}</span>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <Calendar size={12} />
                                {goal.targetDate}
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2 min-w-[120px]">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                                <div 
                                    className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                            <span className={`text-[10px] font-black italic tracking-widest ${isCompleted ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {progress.toFixed(0)}% Complete
                            </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-sm">€{currencyFormat(goal.targetAmount)}</td>
                      <td className="px-8 py-6 text-right">
                        {editingGoalId === goal.id ? (
                          <div className="flex items-center justify-end">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600 font-bold text-xs">€</div>
                                <input
                                    type="number"
                                    min="0"
                                    value={editCurrentAmount}
                                    onChange={(e) => setEditCurrentAmount(e.target.value)}
                                    className="w-28 rounded-xl border border-blue-200 bg-blue-50 pl-7 pr-3 py-2 text-sm font-black text-blue-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                                    autoFocus
                                />
                            </div>
                          </div>
                        ) : (
                          <span className="font-black text-sm text-slate-900 italic">€{currencyFormat(goal.currentAmount)}</span>
                        )}
                      </td>
                      <td className={`px-8 py-6 text-right font-black text-sm ${isCompleted ? 'text-emerald-500 italic' : 'text-slate-400'}`}>
                        {isCompleted ? "GOAL HIT" : `€${currencyFormat(remaining)}`}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                            {editingGoalId === goal.id ? (
                            <>
                                <button
                                    onClick={() => saveCurrentGoal(goal.id)}
                                    className="w-9 h-9 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                                    title="Save changes"
                                >
                                    <CheckCircle2 size={18} />
                                </button>
                                <button
                                    onClick={() => cancelEdit()}
                                    className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                                    title="Cancel edit"
                                >
                                    <X size={18} />
                                </button>
                            </>
                            ) : (
                            <>
                                <button
                                    onClick={() => startEdit(goal)}
                                    className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                                    title="Edit progress"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                                    title="Remove goal"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle, icon, color }) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
    };

    return (
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-500 group overflow-hidden relative">
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-slate-50 group-hover:scale-150 transition-transform duration-700 opacity-50`} />
            
            <div className="relative">
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl shadow-sm border ${colorMap[color] || colorMap.blue} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        {icon}
                    </div>
                </div>
                
                <hgroup>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                    {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-2 italic flex items-center gap-1">
                        <ArrowRight size={10} className="text-blue-500" />
                        {subtitle}
                    </p>}
                </hgroup>
            </div>
        </div>
    );
}
