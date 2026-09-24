"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createClassroom } from "@/lib/classroom";

interface CreateClassroomModalProps {
  onCreated: () => void;
}

export function CreateClassroomModal({ onCreated }: CreateClassroomModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [startingBalance, setStartingBalance] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createClassroom({ name, startingBalance });
      setName("");
      setStartingBalance(10000);
      setIsOpen(false);
      onCreated();
    } catch (err: any) {
      setError(err?.message || "Failed to create classroom.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors w-full sm:w-auto justify-center"
      >
        <Plus className="h-4 w-4" />
        <span>Create New Classroom</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 rounded-lg p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Create Classroom</h3>
            <p className="text-xs text-slate-500 mb-6">
              Set up a new virtual classroom and assign starting virtual capital to your students.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classroom Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finance 101 - Fall 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Starting Balance per Student (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min={1000}
                    max={1000000}
                    step={1000}
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 pl-8 pr-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: ₹10,000 (Min: ₹1,000 | Max: ₹10,00,000)
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Create Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
