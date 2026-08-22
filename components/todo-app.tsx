"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  getPriorityClassName,
  getPriorityLabel,
  PRIORITY,
  PRIORITY_OPTIONS,
  type Priority,
} from "@/lib/priority";
import type { Tables } from "@/types/database.types";

type Todo = Tables<"todos">;

type TodoAppProps = {
  user: User;
};

export function TodoApp({ user }: TodoAppProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>(PRIORITY.MEDIUM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingPriority, setEditingPriority] = useState<Priority>(PRIORITY.MEDIUM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTodos = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("todos")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setTodos(data ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError(null);
      await loadTodos();
      if (!cancelled) {
        setLoading(false);
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [loadTodos]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("todos").insert({
      title: trimmed,
      priority,
      user_id: user.id,
      completed: false,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setPriority(PRIORITY.MEDIUM);
    await loadTodos();
  }

  async function handleToggle(todo: Todo) {
    setError(null);
    const { error: updateError } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", todo.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadTodos();
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
    setEditingPriority((todo.priority ?? PRIORITY.LOW) as Priority);
  }

  async function handleSaveEdit(todoId: string) {
    const trimmed = editingTitle.trim();
    if (!trimmed) return;

    setError(null);
    const { error: updateError } = await supabase
      .from("todos")
      .update({ title: trimmed, priority: editingPriority })
      .eq("id", todoId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setEditingId(null);
    await loadTodos();
  }

  async function handleDelete(todoId: string) {
    setError(null);
    const { error: deleteError } = await supabase.from("todos").delete().eq("id", todoId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    if (editingId === todoId) {
      setEditingId(null);
    }

    await loadTodos();
  }

  async function handleLogout() {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">TODO</h1>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          ログアウト
        </button>
      </header>

      <form
        onSubmit={handleAdd}
        className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="新しいTODOを入力"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-400 focus:ring-2"
          />
          <select
            value={priority}
            onChange={(event) => setPriority(Number(event.target.value) as Priority)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2"
            aria-label="優先度"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                優先度: {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "追加中..." : ""}
          </button>
        </div>
      </form>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">読み込み中...</p>
        ) : todos.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">TODOはまだありません。</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {todos.map((todo) => (
              <li key={todo.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={Boolean(todo.completed)}
                    onChange={() => void handleToggle(todo)}
                    className="mt-1 size-4 rounded border-slate-300"
                    aria-label={`${todo.title}を完了にする`}
                  />
                  {editingId === todo.id ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-slate-900 outline-none ring-slate-400 focus:ring-2"
                      />
                      <select
                        value={editingPriority}
                        onChange={(event) =>
                          setEditingPriority(Number(event.target.value) as Priority)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2"
                        aria-label="優先度を編集"
                      >
                        {PRIORITY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words text-sm font-medium ${
                          todo.completed ? "text-slate-400 line-through" : "text-slate-900"
                        }`}
                      >
                        {todo.title}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getPriorityClassName(
                          todo.priority,
                        )}`}
                      >
                        優先度 {getPriorityLabel(todo.priority)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 sm:shrink-0">
                  {editingId === todo.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleSaveEdit(todo.id)}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(todo)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(todo.id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        削除
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
